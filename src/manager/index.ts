import { Asset, Int64, Name } from '@wharfkit/antelope';
import type { PowerUpState, SampleUsage } from '@wharfkit/resources';
import type { Session } from '@wharfkit/session';
import { Cron, type CronOptions } from 'croner';
import type { Static } from 'elysia';

import type { v2ManagedAccountType } from '$api/v2/manager/types';
import {
	ManagedAccount,
	ManagedAccountDatabase,
	managedAccounts
} from '$lib/db/models/manager/account';
import { managerLog } from '$lib/logger';
import { checkManagerAccount } from '$lib/manager/setup';
import { objectify } from '$lib/utils';
import { getCurrentAccountResources } from '$lib/wharf/client';
import { systemContract } from '$lib/wharf/contracts';
import { getSampledUsage, resourcesClient } from '$lib/wharf/resources';
import { getManagerSession } from '$lib/wharf/session/manager';
import { ANTELOPE_SYSTEM_TOKEN, ENABLE_RESOURCE_MANAGER, MANAGER_CRONJOB } from 'src/config';

const cron = MANAGER_CRONJOB;
const cronOptions: CronOptions = { catch: (e) => managerLog.error(e), protect: true };

interface ManagerContext {
	db: ManagedAccountDatabase;
	managedAccounts: Array<Static<typeof v2ManagedAccountType>>;
	sampleUsage: SampleUsage;
	powerup: PowerUpState;
}

async function manageAccountResources(
	manager: Session,
	account: Static<typeof v2ManagedAccountType>,
	context: ManagerContext
) {
	try {
		const managed = ManagedAccount.from(account);
		const resources = await getCurrentAccountResources(managed.account);

		// Calculate CPU powerup needs
		const cpu_cost = Asset.from(0, ANTELOPE_SYSTEM_TOKEN);
		const cpu_frac = Int64.from(0);
		const min_us = managed.min_ms.multiplying(1000);
		if (resources.cpu.lt(min_us)) {
			managerLog.info(
				`CPU is below minimum, attempting to powerup ${managed.inc_ms}ms`,
				objectify({
					minimum_us: min_us,
					current_us: resources.cpu,
					increment_us: managed.inc_ms.multiplying(1000)
				})
			);
			const cost = context.powerup.cpu.price_per_ms(context.sampleUsage, Number(managed.inc_ms));
			cpu_frac.add(context.powerup.cpu.frac_by_ms(context.sampleUsage, Number(managed.inc_ms)));
			cpu_cost.units.add(Asset.fromFloat(cost, ANTELOPE_SYSTEM_TOKEN).units);
		}

		// Calculate NET powerup needs
		const net_cost = Asset.from(0, ANTELOPE_SYSTEM_TOKEN);
		const net_frac = Int64.from(0);
		const min_bytes = managed.min_kb.multiplying(1000);
		if (resources.net.lt(min_bytes)) {
			managerLog.info(
				`NET is below minimum, attempting to powerup ${managed.inc_kb}kb`,
				objectify({
					minimum_bytes: min_bytes,
					current_bytes: resources.net,
					increment_bytes: managed.inc_kb.multiplying(1000)
				})
			);
			const cost = context.powerup.net.price_per_kb(context.sampleUsage, Number(managed.inc_kb));
			net_frac.add(context.powerup.net.frac_by_kb(context.sampleUsage, Number(managed.inc_kb)));
			net_cost.units.add(Asset.fromFloat(cost, ANTELOPE_SYSTEM_TOKEN).units);
		}

		managerLog.debug('Powerup Calculations', {
			cpu_cost: String(cpu_cost),
			cpu_frac: Number(cpu_frac),
			net_cost: String(net_cost),
			net_frac: Number(net_frac)
		});

		if (cpu_frac.gt(Int64.from(0)) || net_frac.gt(Int64.from(0))) {
			const params = {
				cpu_frac,
				net_frac,
				payer: Name.from(manager.actor),
				receiver: Name.from(managed.account),
				days: 1,
				max_payment: managed.max_fee
			};

			const action = systemContract.action('powerup', params);
			managerLog.debug('powerup action to perform', objectify(action));

			manager
				.transact({ action }, { broadcast: true })
				.then((result) => {
					managerLog.info('powerup successful', {
						params: objectify(params),
						trx_id: String(result.resolved?.transaction.id)
					});
				})
				.catch((error) => {
					managerLog.error('powerup failed', {
						error
					});
				});
		} else {
			managerLog.debug('no powerup required', {
				account: objectify(managed),
				resources: objectify(resources)
			});
		}
	} catch (error) {
		managerLog.error('manageAccountResources failed', { account, error });
	}
}

async function getManagerContext(): Promise<ManagerContext> {
	return {
		db: managedAccounts,
		managedAccounts: await managedAccounts.getManagedAccounts(),
		sampleUsage: await getSampledUsage(),
		powerup: await resourcesClient.v1.powerup.get_state()
	};
}

export const managerJob = async function () {
	try {
		const manager = getManagerSession();
		const status = await checkManagerAccount(manager);
		if (status.requiresLinkAuth || status.requiresUpdateAuth) {
			managerLog.error(
				'The manager account permissions are not configured. Run the "manager setup" command to update the account with the proper permissions.'
			);
			process.exit();
		}
		const managerContext = await getManagerContext();
		if (!managerContext.managedAccounts.length) {
			managerLog.info(
				'Manager skipped because no managed accounts found. Add accounts using the "manager add" command or through the API.'
			);
			return;
		}
		for (const account of managerContext.managedAccounts) {
			managerLog.info('Running resource management', { account: objectify(account) });
			manageAccountResources(manager, account, managerContext);
		}
	} catch (error) {
		managerLog.error('managerJob failed', { error });
	}
};

export async function manager() {
	if (!ENABLE_RESOURCE_MANAGER) {
		managerLog.info(
			'Resource Manager Service is disabled. Set ENABLE_RESOURCE_MANAGER=true if you wish to run this service.'
		);
		return;
	}

	managerLog.info('Resource Manager Service starting', { cron, cronOptions });
	// Run immediately
	managerJob();

	// Schedule the cron job
	new Cron(cron, cronOptions, managerJob);
}
