import { Resources } from '@wharfkit/resources';

import { generalLog } from '$lib/logger';
import { objectify } from '$lib/utils';
import { client } from '$lib/wharf/client';
import { ANTELOPE_SAMPLE_ACCOUNT } from 'src/config';

export const resourcesClient = new Resources({
	api: client,
	sampleAccount: ANTELOPE_SAMPLE_ACCOUNT
});

export async function getSampledUsage() {
	const usage = await resourcesClient.getSampledUsage();
	generalLog.debug('Sampled Usage', objectify(usage));
	return usage;
}
