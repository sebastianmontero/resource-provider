import { Int64, PrivateKey, Session } from '@wharfkit/session';

import { systemContract } from '$lib/wharf/contracts';
import { ANTELOPE_SYSTEM_CONTRACT, MANAGER_RAM_MINIMUM_KB } from 'src/config';

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

export function makeLinkAuthAction(manager: Session, action: string) {
	const params = {
		account: manager.actor,
		requirement: manager.permission,
		code: ANTELOPE_SYSTEM_CONTRACT,
		type: action
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

export function makeUnlinkAuthAction(manager: Session, action: string) {
	const params = {
		account: manager.actor,
		code: ANTELOPE_SYSTEM_CONTRACT,
		type: action
	};
	return systemContract.action('unlinkauth', params);
}

export function makeBuyRamBytesSelfAction(manager: Session) {
	const params = {
		payer: manager.actor,
		receiver: manager.actor,
		bytes: Int64.from(MANAGER_RAM_MINIMUM_KB).multiplying(1000)
	};
	return systemContract.action('buyrambytes', params);
}
