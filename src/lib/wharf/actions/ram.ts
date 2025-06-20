import { Transaction } from '@wharfkit/antelope';
import type { PermissionLevel, UInt64 } from '@wharfkit/antelope';

import { systemContract } from '$lib/wharf/contracts';

export function addBuyRAMBytesAction(
	transaction: Transaction,
	cosigner: PermissionLevel,
	requestor: PermissionLevel,
	bytes: UInt64
): Transaction {
	const modified = Transaction.from(transaction);
	modified.actions.push(
		systemContract.action(
			'buyrambytes',
			{
				payer: cosigner.actor,
				receiver: requestor.actor,
				bytes
			},
			{ authorization: [cosigner] }
		)
	);
	return modified;
}
