import { Session } from '@wharfkit/session';
import { WalletPluginPrivateKey } from '@wharfkit/wallet-plugin-privatekey';

export function getManagerSession(): Session {
	if (
		!Bun.env.ANTELOPE_CHAIN_ID ||
		!Bun.env.ANTELOPE_NODEOS_API ||
		!Bun.env.MANAGER_ACCOUNT_NAME ||
		!Bun.env.MANAGER_ACCOUNT_PERMISSION ||
		!Bun.env.MANAGER_ACCOUNT_PRIVATEKEY
	) {
		throw new Error(
			'Manager not configured. Please set the environment variables ANTELOPE_CHAIN_ID, ANTELOPE_NODEOS_API, MANAGER_ACCOUNT_NAME, MANAGER_ACCOUNT_PERMISSION, and MANAGER_ACCOUNT_PRIVATEKEY.'
		);
	}
	return new Session({
		chain: {
			id: Bun.env.ANTELOPE_CHAIN_ID,
			url: Bun.env.ANTELOPE_NODEOS_API
		},
		permissionLevel: {
			actor: Bun.env.MANAGER_ACCOUNT_NAME,
			permission: Bun.env.MANAGER_ACCOUNT_PERMISSION
		},
		walletPlugin: new WalletPluginPrivateKey(Bun.env.MANAGER_ACCOUNT_PRIVATEKEY)
	});
}
