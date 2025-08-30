import { Database } from 'bun:sqlite';
import { drizzle as drizzleBun } from 'drizzle-orm/bun-sqlite';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';

import { generalLog } from '$lib/logger';
import { DATABASE_ADAPTER, DATABASE_FILE, DATABASE_URL } from 'src/config';

let db;

if (DATABASE_ADAPTER === 'sqlite') {
	const _dirname =
		import.meta.dir.startsWith('/$bunfs/root') || import.meta.dir.startsWith('B:\~BUN\root')
			? `${process.execPath}/..` // bun binary location
			: `${import.meta.dir}/../../..`; // root of the project

	const dbPath = `${_dirname}/${DATABASE_FILE}`;

	generalLog.debug('Using database file', { dbPath });

	const sqlite = new Database(dbPath, { create: true });
	db = drizzleBun({ client: sqlite });
} else if (DATABASE_ADAPTER === 'postgres') {
	// generalLog.info(`Connecting to Postgres database with URL1: '${DATABASE_URL}'`);
	// const client = new Client({
	// 	connectionString: DATABASE_URL,
	// 	ssl: {
	// 		rejectUnauthorized: false
	// 	}
	// });
	// await client.connect();
	db = drizzlePg({
		connection: {
			connectionString: DATABASE_URL!,
			ssl: {
				rejectUnauthorized: false
			}
		}
	});
} else {
	throw new Error(`Unsupported database adapter: ${DATABASE_ADAPTER}`);
}

export const database = db;
