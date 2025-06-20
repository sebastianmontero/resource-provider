import { t } from 'elysia';

import { TPackedTransaction, TSigner, TTransaction, v2GenericResponse } from '$lib/types';

const tags = ['Resource Provider (v2)'];

export const v2ProviderRequestBody = t.Object(
	{
		signer: TSigner,
		request: t.Optional(t.String())
	},
	{
		examples: [
			{
				signer: {
					actor: 'test.gm',
					permission: 'active'
				},
				request:
					'esr://gmNgZGBY1mTC_MoglIGBIVzX5uxZRqAQGDBBaWeYAINP360cgcXzYHwWRwitFJRanF9alJyqUFCUX5aZklqkUJJaXKJQUpSYV5yYXJKZnwfUAgA'
			}
		]
	}
);

export const v2ProviderPackedTransactionBody = t.Object(
	{
		signer: TSigner,
		packedTransaction: t.Optional(TPackedTransaction)
	},
	{
		examples: [
			{
				signer: {
					actor: 'test.gm',
					permission: 'active'
				},
				packedTransaction: {}
			}
		]
	}
);

export const v2ProviderTransactionBody = t.Object(
	{
		signer: TSigner,
		transaction: t.Optional(TTransaction)
	},
	{
		examples: [
			{
				signer: {
					actor: 'test.gm',
					permission: 'active'
				},
				transaction: {}
			}
		]
	}
);

export const v2ProviderResponseSuccess = t.Object(
	{
		code: t.Number(),
		data: t.Object({
			request: t.Array(t.String()),
			signatures: t.Array(t.String())
		})
	},
	{
		description: 'Successful request returning a transaction modified to include a noop action.'
	}
);

export const v2ProviderResponseRejected = t.Object(v2GenericResponse.properties, {
	description: 'Failed request with an error message stating a rejection reason.'
});

export const v2ProviderResponseRequiresPayment = t.Object(
	{
		code: t.Number(),
		data: t.Object({
			costs: t.Optional(
				t.Object({
					cpu: t.Optional(t.String()),
					net: t.Optional(t.String()),
					ram: t.Optional(t.String())
				})
			),
			fee: t.Optional(t.String()),
			request: t.Array(t.String()),
			signatures: t.Array(t.String())
		})
	},
	{
		description:
			'Successful request returning a transaction modified to include a transaction fee and noop action.'
	}
);

export const v2ProviderRequest = {
	body: v2ProviderRequestBody,
	detail: {
		tags
	},
	response: {
		200: v2ProviderResponseSuccess,
		400: v2ProviderResponseRejected,
		402: v2ProviderResponseRequiresPayment
	}
};

export const v2ProviderRequestPacked = {
	body: v2ProviderPackedTransactionBody,
	detail: {
		tags
	},
	response: {
		200: v2ProviderResponseSuccess,
		400: v2ProviderResponseRejected,
		402: v2ProviderResponseRequiresPayment
	}
};

export const v2ProviderRequestTransaction = {
	body: v2ProviderTransactionBody,
	detail: {
		tags
	},
	response: {
		200: v2ProviderResponseSuccess,
		400: v2ProviderResponseRejected,
		402: v2ProviderResponseRequiresPayment
	}
};
