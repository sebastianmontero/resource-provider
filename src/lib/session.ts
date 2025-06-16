import {Session} from '@wharfkit/session'
import {WalletPluginPrivateKey} from '@wharfkit/wallet-plugin-privatekey'

if (!Bun.env.ANTELOPE_CHAIN_ID) {
    throw new Error('ANTELOPE_CHAIN_ID environment variable is not set')
}
if (!Bun.env.PROVIDER_ACCOUNT_NAME) {
    throw new Error('PROVIDER_ACCOUNT_NAME environment variable is not set')
}
if (!Bun.env.PROVIDER_ACCOUNT_PERMISSION) {
    throw new Error('PROVIDER_ACCOUNT_PERMISSION environment variable is not set')
}
if (!Bun.env.PROVIDER_ACCOUNT_PRIVATEKEY) {
    throw new Error('PROVIDER_ACCOUNT_PRIVATEKEY environment variable is not set')
}
if (!Bun.env.ANTELOPE_NODEOS_API) {
    throw new Error('ANTELOPE_NODEOS_API environment variable is not set')
}

export const session = new Session({
    chain: {
        id: Bun.env.ANTELOPE_CHAIN_ID,
        url: Bun.env.ANTELOPE_NODEOS_API,
    },
    permissionLevel: {
        actor: Bun.env.PROVIDER_ACCOUNT_NAME,
        permission: Bun.env.PROVIDER_ACCOUNT_PERMISSION,
    },
    walletPlugin: new WalletPluginPrivateKey(Bun.env.PROVIDER_ACCOUNT_PRIVATEKEY),
})
