import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';

import { generalLog } from '$lib/logger';

const _dirname =
	import.meta.dir.startsWith('/$bunfs/root') || import.meta.dir.startsWith('B:\\~BUN\\root')
		? `${process.execPath}/..`
		: import.meta.dir;

export const dbPath = `${_dirname}/${Bun.env.DATABASE_FILE}`;

generalLog.debug('Using database file', { dbPath });

const sqlite = new Database(dbPath, { create: true });
export const database = drizzle({ client: sqlite });
