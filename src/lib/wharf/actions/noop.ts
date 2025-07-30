import { Transaction } from '@wharfkit/antelope';
import type { PermissionLevel } from '@wharfkit/antelope';

import { getContract } from '../contracts';

import { ANTELOPE_NOOP_CONTRACT } from 'src/config';

export async function addNoopAction(
	transaction: Transaction,
	cosigner: PermissionLevel
): Promise<Transaction> {
	const noopContract = await getContract(ANTELOPE_NOOP_CONTRACT);
	const modified = Transaction.from(transaction);
	modified.actions.unshift(noopContract.action('noop', {}, { authorization: [cosigner] }));
	return modified;
}
