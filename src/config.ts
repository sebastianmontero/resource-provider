import { isENVTrue } from '$lib/utils';

// Base Configuration
export const ENVIRONMENT = Bun.env.ENVIRONMENT ?? 'production';
export const SERVICE_ERROR_LOG = Bun.env.SERVICE_ERROR_LOG ?? './error.log';
export const SERVICE_HTTP_PORT = Bun.env.SERVICE_HTTP_PORT
	? Number(Bun.env.SERVICE_HTTP_PORT)
	: 3000;
export const SERVICE_INFO_LOG = Bun.env.SERVICE_INFO_LOG ?? './info.log';
export const SERVICE_LOG_LEVEL = Bun.env.SERVICE_LOG_LEVEL ?? 'info';

// Database Configuration
export const DATABASE_ADAPTER = Bun.env.DATABASE_ADAPTER ?? 'sqlite';
export const DATABASE_FILE = Bun.env.DATABASE_FILE ?? 'resource-provider.db';

// Chain Configuration
export const ANTELOPE_CHAIN_ID = Bun.env.ANTELOPE_CHAIN_ID;
export const ANTELOPE_NODEOS_API = Bun.env.ANTELOPE_NODEOS_API;
export const ANTELOPE_NOOP_CONTRACT = Bun.env.ANTELOPE_NOOP_CONTRACT ?? 'greymassnoop';
export const ANTELOPE_SAMPLE_ACCOUNT = Bun.env.ANTELOPE_SAMPLE_ACCOUNT ?? 'eosio.reserv';
export const ANTELOPE_SYSTEM_CONTRACT = Bun.env.ANTELOPE_SYSTEM_CONTRACT ?? 'core.vaulta';
export const ANTELOPE_SYSTEM_TOKEN = Bun.env.ANTELOPE_SYSTEM_TOKEN;
export const ANTELOPE_TOKEN_CONTRACT = Bun.env.ANTELOPE_TOKEN_CONTRACT ?? 'core.vaulta';

if (!ANTELOPE_CHAIN_ID) {
	throw new Error('The ANTELOPE_CHAIN_ID value must be configured.');
}

if (!ANTELOPE_NODEOS_API) {
	throw new Error('The ANTELOPE_NODEOS_API value must be configured.');
}

if (!ANTELOPE_SYSTEM_TOKEN) {
	throw new Error('The ANTELOPE_SYSTEM_TOKEN value must be configured.');
}

// Feature: Automated Resource Management
export const ENABLE_RESOURCE_MANAGER = isENVTrue(Bun.env.ENABLE_RESOURCE_MANAGER ?? 'false');
export const MANAGER_ACCOUNT_NAME = Bun.env.MANAGER_ACCOUNT_NAME;
export const MANAGER_ACCOUNT_PERMISSION = Bun.env.MANAGER_ACCOUNT_PERMISSION ?? 'manager';
export const MANAGER_ACCOUNT_PRIVATEKEY = Bun.env.MANAGER_ACCOUNT_PRIVATEKEY;
export const MANAGER_CRONJOB = Bun.env.MANAGER_CRONJOB ?? '*/5 * * * *';

if (ENABLE_RESOURCE_MANAGER) {
	if (!MANAGER_ACCOUNT_NAME) {
		throw new Error(
			'If ENABLE_RESOURCE_MANAGER is set to true, MANAGER_ACCOUNT_NAME must also be defined.'
		);
	}
	if (!MANAGER_ACCOUNT_PRIVATEKEY) {
		throw new Error(
			'If ENABLE_RESOURCE_MANAGER is set to true, MANAGER_ACCOUNT_PRIVATEKEY must also be defined.'
		);
	}
}

// Feature: Resource Provider APIs
export const ENABLE_RESOURCE_PROVIDER = isENVTrue(Bun.env.ENABLE_RESOURCE_PROVIDER ?? 'false');
export const PROVIDER_ACCOUNT_NAME = Bun.env.PROVIDER_ACCOUNT_NAME;
export const PROVIDER_ACCOUNT_PERMISSION = Bun.env.PROVIDER_ACCOUNT_PERMISSION ?? 'provider';
export const PROVIDER_ACCOUNT_PRIVATEKEY = Bun.env.PROVIDER_ACCOUNT_PRIVATEKEY;

if (ENABLE_RESOURCE_PROVIDER) {
	if (!PROVIDER_ACCOUNT_NAME) {
		throw new Error(
			'If ENABLE_RESOURCE_PROVIDER is set to true, PROVIDER_ACCOUNT_NAME must also be defined.'
		);
	}
	if (!PROVIDER_ACCOUNT_PRIVATEKEY) {
		throw new Error(
			'If ENABLE_RESOURCE_PROVIDER is set to true, PROVIDER_ACCOUNT_PRIVATEKEY must also be defined.'
		);
	}
}

