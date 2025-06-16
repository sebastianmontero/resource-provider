import {
    Name,
    APIClient,
    PermissionLevel,
    Serializer,
    Transaction,
    Asset,
    UInt64,
    API,
    TransactionHeader,
} from '@wharfkit/antelope'
import {Elysia, Static} from 'elysia'

import {logger} from '../logger'
import {createSigningRequest} from '../lib/signing-request'
import {ResolvedSigningRequest, SigningRequest} from '@wharfkit/signing-request'
import {
    v1Request,
    v1RequestBody,
    v1ResponseRejected,
    v1ResponseResources,
    v1ResponseRequiresPayment,
    v1ResponseSuccess,
    v1ResponseTypes,
} from './types'
import {Contract as NoopContract} from '../lib/contracts/noop'
import {Contract as SystemContract} from '../lib/contracts/system'
import {Contract as TokenContract} from '../lib/contracts/token'
import {session} from '../lib/session'

if (!Bun.env.PROVIDER_ACCOUNT_NAME) {
    throw new Error('PROVIDER_ACCOUNT_NAME environment variable is not set')
}

if (!Bun.env.PROVIDER_ACCOUNT_PERMISSION) {
    throw new Error('PROVIDER_ACCOUNT_PERMISSION environment variable is not set')
}

const cosigner = PermissionLevel.from({
    actor: Bun.env.PROVIDER_ACCOUNT_NAME,
    permission: Bun.env.PROVIDER_ACCOUNT_PERMISSION,
})

export function resolvePermissionLevel(signer: any): PermissionLevel {
    if (!signer.actor || String(Name.from(signer.actor)) !== signer.actor) {
        throw new Error('Invalid actor in signer')
    }
    if (!signer.permission || String(Name.from(signer.permission)) !== signer.permission) {
        throw new Error('Invalid permission in signer')
    }
    return PermissionLevel.from({
        actor: signer.actor,
        permission: signer.permission,
    })
}

const client = new APIClient({url: Bun.env.ANTELOPE_NODEOS_API})
const noopContract = new NoopContract({client})
const systemContract = new SystemContract({client})
const tokenContract = new TokenContract({client})

export async function getSignerResources(requester: PermissionLevel) {
    const response = await client.v1.chain.get_account('greymassfuel')
    logger.info('data', Serializer.objectify(response))
    return {
        cpu: response.cpu_limit.available,
        net: response.net_limit.available,
        ram: response.ram_quota.subtracting(response.ram_usage),
    }
}

function addNoopAction(transaction: Transaction): Transaction {
    const modified = Transaction.from(transaction)
    modified.actions.unshift(noopContract.action('noop', {}, {authorization: [cosigner]}))
    return modified
}

function addFeeAction(
    transaction: Transaction,
    requester: PermissionLevel,
    fee: Asset
): Transaction {
    const modified = Transaction.from(transaction)
    modified.actions.push(
        tokenContract.action('transfer', {
            from: requester.actor,
            to: cosigner.actor,
            quantity: fee,
            memo: 'Resource Provider Fee',
        })
    )
    return modified
}

function addRAMAction(
    transaction: Transaction,
    requestor: PermissionLevel,
    bytes: UInt64
): Transaction {
    const modified = Transaction.from(transaction)
    modified.actions.push(
        systemContract.action(
            'buyrambytes',
            {
                payer: cosigner.actor,
                receiver: requestor.actor,
                bytes,
            },
            {authorization: [cosigner]}
        )
    )
    return modified
}

// Generate 2k drops (use RAM, force purchase)
// gmNgZACDmJe-QFJr9uplSYxQIQYmKB0JE2C4wM7A4GBqnGqRlpaUamFqaZZqlmSRaJyUaG5smWZuaWRilpxkZmJiYGmSZmBqnJxikpaYkmhqamxuYWmZYpxsZG6WmJoMN40RCBkA

function cpuMedian(samples: API.v1.SendTransactionResponse[]): number {
    const estimates = samples.map((s) => s.processed.elapsed).sort((a, b) => a - b)
    const middle = Math.floor(estimates.length / 2)
    return estimates.length % 2 !== 0
        ? estimates[middle]
        : Math.floor((estimates[middle - 1] + estimates[middle]) / 2)
}

