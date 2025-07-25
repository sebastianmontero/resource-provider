import { Session } from '@wharfkit/session';
import { WalletPluginPrivateKey } from '@wharfkit/wallet-plugin-privatekey';

import {
	ANTELOPE_CHAIN_ID,
	ANTELOPE_NODEOS_API,
	MANAGER_ACCOUNT_NAME,
	MANAGER_ACCOUNT_PERMISSION,
	MANAGER_ACCOUNT_PRIVATEKEY
} from 'src/config';

export function getManagerSession(): Session {
	if (
		!ANTELOPE_CHAIN_ID ||
		!ANTELOPE_NODEOS_API ||
		!MANAGER_ACCOUNT_NAME ||
		!MANAGER_ACCOUNT_PERMISSION ||
		!MANAGER_ACCOUNT_PRIVATEKEY
	) {
		throw new Error(
			'Manager not configured. Please set the environment variables ANTELOPE_CHAIN_ID, ANTELOPE_NODEOS_API, MANAGER_ACCOUNT_NAME, MANAGER_ACCOUNT_PERMISSION, and MANAGER_ACCOUNT_PRIVATEKEY.'
		);
	}
	return new Session({
		chain: {
			id: ANTELOPE_CHAIN_ID,
			url: ANTELOPE_NODEOS_API
		},
		permissionLevel: {
			actor: MANAGER_ACCOUNT_NAME,
			permission: MANAGER_ACCOUNT_PERMISSION
		},
		walletPlugin: new WalletPluginPrivateKey(MANAGER_ACCOUNT_PRIVATEKEY)
	});
}
