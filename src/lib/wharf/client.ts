import { APIClient } from '@wharfkit/antelope';
import type { NameType } from '@wharfkit/antelope';

import { generalLog } from '$lib/logger';
import type { AccountResources } from '$lib/types';

export const client = new APIClient({ url: Bun.env.ANTELOPE_NODEOS_API });

export async function getCurrentAccountResources(account: NameType): Promise<AccountResources> {
	const result = await client.v1.chain.get_account(account);
	const resources = {
		cpu: result.cpu_limit.available,
		net: result.net_limit.available,
		ram: result.ram_quota.subtracting(result.ram_usage)
	};
	generalLog.debug('Current Account Resoures', {
		account: String(account),
		cpu: Number(resources.cpu),
		net: Number(resources.net),
		ram: Number(resources.ram)
	});
	return resources;
}
