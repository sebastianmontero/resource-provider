import { Asset, Int64, Name } from '@wharfkit/antelope';
import { Database } from 'bun:sqlite';
import type { Changes } from 'bun:sqlite';
import type { Static } from 'elysia';

import type { v2ManagedAccountType } from '$api/v2/managed/types';
import { logger } from '$lib/logger';

const _dirname =
	import.meta.dir.startsWith('/$bunfs/root') || import.meta.dir.startsWith('B:\\~BUN\\root')
		? `${process.execPath}/..`
		: import.meta.dir;

const dbPath = `${_dirname}/${Bun.env.DATABASE_FILE}`;

export interface Usage {
	id?: number;
	account: string;
	usage: number;
}

export const defaultTtl = 60 * 60 * 24; // Default TTL of 1 day

export abstract class AbstractDatabase {
	protected db: Database;

	constructor() {
		this.db = new Database(dbPath, { create: true });
		this.init()
			.then(() => {
				logger.debug('Vacuuming database on startup', { dbPath });
				this.vacuum();
				logger.debug('Database initialized', { dbPath });
			})
			.catch(logger.error);
	}

	async init(): Promise<Changes> {
		throw new Error('Method not implemented.');
	}

	async vacuum() {
		return this.db.run('VACUUM');
	}
}

export class ManagedAccount {
	account: Name;
	min_cpu: Int64;
	min_net: Int64;
	inc_ms: Int64;
	inc_kb: Int64;
	max_fee: Asset;

	constructor(data: Static<typeof v2ManagedAccountType>) {
		this.account = Name.from(data.account);
		this.min_cpu = Int64.from(data.min_cpu);
		this.min_net = Int64.from(data.min_net);
		this.inc_ms = Int64.from(data.inc_ms);
		this.inc_kb = Int64.from(data.inc_kb);
		this.max_fee = Asset.from(data.max_fee);
	}
}

export class ManagedDatabase extends AbstractDatabase {
	async init() {
		return this.db.run(
			'CREATE TABLE IF NOT EXISTS accounts (account TEXT PRIMARY KEY, min_cpu INTEGER, min_net INTEGER, inc_ms INTEGER, inc_kb INTEGER, max_fee TEXT)'
		);
	}

	async addManagedAccount(data: ManagedAccount) {
		const query = this.db.query(
			'INSERT OR REPLACE INTO accounts (account, min_cpu, min_net, inc_ms, inc_kb, max_fee) VALUES ($account, $min_cpu, $min_net, $inc_ms, $inc_kb, $max_fee) RETURNING account'
		);
		const values = {
			$account: String(data.account),
			$min_cpu: BigInt(String(data.min_cpu)),
			$min_net: BigInt(String(data.min_net)),
			$inc_ms: BigInt(String(data.inc_ms)),
			$inc_kb: BigInt(String(data.inc_kb)),
			$max_fee: String(data.max_fee)
		};
		logger.debug('SQL/INSERT', {
			query: String(query),
			values
		});
		try {
			return query.run(values);
		} catch (error) {
			logger.error('Error adding new account', { error });
		}
	}

	async getManagedAccounts(): Promise<Array<Static<typeof v2ManagedAccountType>>> {
		const query = this.db.query('SELECT * FROM accounts');
		logger.debug('SQL/SELECT', { query: String(query) });
		const rows = query.all() as Array<Static<typeof v2ManagedAccountType>>;
		return rows;
	}
}

export class UsageDatabase extends AbstractDatabase {
	private ttl: number;

	constructor(ttl = defaultTtl) {
		super();
		this.ttl = ttl;
	}

	async init() {
		return this.db.run(
			'CREATE TABLE IF NOT EXISTS usage (id INTEGER PRIMARY KEY AUTOINCREMENT, account TEXT, usage INTEGER DEFAULT 0, ts INTEGER DEFAULT (unixepoch()))'
		);
	}

	async getUsage(account: string): Promise<{ usage: number }> {
		this.cleanUsage(); // Clean up old usage before adding new
		return this.db
			.query(`SELECT COALESCE(sum(usage), 0) as usage FROM usage WHERE account = ?`)
			.get(account) as { usage: number };
	}

	async addUsage(account: string, usage: number) {
		this.cleanUsage(); // Clean up old usage before adding new
		return this.db.run(`INSERT INTO usage (account, usage) VALUES (?, ?) RETURNING id`, [
			account,
			usage
		]);
	}

	async resetUsage(account: string) {
		return this.db.prepare(`DELETE FROM usage WHERE account = ?`).run(account);
	}

	async cleanUsage(ttl: number = this.ttl) {
		return this.db.prepare(`DELETE FROM usage WHERE ts < (unixepoch() - ?) LIMIT 100`).run(ttl);
	}
}
