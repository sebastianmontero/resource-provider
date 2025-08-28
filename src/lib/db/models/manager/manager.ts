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
		const results = await database
			.select()
			.from(this.schema.manager)
			.where(eq(this.schema.manager.account, MANAGER_ACCOUNT_NAME))
			.limit(1)
			.catch((error) => {
				managerLog.error('Error fetching manager account from database', { error });
				throw error;
			});
		const manager = results[0];
		const key = MANAGER_ACCOUNT_PRIVATEKEY || String(PrivateKey.generate('K1'));
		if (!manager) {
			const values = {
				account: MANAGER_ACCOUNT_NAME,
				permission: MANAGER_ACCOUNT_PERMISSION || 'manager',
				key
			};
			managerLog.debug(
				'Creating database entry for manager account from environment variables.',
				objectify({
					...values,
					key: PrivateKey.from(key).toPublic()
				})
			);
			await database.insert(this.schema.manager).values(values).onConflictDoUpdate({
				target: this.schema.manager.account,
				set: values
			});
			return values;
		}
		return manager;
	}
}

export const managerAccount = new ManagerAccountDatabase();