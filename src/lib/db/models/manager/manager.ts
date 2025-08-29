import { PrivateKey } from '@wharfkit/antelope';
import { eq } from 'drizzle-orm';

import { database } from '$lib/db';
import { AbstractDatabase } from '$lib/db/abstract';
import { managerLog } from '$lib/logger';
import { objectify } from '$lib/utils';
import {
	MANAGER_ACCOUNT_NAME,
	MANAGER_ACCOUNT_PRIVATEKEY,
	MANAGER_ACCOUNT_PERMISSION
} from 'src/config';

export class ManagerAccountDatabase extends AbstractDatabase {
	async getManagerAccount() {
		return {
			account: MANAGER_ACCOUNT_NAME,
			permission: MANAGER_ACCOUNT_PERMISSION || 'manager',
			key: MANAGER_ACCOUNT_PRIVATEKEY
		};
	}
}

export const managerAccount = new ManagerAccountDatabase();