import { Asset, Int64, Name } from '@wharfkit/antelope';
import type { PowerUpState, SampleUsage } from '@wharfkit/resources';
import type { Session } from '@wharfkit/session';
import { Cron } from 'croner';
import type { CronCallback, CronOptions } from 'croner';
import type { Static } from 'elysia';

import type { v2ManagedAccountType } from '$api/v2/managed/types';
import { logger } from '$lib/logger';
import { ManagedAccount, ManagedDatabase } from '$lib/sqlite/db';
import { isENVTrue, objectify } from '$lib/utils';
import { getCurrentAccountResources } from '$lib/wharf/client';
import { systemContract } from '$lib/wharf/contracts';
import { getSampledUsage, resourcesClient } from '$lib/wharf/resources';
import { getManagerSession } from '$lib/wharf/session/manager';

// TODO: Research potentially using https://elysiajs.com/plugins/cron
const cron = '0/5 * * * * *'; // Every 5 seconds
const cronOptions: CronOptions = { catch: (e) => logger.error(e) };
const enabled = isENVTrue(Bun.env.ENABLE_RESOURCE_MANAGER);

interface ManagerContext {
	db: ManagedDatabase;
	managedAccounts: Array<Static<typeof v2ManagedAccountType>>;
	sampleUsage: SampleUsage;
	powerup: PowerUpState;
}

async function manageAccountResources(
	manager: Session,
	account: Static<typeof v2ManagedAccountType>,
	context: ManagerContext
) {
	const managed = new ManagedAccount(account);
	const resources = await getCurrentAccountResources(managed.account);

	const cpu_cost = Asset.from(0, Bun.env.ANTELOPE_SYSTEM_TOKEN);
	const net_cost = Asset.from(0, Bun.env.ANTELOPE_SYSTEM_TOKEN);

	const cpu_frac = Int64.from(0);
	const net_frac = Int64.from(0);

	if (resources.cpu.lte(managed.min_cpu.multiplying(1000))) {
		logger.info(`CPU is below minimum, attempting to powerup ${managed.inc_ms}ms`, {
			minimum: Number(managed.min_cpu.multiplying(1000)),
			current: Number(resources.cpu),
			increment: Number(managed.inc_ms.multiplying(1000))
		});
		const cost = context.powerup.cpu.price_per_ms(context.sampleUsage, Number(managed.inc_ms));
		cpu_frac.add(context.powerup.cpu.frac_by_ms(context.sampleUsage, Number(managed.inc_ms)));
		cpu_cost.units.add(Asset.fromFloat(cost, Bun.env.ANTELOPE_SYSTEM_TOKEN).units);
	}

	if (resources.net.lte(managed.min_net.multiplying(1000))) {
		logger.info(`NET is below minimum, attempting to powerup ${managed.inc_kb}kb`, {
			minimum: Number(managed.min_net.multiplying(1000)),
			current: Number(resources.net),
			increment: Number(managed.inc_kb.multiplying(1000))
		});
		const cost = context.powerup.net.price_per_kb(context.sampleUsage, Number(managed.inc_kb));
		net_frac.add(context.powerup.net.frac_by_kb(context.sampleUsage, Number(managed.inc_kb)));
		net_cost.units.add(Asset.fromFloat(cost, Bun.env.ANTELOPE_SYSTEM_TOKEN).units);
	}

	logger.debug('Powerup Calculations', {
		cpu_cost: String(cpu_cost),
		cpu_frac: Number(cpu_frac),
		net_cost: String(net_cost),
		net_frac: Number(net_frac)
	});

	if (cpu_frac.gt(Int64.from(0)) || net_frac.gt(Int64.from(0))) {
		const params = {
			cpu_frac,
			net_frac,
			payer: Name.from(managed.account),
			receiver: Name.from(managed.account),
			days: 1,
			max_payment: managed.max_fee
		};
		logger.info('powerup params', objectify(params));

		const action = systemContract.action('powerup', params);
		logger.info('powerup action', objectify(action));
	}
}

async function getManagerContext(): Promise<ManagerContext> {
	const db = new ManagedDatabase();
	return {
		db,
		managedAccounts: await db.getManagedAccounts(),
		sampleUsage: await getSampledUsage(),
		powerup: await resourcesClient.v1.powerup.get_state()
	};
}

const managerJob: CronCallback = async function (self, context) {
	const cronContext = context as { manager: Session };
	const managerContext = await getManagerContext();
	for (const account of managerContext.managedAccounts) {
		logger.info('Running resource management', { account: objectify(account) });
		manageAccountResources(cronContext.manager, account, managerContext);
	}
};

export async function manager() {
	try {
		if (!enabled) {
			throw new Error(
				'Resource Manager Service is disabled. Set ENABLE_RESOURCE_MANAGER=true to run.'
			);
		}

		const manager = getManagerSession();
		new Cron(cron, { ...cronOptions, context: { manager } }, managerJob);
		logger.info('Resource Manager Service started', { cron });
	} catch (error) {
		logger.error(error);
	}
}
