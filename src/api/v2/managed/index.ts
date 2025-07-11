import { bearer } from '@elysiajs/bearer';
import { Elysia } from 'elysia';
import type { Static } from 'elysia';

import { guardAuthorization } from '../auth';

import { v2ManagerAccounts, v2ManagerRequest } from './types';
import type { v2ManagerRequestBody, v2ManagerResponseSuccess } from './types';

import { ManagedAccount, ManagedAccountDatabase } from '$lib/db/models/manager/account';

const db = new ManagedAccountDatabase();

export async function addManagedAccount({
	body
}: {
	body: Static<typeof v2ManagerRequestBody>;
}): Promise<Static<typeof v2ManagerResponseSuccess>> {
	const data = ManagedAccount.from({
		account: body.account,
		min_cpu: body.min_cpu,
		min_net: body.min_net,
		inc_ms: body.inc_ms,
		inc_kb: body.inc_kb,
		max_fee: body.max_fee
	});
	db.addManagedAccount(data);
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
