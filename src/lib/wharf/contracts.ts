import { Contract } from '@wharfkit/contract';

import { contractsDatabase } from '$lib/db/models/contract/contracts';
import { client } from '$lib/wharf/client';
import {
	ANTELOPE_NOOP_CONTRACT,
	ANTELOPE_SYSTEM_CONTRACT,
	ANTELOPE_TOKEN_CONTRACT
} from 'src/config';

const noop = await contractsDatabase.load(ANTELOPE_NOOP_CONTRACT);
export const noopContract = new Contract({
	abi: noop,
	account: ANTELOPE_NOOP_CONTRACT,
	client
});

const system = await contractsDatabase.load(ANTELOPE_SYSTEM_CONTRACT);
export const systemContract = new Contract({
	abi: system,
	account: ANTELOPE_SYSTEM_CONTRACT,
	client
});

const token = await contractsDatabase.load(ANTELOPE_TOKEN_CONTRACT);
export const tokenContract = new Contract({
	abi: token,
	account: ANTELOPE_TOKEN_CONTRACT,
	client
});
