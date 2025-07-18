import fs from 'fs';
import path from 'path';

import { migrate as drizzleMigrate } from 'drizzle-orm/bun-sqlite/migrator';
import tempDir from 'temp-dir';

import { migrationData } from './migration-data.generated';

import { database } from '.';

import { generalLog } from '$lib/logger';

export const runMigrations = async () => {
	const migrationsFolder = path.join(tempDir, `chatfall-migrations-${Date.now()}`);
	fs.mkdirSync(migrationsFolder, { recursive: true });
	generalLog.debug(`Temporary migrations folder: ${migrationsFolder}`);

	// Populate the temporary folder with migration data
	for (const [filePath, content] of Object.entries(migrationData)) {
		const fullPath = path.join(migrationsFolder, filePath);
		fs.mkdirSync(path.dirname(fullPath), { recursive: true });
		fs.writeFileSync(fullPath, content as string);
	}

	try {
		await drizzleMigrate(database, { migrationsFolder });
		generalLog.debug('Migration successful');
	} catch (err) {
		generalLog.error('Migration failed:', err);
	} finally {
		fs.rmdirSync(migrationsFolder, { recursive: true });
	}
};
