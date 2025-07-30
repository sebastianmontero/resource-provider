import { NameType } from '@wharfkit/antelope';
import { Contract } from '@wharfkit/contract';

import { contractsDatabase } from '$lib/db/models/contract/contracts';
import { getClient } from '$lib/wharf/client';

export function getContract(account: NameType): Promise<Contract> {
	return contractsDatabase.load(account).then((abi) => {
		return new Contract({
			abi,
			account,
			client: getClient()
		});
	});
}
