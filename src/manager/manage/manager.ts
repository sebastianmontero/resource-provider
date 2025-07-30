import { Int64, Asset, Action, API } from '@wharfkit/antelope';
import { Session } from '@wharfkit/session';

import { ManagerContext } from '../context';

import { ManagedAccount } from '$lib/db/models/manager/account';
import { managerLog } from '$lib/logger';
import { makeBuyRamBytesSelfAction } from '$lib/manager/setup';
import { objectify } from '$lib/utils';
import { getPowerupParams } from '$lib/wharf/actions/powerup';
import { client } from '$lib/wharf/client';
import { systemContract } from '$lib/wharf/contracts';
import { getAccountRequiredResources } from '$lib/wharf/resources';
import {
	ANTELOPE_SYSTEM_CONTRACT,
	ANTELOPE_SYSTEM_TOKEN,
	MANAGER_ACCOUNT_NAME,
	MANAGER_BUYRAM_ACTION,
	MANAGER_INC_KB,
	MANAGER_INC_MS,
	MANAGER_MIN_KB,
	MANAGER_MIN_MS,
	MANAGER_RAM_MINIMUM_KB
} from 'src/config';

const managerAccount = ManagedAccount.from({
	account: MANAGER_ACCOUNT_NAME,
	min_ms: Int64.from(MANAGER_MIN_MS),
	min_kb: Int64.from(MANAGER_MIN_KB),
	inc_ms: Int64.from(MANAGER_INC_MS),
	inc_kb: Int64.from(MANAGER_INC_KB),
	max_fee: Asset.fromFloat(0.1, ANTELOPE_SYSTEM_TOKEN)
});

export interface ManagerAccountStatus {
	requiresAdditionalRAM: boolean;
	requiresUpdateAuth: boolean;
	requiresLinkAuthPowerup: boolean;
	requiresLinkAuthBuyRAM: boolean;
}

export function getManagerAccountStatus(
	manager: Session,
	data: API.v1.AccountObject
): ManagerAccountStatus {
	const status: ManagerAccountStatus = {
		requiresAdditionalRAM: false,
		requiresUpdateAuth: false,
		requiresLinkAuthPowerup: false,
		requiresLinkAuthBuyRAM: false
	};

	const ramAvailable = data.ram_quota.subtracting(data.ram_usage);
	const ramMinimum = Int64.from(MANAGER_RAM_MINIMUM_KB).multiplying(1000);
	managerLog.debug(
		'Manager account RAM state',
		objectify({
			quota: data.ram_quota,
			usage: data.ram_usage,
			available: ramAvailable,
			minimum: ramMinimum
		})
	);
	if (ramAvailable.lt(ramMinimum)) {
		status.requiresAdditionalRAM = true;
	}

	const permission = data.permissions.find((p) => p.perm_name.equals(manager.permission));
	managerLog.debug('Manager account permissions', objectify(data.permissions));

	if (!permission) {
		status.requiresUpdateAuth = true;
		status.requiresLinkAuthPowerup = true;
		status.requiresLinkAuthBuyRAM = true;
	} else {
		const powerupLinked = permission.linked_actions.find(
			(a) => a.account.equals(ANTELOPE_SYSTEM_CONTRACT) && a.action.equals('powerup')
		);
		if (!powerupLinked) {
			status.requiresLinkAuthPowerup = true;
		}

		const buyRAMLinked = permission.linked_actions.find(
			(a) => a.account.equals(ANTELOPE_SYSTEM_CONTRACT) && a.action.equals(MANAGER_BUYRAM_ACTION)
		);
		if (!buyRAMLinked) {
			status.requiresLinkAuthBuyRAM = true;
		}
	}

	managerLog.debug('Manager account status', status);
	return status;
}

export async function manageManagerAccount(manager: Session, context: ManagerContext) {
	const data = await client.v1.chain.get_account(manager.actor);
	const status = getManagerAccountStatus(manager, data);
	const actions: Action[] = [];
	if (
		status.requiresLinkAuthPowerup ||
		status.requiresLinkAuthBuyRAM ||
		status.requiresUpdateAuth
	) {
		managerLog.error(
			'The manager account permissions are not configured. Run the "manager setup" command to update the account with the proper permissions.'
		);
		process.exit();
	}
	if (status.requiresAdditionalRAM) {
		managerLog.info('Adding buyram action for manager account.', {
			account: manager.actor
		});
		actions.push(makeBuyRamBytesSelfAction(manager));
	}

	const requiredResources = getAccountRequiredResources(managerAccount, data);
	const params = getPowerupParams(
		managerAccount.inc_ms,
		managerAccount.inc_kb,
		context.powerup,
		context.sampleUsage,
		requiredResources,
		managerAccount.account,
		managerAccount.account,
		managerAccount.max_fee
	);

	if (params.cpu_frac.gt(Int64.zero) || params.net_frac.gt(Int64.zero)) {
		managerLog.info('Adding powerup action for manager account', {
			account: manager.actor
		});
		actions.push(systemContract.action('powerup', params));
	} else {
		managerLog.debug('no powerup required', {
			account: objectify(managerAccount)
		});
	}

	if (actions.length) {
		const result = await manager.transact({ actions }).catch((error) => {
			managerLog.error('Manager management transaction failed: ' + String(error));
		});
		if (!result) {
			managerLog.error(
				'Manager management transaction failed with no result',
				objectify(managerAccount)
			);
			return;
		}
		managerLog.info('Manager management transaction successful', {
			trx_id: String(result.resolved?.transaction.id)
		});
	}
}
