import { Transaction } from '@wharfkit/antelope';
import type { Name, PermissionLevel, UInt64 } from '@wharfkit/antelope';

import { getContract } from '../contracts';

import { ANTELOPE_SYSTEM_CONTRACT } from 'src/config';

export async function addBuyRAMBytesAction(
	transaction: Transaction,
	cosigner: PermissionLevel,
	requestor: PermissionLevel,
	bytes: UInt64
): Promise<Transaction> {
	const systemContract = await getContract(ANTELOPE_SYSTEM_CONTRACT);
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

export async function makeBuyRamAction(
	payer: Name,
	receiver: Name,
	bytes: UInt64): Promise<Action> {
	const systemContract = await getContract(ANTELOPE_SYSTEM_CONTRACT);
	const params = {
		payer,
		receiver,
		bytes
	};
	return systemContract.action('buyrambytes', params);
}
