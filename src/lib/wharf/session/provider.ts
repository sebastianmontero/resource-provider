import { Session } from '@wharfkit/session';
import { WalletPluginPrivateKey } from '@wharfkit/wallet-plugin-privatekey';

export function getProviderSession(): Session {
	if (
		!Bun.env.ANTELOPE_CHAIN_ID ||
		!Bun.env.ANTELOPE_NODEOS_API ||
		!Bun.env.PROVIDER_ACCOUNT_NAME ||
		!Bun.env.PROVIDER_ACCOUNT_PERMISSION ||
		!Bun.env.PROVIDER_ACCOUNT_PRIVATEKEY
	) {
		throw new Error(
			'Provider not configured. Please set the environment variables ANTELOPE_CHAIN_ID, ANTELOPE_NODEOS_API, PROVIDER_ACCOUNT_NAME, PROVIDER_ACCOUNT_PERMISSION, and PROVIDER_ACCOUNT_PRIVATEKEY.'
		);
	}
	return new Session({
		chain: {
			id: Bun.env.ANTELOPE_CHAIN_ID,
			url: Bun.env.ANTELOPE_NODEOS_API
		},
		permissionLevel: {
			actor: Bun.env.PROVIDER_ACCOUNT_NAME,
			permission: Bun.env.PROVIDER_ACCOUNT_PERMISSION
		},
		walletPlugin: new WalletPluginPrivateKey(Bun.env.PROVIDER_ACCOUNT_PRIVATEKEY)
	});
}
