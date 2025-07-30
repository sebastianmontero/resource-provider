import { APIClient } from '@wharfkit/antelope';

import { ANTELOPE_NODEOS_API } from 'src/config';

export function getClient() {
	if (!ANTELOPE_NODEOS_API) {
		throw new Error('The ANTELOPE_NODEOS_API value must be configured.');
	}
	return new APIClient({ url: ANTELOPE_NODEOS_API });
}
