import { PrivateKey, Session } from '@wharfkit/session';

import { managerLog } from '$lib/logger';
import { objectify } from '$lib/utils';
import { client } from '$lib/wharf/client';
import { systemContract } from '$lib/wharf/contracts';
import { ANTELOPE_SYSTEM_CONTRACT } from 'src/config';

export interface ManagerAccountStatus {
	requiresUpdateAuth: boolean;
	requiresLinkAuth: boolean;
}

export async function checkManagerAccount(manager: Session): Promise<ManagerAccountStatus> {
	const status: ManagerAccountStatus = {
		requiresUpdateAuth: false,
		requiresLinkAuth: false
	};
	managerLog.debug(
		'checking manager account',
		objectify({
			actor: manager.actor
		})
	);
	const account = await client.v1.chain.get_account(manager.actor);
	const permission = account.permissions.find((p) => p.perm_name.equals(manager.permission));
	if (!permission) {
		status.requiresUpdateAuth = true;
		status.requiresLinkAuth = true;
	} else {
		const actionLinked = permission.linked_actions.find((a) =>
			a.account.equals(ANTELOPE_SYSTEM_CONTRACT)
		);
		if (!actionLinked) {
			status.requiresLinkAuth = true;
		}
	}
	managerLog.debug('manager account status', status);
	return status;
}

export function makeUpdateAuthAction(manager: Session) {
	const params = {
		account: manager.actor,
		permission: manager.permission,
		parent: 'active',
		auth: {
			threshold: 1,
			keys: [
				{
					key: PrivateKey.from(manager.walletPlugin.data.privateKey).toPublic(),
					weight: 1
				}
			],
			accounts: [],
			waits: []
		}
	};
	return systemContract.action('updateauth', params);
}

export function makeLinkAuthAction(manager: Session) {
	const params = {
		account: manager.actor,
		requirement: manager.permission,
		code: ANTELOPE_SYSTEM_CONTRACT,
		type: 'powerup'
	};
	return systemContract.action('linkauth', params);
}

export function makeDeleteAuthAction(manager: Session) {
	const params = {
		account: manager.actor,
		permission: manager.permission
	};
	return systemContract.action('deleteauth', params);
}

export function makeUnlinkAuthAction(manager: Session) {
	const params = {
		account: manager.actor,
		code: ANTELOPE_SYSTEM_CONTRACT,
		type: 'powerup'
	};
	return systemContract.action('unlinkauth', params);
}
