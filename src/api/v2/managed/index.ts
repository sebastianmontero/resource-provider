import { bearer } from '@elysiajs/bearer';
import { Asset, Int64, Name } from '@wharfkit/antelope';
import { Elysia } from 'elysia';
import type { Static } from 'elysia';

import { guardAuthorization } from '../auth';

import { v2ManagerAccounts, v2ManagerRequest } from './types';
import type { v2ManagerRequestBody, v2ManagerResponseSuccess } from './types';

import { ManagedDatabase } from '$lib/sqlite/db';

const db = new ManagedDatabase();

export async function addManagedAccount({
	body
}: {
	body: Static<typeof v2ManagerRequestBody>;
}): Promise<Static<typeof v2ManagerResponseSuccess>> {
	db.addManagedAccount({
		account: Name.from(body.account),
		min_cpu: Int64.from(body.min_cpu),
		min_net: Int64.from(body.min_net),
		inc_ms: Int64.from(body.inc_ms),
		inc_kb: Int64.from(body.inc_kb),
		max_fee: Asset.from(body.max_fee)
	});
	return {
		code: 200,
		message: 'Account added for management'
	};
}

export async function getManagedAccounts() {
	return db.getManagedAccounts();
}

export const managed = new Elysia()
	.use(bearer())
	.guard(guardAuthorization, (guarded) =>
		guarded.post('/manage', addManagedAccount, v2ManagerRequest)
	)
	.get('/accounts', getManagedAccounts, v2ManagerAccounts);
