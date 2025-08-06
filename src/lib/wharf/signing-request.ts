import { ABICache } from '@wharfkit/abicache';
import { Name, PackedTransaction, Transaction } from '@wharfkit/antelope';
import { SigningRequest } from '@wharfkit/signing-request';
import type { Static } from 'elysia';

import { getClient } from './client';

import type { v1ProviderRequestBody } from '$api/v1/types';
import { generalLog } from '$lib/logger';
import type { TPackedTransaction, TTransaction } from '$lib/types';

function getCache() {
	return new ABICache(getClient());
}

export function getOpts() {
	const cache = getCache();
	return {
		zlib: {
			deflateRaw: (data: Uint8Array) => Bun.deflateSync(Buffer.from(data)),
			inflateRaw: (data: Uint8Array) => Bun.inflateSync(Buffer.from(data))
		},
		abiProvider: cache
	};
}

export async function createSigningRequestFromString(request: string): Promise<SigningRequest> {
	generalLog.debug('createSigningRequestFromString', { request });
	let payload = request;
	if (!request.startsWith('esr:')) {
		payload = 'esr://' + request;
	}
	return SigningRequest.from(payload, getOpts());
}

export async function createSigningRequestFromPackedTransaction(
	packedTransaction: Static<typeof TPackedTransaction>
): Promise<SigningRequest> {
	generalLog.debug('createSigningRequestFromPackedTransaction', { packedTransaction });
	const decoded = PackedTransaction.from(packedTransaction);
	return await SigningRequest.create(
		{
			transaction: decoded.getTransaction()
		},
		getOpts()
	);
}

export async function createSigningRequestFromTransaction(
	transaction: Static<typeof TTransaction>
): Promise<SigningRequest> {
	generalLog.debug('createSigningRequestFromTransaction', { transaction });
	const contracts = transaction.actions.map((action) => Name.from(action.account));
	const abis = await Promise.all(
		contracts.map(async (account) => ({
			contract: account,
			abi: await getCache().getAbi(Name.from(account))
		}))
	);
	return await SigningRequest.create(
		{
			transaction: Transaction.from(transaction, abis)
		},
		getOpts()
	);
}

export async function createSigningRequest(
	body: Static<typeof v1ProviderRequestBody>
): Promise<SigningRequest> {
	generalLog.debug('createSigningRequest', { body });
	try {
		// EEP-8 Specification: Process based on ESR payload
		if (body.request) {
			return await createSigningRequestFromString(body.request);
		}

		// EEP-8 Specification: Process based on deserialized transaction
		if (body.transaction) {
			return await createSigningRequestFromTransaction(body.transaction);
		}

		// EEP-8 Specification: Process based on packed transaction
		if (body.packedTransaction) {
			return createSigningRequestFromPackedTransaction(body.packedTransaction);
		}
	} catch (error) {
		throw new Error('Error parsing request: ' + String(error));
	}

	throw new Error('No valid request found');
}
