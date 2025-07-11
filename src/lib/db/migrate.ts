import { migrate } from 'drizzle-orm/bun-sqlite/migrator';

import { database } from '.';

export function runMigrations() {
	migrate(database, { migrationsFolder: './drizzle' });
}
