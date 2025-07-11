import { Asset, Int64, Name, Struct } from '@wharfkit/antelope';
import { eq } from 'drizzle-orm';
import { Static } from 'elysia';

import { v2ManagedAccountType } from '$api/v2/managed/types';
import { database } from '$lib/db';
import { AbstractDatabase } from '$lib/db/abstract';
import * as schema from '$lib/db/schema/accounts';

@Struct.type('managed_account')
export class ManagedAccount extends Struct {
	@Struct.field(Name) declare account: Name;
	@Struct.field(Int64) declare min_cpu: Int64;
	@Struct.field(Int64) declare min_net: Int64;
	@Struct.field(Int64) declare inc_ms: Int64;
	@Struct.field(Int64) declare inc_kb: Int64;
	@Struct.field(Asset) declare max_fee: Asset;

	toJSON(): typeof schema.users.$inferInsert {
		return {
			account: String(this.account),
			min_cpu: Number(this.min_cpu),
			min_net: Number(this.min_net),
			inc_ms: Number(this.inc_ms),
			inc_kb: Number(this.inc_kb),
			max_fee: String(this.max_fee)
		};
	}
}

export class ManagedAccountDatabase extends AbstractDatabase {
	async addManagedAccount(data: ManagedAccount) {
		return database.insert(this.schema.users).values(data.toJSON()).onConflictDoUpdate({
			target: this.schema.users.account,
			set: data.toJSON()
		});
	}

	async removeManagedAccount(account: string) {
		return database.delete(this.schema.users).where(eq(this.schema.users.account, account));
	}

	async getManagedAccounts(): Promise<Array<Static<typeof v2ManagedAccountType>>> {
		return database.select().from(this.schema.users);
	}
}

export const managedAccounts = new ManagedAccountDatabase();
