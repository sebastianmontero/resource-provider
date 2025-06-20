import { Transaction } from '@wharfkit/antelope';
import type { Asset, PermissionLevel } from '@wharfkit/antelope';

import { tokenContract } from '$lib/wharf/contracts';

export function addFeeAction(
	transaction: Transaction,
	requester: PermissionLevel,
	cosigner: PermissionLevel,
	fee: Asset,
	memo: string = 'Resource Provider Fee'
): Transaction {
	const modified = Transaction.from(transaction);
	modified.actions.push(
		tokenContract.action('transfer', {
			from: requester.actor,
			to: cosigner.actor,
			quantity: fee,
			memo
		})
	);
	return modified;
}
