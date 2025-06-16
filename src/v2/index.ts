import {Name, APIClient, PermissionLevel, Serializer} from '@wharfkit/antelope'
import {Elysia, Static} from 'elysia'

import {logger} from '../logger'
import {createSigningRequest} from '../lib/signing-request'
import {SigningRequest} from '@wharfkit/signing-request'
import {
    v2ResponseSuccess,
    v2RequestBody,
    v2Request,
    v2RequestPacked,
    v2RequestTransaction,
} from './types'

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

export async function getSignerResources(signer: PermissionLevel) {
    const client = new APIClient({url: Bun.env.ANTELOPE_NODEOS_API})
    const response = await client.v1.chain.get_account('greymassfuel')
    logger.info('data', Serializer.objectify(response))
    // net_limit: {
    // used: 96642,
    // available: 9903355,
    // max: 9999997,
    // last_usage_update_time: '2025-04-22T01:37:36.500',
    // current_used: 96119
    // },
    // cpu_limit: {
    // used: 240217,
    // available: 259845,
    // max: 500062,
    // last_usage_update_time: '2025-04-22T01:37:36.500',
    // current_used: 238917
    // },
    return {
        cpu: response.cpu_limit.available,
        net: response.net_limit.available,
        ram: response.ram_quota.subtracting(response.ram_usage),
    }
}

function validateRequest(request: SigningRequest) {
    logger.debug('validateRequest', {request: String(request)})
    if (request.isIdentity()) {
        throw new Error('Identity requests cannot be processed')
    }
}

async function handleRequest(
    request: SigningRequest,
    signer: PermissionLevel
): Promise<Static<typeof v2ResponseSuccess>> {
    validateRequest(request)

    return {
        code: 200,
        data: {
            request: ['transaction', 'foo'],
            signatures: ['asdfasdf'],
        },
    }
}

async function processRequest(
    body: Static<typeof v2RequestBody>
): Promise<Static<typeof v2ResponseSuccess>> {
    const request = await createSigningRequest(body)
    const signer = resolvePermissionLevel(body.signer)
    return handleRequest(request, signer)
}

export const v2 = new Elysia()
    .post(
        '/v2/resource_provider/request',
        async (context) => processRequest(context.body),
        v2Request
    )
    .post(
        '/v2/resource_provider/request_packed',
        async (context) => processRequest(context.body),
        v2RequestPacked
    )
    .post(
        '/v2/resource_provider/request_transaction',
        async (context) => processRequest(context.body),
        v2RequestTransaction
    )
    .onError((context) => {
        switch (context.code) {
            case 'VALIDATION':
                return {
                    message: String(context.error),
                    all: context.error.all,
                }
            default:
                return {
                    message: String(context.error),
                }
        }
    })
