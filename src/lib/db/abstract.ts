import { Changes } from 'bun:sqlite';

import { database } from '.';

import * as schema from '$lib/db/schema/accounts';

export abstract class AbstractDatabase {
	protected db = database;
	protected schema = schema;

	async init(): Promise<Changes> {
		throw new Error(
			'AbstractDatabase::init() - Method not implemented in abstract class, must be implemented in child.'
		);
	}

	async vacuum() {
		return this.db.run('VACUUM');
	}
}
