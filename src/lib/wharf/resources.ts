import { Resources } from '@wharfkit/resources';

import { generalLog } from '$lib/logger';
import { objectify } from '$lib/utils';
import { client } from '$lib/wharf/client';

const sampleAccount = Bun.env.ANTELOPE_SAMPLE_ACCOUNT || 'eosio.reserv';

export const resourcesClient = new Resources({ api: client, sampleAccount });

export async function getSampledUsage() {
	const usage = await resourcesClient.getSampledUsage();
	generalLog.debug('Sampled Usage', objectify(usage));
	return usage;
}
