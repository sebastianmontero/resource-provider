import { Session } from '@wharfkit/session';
import { WalletPluginPrivateKey } from '@wharfkit/wallet-plugin-privatekey';

import {
	ANTELOPE_CHAIN_ID,
	ANTELOPE_NODEOS_API,
	PROVIDER_ACCOUNT_NAME,
	PROVIDER_ACCOUNT_PERMISSION,
	PROVIDER_ACCOUNT_PRIVATEKEY
} from 'src/config';

export function getProviderSession(): Session {
	if (
		!ANTELOPE_CHAIN_ID ||
		!ANTELOPE_NODEOS_API ||
		!PROVIDER_ACCOUNT_NAME ||
		!PROVIDER_ACCOUNT_PERMISSION ||
		!PROVIDER_ACCOUNT_PRIVATEKEY
	) {
		throw new Error(
			'Provider not configured. Please set the environment variables ANTELOPE_CHAIN_ID, ANTELOPE_NODEOS_API, PROVIDER_ACCOUNT_NAME, PROVIDER_ACCOUNT_PERMISSION, and PROVIDER_ACCOUNT_PRIVATEKEY.'
		);
	}
	return new Session({
		chain: {
			id: ANTELOPE_CHAIN_ID,
			url: ANTELOPE_NODEOS_API
		},
		permissionLevel: {
			actor: PROVIDER_ACCOUNT_NAME,
			permission: PROVIDER_ACCOUNT_PERMISSION
		},
		walletPlugin: new WalletPluginPrivateKey(PROVIDER_ACCOUNT_PRIVATEKEY)
	});
}