function determineResourceNeeds(
    samples: API.v1.SendTransactionResponse[]
): Static<typeof v1ResponseResources> {
    const cpu = cpuMedian(samples)
    const net = samples[0].processed.net_usage
    let ram = 0
    const exception = samples[0].processed.except
    if (exception && exception.name) {
        switch (exception.name) {
            case 'ram_usage_exceeded': {
                const data: {
                    account: string
                    needs: number
                    available: number
                } = exception.stack[0].data
                const {available, needs} = data
                const bytes = needs - available
                ram = bytes
                break
            }
            default: {
                throw new Error(`${exception.name}: ${exception.message}`)
            }
        }
    }
    return {cpu, net, ram}
}

async function compute(
    transaction: Transaction,
    iterations: number = 5
): Promise<Static<typeof v1ResponseResources>> {
    const samples = await Promise.all(
        [...Array(iterations)].map(() => client.v1.chain.compute_transaction(transaction))
    )
    return determineResourceNeeds(samples)
}

async function getTransactionHeader(expireSeconds = 300): Promise<TransactionHeader> {
    const info = await client.v1.chain.get_info()
    return info.getTransactionHeader(expireSeconds)
}

async function resolveRequest(
    request: SigningRequest,
    requester: PermissionLevel
): Promise<ResolvedSigningRequest> {
    const abis = await request.fetchAbis()
    const header = await getTransactionHeader()
    return request.resolve(abis, requester, header)
}

async function resolveTransaction(
    request: SigningRequest,
    requester: PermissionLevel
): Promise<Transaction> {
    const resolved = await resolveRequest(request, requester)
    return Transaction.from(resolved.transaction)
}

function validateRequest(request: SigningRequest): void {
    const actions = request.getRawActions()
    logger.debug('actions', JSON.stringify(actions))

    // Refuse identity requests
    if (request.isIdentity()) {
        throw new Error('Identity requests are not allowed.')
    }

    // Refuse requests that contain actions containing the cosigners authorization
    if (
        actions.some((action) =>
            action.authorization.some((auth) => auth.actor.equals(cosigner.actor))
        )
    ) {
        throw new Error('Actions cannot contain the authority of the cosigner.')
    }
}

function validateRequester(requester: PermissionLevel): void {
    // Refuse to sign requests where the requestor is the same as the cosigner
    if (requester.actor.equals(cosigner.actor)) {
        throw new Error('Signer cannot be the cosigner.')
    }
}

async function handleRequest(
    request: SigningRequest,
    requester: PermissionLevel
): Promise<v1ResponseTypes> {
    // Validate the request and requester
    validateRequest(request)
    validateRequester(requester)

    // Create a transaction to modify and use in the response
    const transaction = await resolveTransaction(request, requester)

    const resources = await compute(transaction)

    // transaction = addFeeAction(transaction, requester, Asset.fromString('0.0001 EOS'))
    // transaction = addRAMAction(transaction, requester, UInt64.from(8192))
    // transaction = addNoopAction(transaction)

    const signatures = await session.signTransaction(transaction)

    return {
        code: 200,
        data: {
            request: ['transaction', transaction],
            resources,
            signatures: Serializer.objectify(signatures),
        },
    }
}

async function request(body: Static<typeof v1RequestBody>): Promise<v1ResponseTypes> {
    const request = await createSigningRequest(body)
    const requester = resolvePermissionLevel(body.signer)
    return handleRequest(request, requester)
}

export const v1 = new Elysia()
    .post(
        '/v1/resource_provider/request_transaction',
        async (context) => request(context.body),
        v1Request
    )
    .onError((context): Static<typeof v1ResponseRejected> => {
        switch (context.code) {
            case 'VALIDATION':
                return {
                    code: 400,
                    message: String(context.error),
                    error: context.error.all,
                }
            default:
                return {
                    code: 400,
                    message: String(context.error),
                }
        }
    })
