import { Asset, Int64, UInt64 } from '@wharfkit/antelope';
import type { Static } from 'elysia';

import type { v1PowerupRequestBody, v1PowerupResponse } from '$api/v1/types';
import { providerLog } from '$lib/logger';
import { UsageDatabase } from '$lib/db/models/provider/usage';
import { objectify } from '$lib/utils';
import { getCurrentAccountResources } from '$lib/wharf/client';
import { systemContract } from '$lib/wharf/contracts';
import { getSampledUsage, resourcesClient } from '$lib/wharf/resources';
import { getManagerSession } from '$lib/wharf/session/manager';

const minimum_cpu = UInt64.from(1000);
const minimum_net = UInt64.from(1000);

const db = new UsageDatabase();

export async function powerup({
	body
}: {
	body: Static<typeof v1PowerupRequestBody>;
}): Promise<v1PowerupResponse> {
	// Check if the account is allowed via the usage database
	const usage = await db.getUsage(body.account);
	providerLog.info('Usage for account', objectify(usage));

	// Check if the account needs resources
	const resources = await getCurrentAccountResources(body.account);
	providerLog.info('Current resources for account', objectify(resources));

	// Account does not need resources
	if (!resources.cpu.lte(minimum_cpu) && !resources.net.lte(minimum_net)) {
		return {
			code: 400,
			message: 'Account does not need resources.'
		};
	}

	const sampleUsage = await getSampledUsage();
	const powerup = await resourcesClient.v1.powerup.get_state();

	const cpu_cost = Asset.from(0, Bun.env.ANTELOPE_SYSTEM_TOKEN);
	const net_cost = Asset.from(0, Bun.env.ANTELOPE_SYSTEM_TOKEN);

	const cpu_frac = Int64.from(0);
	const net_frac = Int64.from(0);

	const cost_per_ms = powerup.cpu.price_per_ms(sampleUsage, 1);
	cpu_frac.add(powerup.cpu.frac_by_ms(sampleUsage, 1));
	cpu_cost.units.add(Asset.fromFloat(cost_per_ms, Bun.env.ANTELOPE_SYSTEM_TOKEN).units);

	const cost = powerup.net.price_per_kb(sampleUsage, 1);
	net_frac.add(powerup.net.frac_by_kb(sampleUsage, 1));
	net_cost.units.add(Asset.fromFloat(cost, Bun.env.ANTELOPE_SYSTEM_TOKEN).units);

	providerLog.info('Powerup Calculations', {
		account: body.account,
		cpu_cost: String(cpu_cost),
		cpu_frac: Number(cpu_frac),
		net_cost: String(net_cost),
		net_frac: Number(net_frac)
	});

	if (cpu_frac.gt(Int64.from(0)) || net_frac.gt(Int64.from(0))) {
		const calculated_fee = Asset.fromUnits(
			cpu_cost.units.adding(net_cost.units),
			Bun.env.ANTELOPE_SYSTEM_TOKEN
		);
		const max_payment = Asset.fromFloat(
			Bun.env.PROVIDER_FREE_POWERUP_MAX_PAYMENT,
			Bun.env.ANTELOPE_SYSTEM_TOKEN
		);
		if (calculated_fee.units.gt(max_payment.units)) {
			return {
				code: 400,
				message: 'Account does not need resources.'
			};
		}
		const managerSession = getManagerSession();
		const params = {
			cpu_frac,
			net_frac,
			payer: managerSession.actor,
			receiver: body.account,
			days: 1,
			max_payment: Asset.fromFloat(1, Bun.env.ANTELOPE_SYSTEM_TOKEN)
		};
		providerLog.info('powerup params', objectify(params));

		const action = systemContract.action('powerup', params);
		providerLog.info('powerup action', objectify(action));

		const result = managerSession.transact({ action });
		providerLog.info('transaction result', objectify(result));
	}

	return {
		code: 200,
		message: 'Powerup request received'
	};
}
