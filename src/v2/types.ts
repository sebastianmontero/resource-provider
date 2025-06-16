import {t} from 'elysia'
import {TSigner, TTransaction, TPackedTransaction} from '../lib/types'

export const v2RequestBody = t.Object(
    {
        signer: TSigner,
        request: t.Optional(t.String()),
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
export const v2PackedTransactionBody = t.Object(
    {
        signer: TSigner,
        packedTransaction: t.Optional(TPackedTransaction),
    },
    {
        examples: [
            {
                signer: {
                    actor: 'test.gm',
                    permission: 'active',
                },
                packedTransaction: {},
            },
        ],
    }
)

export const v2TransactionBody = t.Object(
    {
        signer: TSigner,
        transaction: t.Optional(TTransaction),
    },
    {
        examples: [
            {
                signer: {
                    actor: 'test.gm',
                    permission: 'active',
                },
                transaction: {},
            },
        ],
    }
)

export const v2ResponseSuccess = t.Object(
    {
        code: t.Number(),
        data: t.Object({
            request: t.Array(t.String()),
            signatures: t.Array(t.String()),
        }),
    },
    {
        description:
            'Successful request returning a transaction modified to include a noop action.',
    }
)

export const v2ResponseRejected = t.Object(
    {
        code: t.Number(),
        message: t.Optional(t.String()),
    },
    {
        description: 'Failed request with an error message stating a rejection reason.',
    }
)

export const v2ResponseRequiresPayment = t.Object(
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
            request: t.Array(t.String()),
            signatures: t.Array(t.String()),
        }),
    },
    {
        description:
            'Successful request returning a transaction modified to include a transaction fee and noop action.',
    }
)

export const v2Request = {
    body: v2RequestBody,
    detail: {
        tags: ['v2'],
    },
    response: {
        200: v2ResponseSuccess,
        400: v2ResponseRejected,
        402: v2ResponseRequiresPayment,
    },
}

export const v2RequestPacked = {
    body: v2PackedTransactionBody,
    detail: {
        tags: ['v2'],
    },
    response: {
        200: v2ResponseSuccess,
        400: v2ResponseRejected,
        402: v2ResponseRequiresPayment,
    },
}

export const v2RequestTransaction = {
    body: v2TransactionBody,
    detail: {
        tags: ['v2'],
    },
    response: {
        200: v2ResponseSuccess,
        400: v2ResponseRejected,
        402: v2ResponseRequiresPayment,
    },
}
