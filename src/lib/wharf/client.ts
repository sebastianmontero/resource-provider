import { APIClient } from '@wharfkit/antelope';
import type { NameType } from '@wharfkit/antelope';

import { generalLog } from '$lib/logger';
import type { AccountResources } from '$lib/types';
import { ANTELOPE_NODEOS_API } from 'src/config';

export const client = new APIClient({ url: ANTELOPE_NODEOS_API });

export async function getCurrentAccountResources(account: NameType): Promise<AccountResources> {
	const result = await client.v1.chain.get_account(account);
	const resources = {
		cpu: result.cpu_limit.max.subtracting(result.cpu_limit.current_used),
		net: result.net_limit.max.subtracting(result.net_limit.current_used),
		ram: result.ram_quota.subtracting(result.ram_usage)
	};
	generalLog.debug('Current Account Resources', {
		account: String(account),
		cpu: Number(resources.cpu),
		net: Number(resources.net),
		ram: Number(resources.ram)
	});
	return resources;
}
