import {Static, t} from 'elysia'
import {TSigner, TTransaction, TPackedTransaction} from '../lib/types'

export const v1RequestBody = t.Object(
    {
        signer: TSigner,
        request: t.Optional(t.String()),
        transaction: t.Optional(TTransaction),
        packedTransaction: t.Optional(TPackedTransaction),
    },
    {
        examples: [
            {
                signer: {
                    actor: 'test.gm',
                    permission: 'active',
                },
                request:
                    'esr://gmNgZGBY1mTC_MoglIGBIVzX5uxZRqAQGDBBaWeYAINP360cgcXzYHwWRwitFJRanF9alJyqUFCUX5aZklqkUJJaXKJQUpSYV5yYXJKZnwfUAgA',
            },
        ],
    }
)

export const v1RequestResponseType = t.Tuple([t.String(), t.Any()])

export const v1ResponseResources = t.Object({
    cpu: t.Numeric(),
    net: t.Numeric(),
    ram: t.Numeric(),
})

export const v1ResponseSuccess = t.Object(
    {
        code: t.Number(),
        data: t.Object({
            request: v1RequestResponseType,
            resources: v1ResponseResources,
            signatures: t.Array(t.String()),
        }),
    },
    {
        description:
            'Successful request returning a transaction modified to include a noop action.',
    }
)

export const v1ResponseRejected = t.Object(
    {
        code: t.Number(),
        message: t.Optional(t.String()),
        error: t.Optional(t.Any()),
    },
    {
        description: 'Failed request with an error message stating a rejection reason.',
    }
)

export const v1ResponseRequiresPayment = t.Object(
    {
        code: t.Number(),
        data: t.Object({
            costs: t.Optional(
                t.Object({
                    cpu: t.Optional(t.String()),
                    net: t.Optional(t.String()),
                    ram: t.Optional(t.String()),
                })
            ),
            fee: t.Optional(t.String()),
            request: v1RequestResponseType,
            resources: v1ResponseResources,
            signatures: t.Array(t.String()),
        }),
    },
    {
        description:
            'Successful request returning a transaction modified to include a transaction fee and noop action.',
    }
)

export type v1ResponseTypes = Static<
    typeof v1ResponseSuccess | typeof v1ResponseRejected | typeof v1ResponseRequiresPayment
>

export const v1Request = {
    body: v1RequestBody,
    detail: {
        tags: ['v1'],
    },
    response: {
        200: v1ResponseSuccess,
        400: v1ResponseRejected,
        402: v1ResponseRequiresPayment,
    },
}
