import { API } from '@wharfkit/antelope';
import { Resources } from '@wharfkit/resources';

import { AccountRequiredResources } from './actions/powerup';
import { getClient } from './client';

import { ManagedAccount } from '$lib/db/models/manager/account';
import { generalLog, managerLog } from '$lib/logger';
import { AccountResources } from '$lib/types';
import { objectify } from '$lib/utils';
import { ANTELOPE_SAMPLE_ACCOUNT } from 'src/config';

export function getResourcesClient() {
	return new Resources({
		api: getClient(),
		sampleAccount: ANTELOPE_SAMPLE_ACCOUNT
	});
}

export async function getSampledUsage() {
	const usage = await getResourcesClient().getSampledUsage();
	generalLog.debug('Sampled Usage', objectify(usage));
	return usage;
}

export function getAccountCurrentResources(data: API.v1.AccountObject): AccountResources {
	const resources = {
		cpu: data.cpu_limit.max.subtracting(data.cpu_limit.current_used),
		net: data.net_limit.max.subtracting(data.net_limit.current_used),
		ram: data.ram_quota.subtracting(data.ram_usage)
	};
	generalLog.debug('Current Account Resources', {
		account: String(data.account_name),
		cpu: Number(resources.cpu),
		net: Number(resources.net),
		ram: Number(resources.ram)
	});
	return resources;
}

export function getAccountRequiresCPU(
	account: ManagedAccount,
	resources: AccountResources
): boolean {
	const cpuMinimum = account.min_ms.multiplying(1000);
	const cpuRequired = resources.cpu.lt(cpuMinimum);
	managerLog.debug(
		'Account CPU Resource Status',
		objectify({ cpuMinimum, cpuCurrent: resources.cpu, cpuRequired })
	);
	return cpuRequired;
}

export function getAccountRequiresNET(
	account: ManagedAccount,
	resources: AccountResources
): boolean {
	const netMinimum = account.min_kb.multiplying(1000);
	const netRequired = resources.net.lt(netMinimum);
	managerLog.debug(
		'Account NET Resource Status',
		objectify({ netMinimum, netCurrent: resources.net, netRequired })
	);
	return netRequired;
}

export function getAccountRequiredResources(
	managed: ManagedAccount,
	data: API.v1.AccountObject
): AccountRequiredResources {
	const resources = getAccountCurrentResources(data);
	const cpuRequired = getAccountRequiresCPU(managed, resources);
	const netRequired = getAccountRequiresNET(managed, resources);
	if (cpuRequired || netRequired) {
		managerLog.info(
			'Account requires additional network resources',
			objectify({
				account: managed.account,
				cpu: {
					current: resources.cpu,
					minimum: managed.min_ms.multiplying(1000),
					required: cpuRequired
				},
				net: {
					current: resources.net,
					minimum: managed.min_kb.multiplying(1000),
					required: netRequired
				}
			})
		);
	}
	return { cpuRequired, netRequired };
}
