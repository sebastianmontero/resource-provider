import {Database} from 'bun:sqlite'
import {logger} from '../logger'

const _dirname =
    import.meta.dir.startsWith('/$bunfs/root') || import.meta.dir.startsWith('B:\\~BUN\\root')
        ? `${process.execPath}/..`
        : import.meta.dir

const dbPath = `${_dirname}/${Bun.env.DATABASE_FILE}`
export interface Usage {
    id?: number
    account: string
    usage: number
}

export const defaultTtl = 60 * 60 * 24 // Default TTL of 1 day

export class UsageDatabase {
    private db: Database
    private ttl: number

    constructor(ttl = defaultTtl) {
        this.db = new Database(dbPath, {create: true})
        this.ttl = ttl
        this.init()
            .then(() => {
                logger.debug('Vacuuming database on startup', {dbPath})
                this.vacuum()
                logger.debug('Database initialized', {dbPath})
            })
            .catch(logger.error)
    }

    async init() {
        return this.db.run(
            'CREATE TABLE IF NOT EXISTS usage (id INTEGER PRIMARY KEY AUTOINCREMENT, account TEXT, usage INTEGER DEFAULT 0, ts INTEGER DEFAULT (unixepoch()))'
        )
    }

    async getUsage(account: string): Promise<{usage: number}> {
        return this.db
            .query(`SELECT COALESCE(sum(usage), 0) as usage FROM usage WHERE account = ?`)
            .get(account) as {usage: number}
    }

    async addUsage(account: string, usage: number) {
        this.cleanUsage() // Clean up old usage before adding new
        return this.db.run(`INSERT INTO usage (account, usage) VALUES (?, ?) RETURNING id`, [
            account,
            usage,
        ])
    }

    async resetUsage(account: string) {
        return this.db.prepare(`DELETE FROM usage WHERE account = ?`).run(account)
    }

    async cleanUsage(ttl: number = this.ttl) {
        return this.db.prepare(`DELETE FROM usage WHERE ts < (unixepoch() - ?) LIMIT 100`).run(ttl)
    }

    async vacuum() {
        return this.db.run('VACUUM')
    }
}