// Feature: Resource Provider API - Allow direct free account powerup
export const ENABLE_FREE_POWERUP = isENVTrue(Bun.env.ENABLE_FREE_POWERUP ?? 'false');
export const PROVIDER_FREE_POWERUP_KB = Bun.env.PROVIDER_FREE_POWERUP_KB;
export const PROVIDER_FREE_POWERUP_MAX_PAYMENT = Bun.env.PROVIDER_FREE_POWERUP_MAX_PAYMENT;
export const PROVIDER_FREE_POWERUP_MS = Bun.env.PROVIDER_FREE_POWERUP_MS;
export const PROVIDER_FREE_POWERUP_USES = Bun.env.PROVIDER_FREE_POWERUP_USES;

if (ENABLE_FREE_POWERUP) {
	if (!ENABLE_RESOURCE_PROVIDER) {
		throw new Error(
			'If ENABLE_FREE_POWERUP is set to true, ENABLE_RESOURCE_PROVIDER must also be set to true.'
		);
	}
	if (!PROVIDER_FREE_POWERUP_KB) {
		throw new Error(
			'If ENABLE_FREE_POWERUP is set to true, PROVIDER_FREE_POWERUP_KB must also be defined.'
		);
	}
	if (!PROVIDER_FREE_POWERUP_MAX_PAYMENT) {
		throw new Error(
			'If ENABLE_FREE_POWERUP is set to true, PROVIDER_FREE_POWERUP_MAX_PAYMENT must also be defined.'
		);
	}
	if (!PROVIDER_FREE_POWERUP_MS) {
		throw new Error(
			'If ENABLE_FREE_POWERUP is set to true, PROVIDER_FREE_POWERUP_MS must also be defined.'
		);
	}
	if (!PROVIDER_FREE_POWERUP_USES) {
		throw new Error(
			'If ENABLE_FREE_POWERUP is set to true, PROVIDER_FREE_POWERUP_USES must also be defined.'
		);
	}
}

// Feature: Resource Provider API - Cosign transactions to provide free resources
export const ENABLE_FREE_TRANSACTIONS = isENVTrue(Bun.env.ENABLE_FREE_TRANSACTIONS ?? 'false');
export const PROVIDER_FREE_TRANSACTIONS_LIMIT_MS = Bun.env.PROVIDER_FREE_TRANSACTIONS_LIMIT_MS;
export const PROVIDER_FREE_TRANSACTIONS_LIMIT_KB = Bun.env.PROVIDER_FREE_TRANSACTIONS_LIMIT_KB;

if (ENABLE_FREE_TRANSACTIONS) {
	if (!ENABLE_RESOURCE_PROVIDER) {
		throw new Error(
			'If ENABLE_FREE_TRANSACTIONS is set to true, ENABLE_RESOURCE_PROVIDER must also be set to true.'
		);
	}
	if (!PROVIDER_FREE_TRANSACTIONS_LIMIT_MS) {
		throw new Error(
			'If ENABLE_FREE_TRANSACTIONS is set to true, PROVIDER_FREE_TRANSACTIONS_LIMIT_MS must also be defined.'
		);
	}
	if (!PROVIDER_FREE_TRANSACTIONS_LIMIT_KB) {
		throw new Error(
			'If ENABLE_FREE_TRANSACTIONS is set to true, PROVIDER_FREE_TRANSACTIONS_LIMIT_KB must also be defined.'
		);
	}
}

// Feature: Resource Provider API - Cosign transactions to fee-based resources
export const ENABLE_PAID_TRANSACTIONS = isENVTrue(Bun.env.ENABLE_PAID_TRANSACTIONS ?? 'false');
export const PROVIDER_PAID_TRANSACTIONS_ASSET =
	Bun.env.ANTELOPE_SYSTEM_TOKEN ?? Bun.env.PROVIDER_PAID_TRANSACTIONS_ASSET;
export const PROVIDER_PAID_TRANSACTIONS_MINIMUM_FEE =
	Bun.env.PROVIDER_PAID_TRANSACTIONS_MINIMUM_FEE;

if (ENABLE_PAID_TRANSACTIONS) {
	if (!ENABLE_RESOURCE_PROVIDER) {
		throw new Error(
			'If ENABLE_PAID_TRANSACTIONS is set to true, ENABLE_RESOURCE_PROVIDER must also be set to true.'
		);
	}
	if (!PROVIDER_PAID_TRANSACTIONS_MINIMUM_FEE) {
		throw new Error(
			'If ENABLE_PAID_TRANSACTIONS is set to true, PROVIDER_PAID_TRANSACTIONS_MINIMUM_FEE must also be defined.'
		);
	}
}
