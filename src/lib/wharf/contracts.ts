import { Contract as NoopContract } from '../contracts/noop';
import { Contract as SystemContract } from '../contracts/system';
import { Contract as TokenContract } from '../contracts/token';

import { client } from '$lib/wharf/client';
import {
	ANTELOPE_NOOP_CONTRACT,
	ANTELOPE_SYSTEM_CONTRACT,
	ANTELOPE_TOKEN_CONTRACT
} from 'src/config';

export const noopContract = new NoopContract({ client, account: ANTELOPE_NOOP_CONTRACT });
export const systemContract = new SystemContract({
	client,
	account: ANTELOPE_SYSTEM_CONTRACT
});
export const tokenContract = new TokenContract({
	client,
	account: ANTELOPE_TOKEN_CONTRACT
});
