import { Action, Int64 } from '@wharfkit/antelope';
import { Session } from '@wharfkit/session';
import { Static } from 'elysia';

import { ManagerContext } from '../context';

import { v2ManagedAccountType } from '$api/v2/manager/types';
import { ManagedAccount } from '$lib/db/models/manager/account';
import { managerLog } from '$lib/logger';
import { objectify } from '$lib/utils';
import { getPowerupParams } from '$lib/wharf/actions/powerup';
import { getClient } from '$lib/wharf/client';
import { getContract } from '$lib/wharf/contracts';
import { getAccountRequiredResources } from '$lib/wharf/resources';
import { ANTELOPE_SYSTEM_CONTRACT } from 'src/config';
import { makeBuyRamAction } from '$lib/wharf/actions/ram';

export async function manageAccountResources(
	manager: Session,
	account: Static<typeof v2ManagedAccountType>,
	context: ManagerContext
) {
	try {
		const managed = ManagedAccount.from(account);
		const data = await getClient().v1.chain.get_account(managed.account);
		const requiredResources = getAccountRequiredResources(managed, data);
		// managerLog.debug(
		// 	'before powerup params'
		// );
		const params = getPowerupParams(
			managed.inc_ms,
			managed.inc_net_kb,
			context.powerup,
			context.sampleUsage,
			requiredResources,
			manager.actor,
			managed.account,
			managed.max_fee
		);
		// managerLog.debug(
		// 	'powerup params',
		// 	objectify({ params })
		// );
		const actions: Action[] = [];
		if (params.cpu_frac.gt(Int64.zero) || params.net_frac.gt(Int64.zero)) {
			const systemContract = await getContract(ANTELOPE_SYSTEM_CONTRACT);
			const action = await systemContract.action('powerup', params);
			actions.push(action);
			managerLog.debug(
				'powerup action to perform',
				objectify({ account: managed.account, action, params })
			);
		} else {
			managerLog.debug(
				'no powerup required',
				objectify({
					account: managed.account
				})
			);
		}

		if (requiredResources.ramRequired) {

			const action = await makeBuyRamAction(manager.actor, managed.account, Int64.from(managed.min_ram_kb).multiplying(1000))
			actions.push(action);
			managerLog.debug(
				'buyram action to perform',
				objectify({ account: managed.account, action })
			);
		}
		if (actions.length) {
			const result = await manager.transact({ actions });
			if (!result.resolved) {
				managerLog.error(
					'account management transaction failed with no result',
					objectify({ managed, result })
				);
				return;
			}
			managerLog.info(
				'account management transaction successful',
				objectify({
					account: managed.account,
					trx_id: String(result.resolved?.transaction.id)
				})
			);
		}
	} catch (error) {
		managerLog.error('manageAccountResources failed', { account, error: String(error) });
	}
}
