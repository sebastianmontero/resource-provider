import ABICache from '@wharfkit/abicache'
import {APIClient, Name, PackedTransaction, Transaction} from '@wharfkit/antelope'
import {SigningRequest} from '@wharfkit/signing-request'
import {Static} from 'elysia'

import {logger} from '../logger'
import {TPackedTransaction, TTransaction} from './types'
import {v1RequestBody} from '../v1/types'

const cache = new ABICache(new APIClient({url: Bun.env.ANTELOPE_NODEOS_API}))

export const opts = {
    zlib: {
        deflateRaw: (data: Uint8Array) => Bun.deflateSync(Buffer.from(data)),
        inflateRaw: (data: Uint8Array) => Bun.inflateSync(Buffer.from(data)),
    },
    abiProvider: cache,
}

export async function createSigningRequestFromString(request: string): Promise<SigningRequest> {
    logger.debug('createSigningRequestFromString', {request})
    let payload = request
    if (!request.startsWith('esr:')) {
        payload = 'esr://' + request
    }
    return SigningRequest.from(payload, opts)
}

export async function createSigningRequestFromPackedTransaction(
    packedTransaction: Static<typeof TPackedTransaction>
): Promise<SigningRequest> {
    logger.debug('createSigningRequestFromPackedTransaction', {packedTransaction})
    const decoded = PackedTransaction.from(packedTransaction)
    return await SigningRequest.create(
        {
            transaction: decoded.getTransaction(),
        },
        opts
    )
}

export async function createSigningRequestFromTransaction(
    transaction: Static<typeof TTransaction>
): Promise<SigningRequest> {
    logger.debug('createSigningRequestFromTransaction', {transaction})
    const contracts = transaction.actions.map((action) => Name.from(action.account))
    const abis = await Promise.all(
        contracts.map(async (account) => ({
            contract: account,
            abi: await cache.getAbi(Name.from(account)),
        }))
    )
    return await SigningRequest.create(
        {
            transaction: Transaction.from(transaction, abis),
        },
        opts
    )
}

export async function createSigningRequest(
    body: Static<typeof v1RequestBody>
): Promise<SigningRequest> {
    logger.debug('createSigningRequest', {body})
    // console.log(JSON.stringify(body, null, 2))
    try {
        // EEP-8 Specification: Process based on ESR payload
        if (body.request) {
            return await createSigningRequestFromString(body.request)
        }

        // EEP-8 Specification: Process based on deserialized transaction
        if (body.transaction) {
            return await createSigningRequestFromTransaction(body.transaction)
        }

        // EEP-8 Specification: Process based on packed transaction
        if (body.packedTransaction) {
            return createSigningRequestFromPackedTransaction(body.packedTransaction)
        }
    } catch (error) {
        throw new Error('Error parsing request: ' + error)
    }

    throw new Error('No valid request found')
}
