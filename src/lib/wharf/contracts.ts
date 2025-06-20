import { Contract as NoopContract } from '../contracts/noop';
import { Contract as SystemContract } from '../contracts/system';
import { Contract as TokenContract } from '../contracts/token';

import { client } from '$lib/wharf/client';

export const noopContract = new NoopContract({ client });
export const systemContract = new SystemContract({ client });
export const tokenContract = new TokenContract({ client });
