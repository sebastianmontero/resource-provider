import { ContractKit } from '@wharfkit/contract';

import { generalLog } from '$lib/logger';
import { client } from '$lib/wharf/client';
import {
	ANTELOPE_NODEOS_API,
	ANTELOPE_NOOP_CONTRACT,
	ANTELOPE_SYSTEM_CONTRACT,
	ANTELOPE_TOKEN_CONTRACT
} from 'src/config';

const kit = new ContractKit({ client });

export const noopContract = await kit.load(ANTELOPE_NOOP_CONTRACT);
generalLog.info(`Loaded noop contract`, {
	contract: ANTELOPE_NOOP_CONTRACT,
	url: ANTELOPE_NODEOS_API
});

export const systemContract = await kit.load(ANTELOPE_SYSTEM_CONTRACT);
generalLog.info(`Loaded system contract`, {
	contract: ANTELOPE_SYSTEM_CONTRACT,
	url: ANTELOPE_NODEOS_API
});

export const tokenContract = await kit.load(ANTELOPE_TOKEN_CONTRACT);
generalLog.info(`Loaded token contract`, {
	contract: ANTELOPE_TOKEN_CONTRACT,
	url: ANTELOPE_NODEOS_API
});
