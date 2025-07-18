import { Contract as NoopContract } from '../contracts/noop';
import { Contract as SystemContract } from '../contracts/system';
import { Contract as TokenContract } from '../contracts/token';

import { client } from '$lib/wharf/client';

export const noopContract = new NoopContract({ client, account: Bun.env.ANTELOPE_NOOP_CONTRACT });
export const systemContract = new SystemContract({
	client,
	account: Bun.env.ANTELOPE_SYSTEM_CONTRACT
});
export const tokenContract = new TokenContract({
	client,
	account: Bun.env.ANTELOPE_TOKEN_CONTRACT
});
