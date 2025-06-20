import { Transaction } from '@wharfkit/antelope';
import type { PermissionLevel } from '@wharfkit/antelope';

import { noopContract } from '$lib/wharf/contracts';

export function addNoopAction(transaction: Transaction, cosigner: PermissionLevel): Transaction {
	const modified = Transaction.from(transaction);
	modified.actions.unshift(noopContract.action('noop', {}, { authorization: [cosigner] }));
	return modified;
}
