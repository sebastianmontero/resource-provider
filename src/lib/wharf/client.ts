import { APIClient } from '@wharfkit/antelope';

import { ANTELOPE_NODEOS_API } from 'src/config';

export const client = new APIClient({ url: ANTELOPE_NODEOS_API });
