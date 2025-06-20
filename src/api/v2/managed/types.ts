import { t } from 'elysia';

import { v2GenericResponse } from '$lib/types';

const tags = ['Resource Manager'];

export const v2ManagedAccountType = t.Object({
	account: t.String(),
	min_cpu: t.Integer(),
	min_net: t.Integer(),
	inc_ms: t.Integer(),
	inc_kb: t.Integer(),
	max_fee: t.String()
});

export const v2ManagerRequestBody = t.Object(v2ManagedAccountType.properties, {
	examples: [
		{
			account: 'test.gm',
			min_cpu: 10,
			min_net: 10,
			inc_ms: 5,
			inc_kb: 5,
			max_fee: '0.1000 A'
		}
	]
});

export const v2ManagerResponseSuccess = t.Object(v2GenericResponse.properties, {
	description: 'Successful response from the manager service.'
});

export const v2ManagerAccounts = {
	response: t.Array(v2ManagedAccountType),
	detail: {
		summary: 'List Managed Accounts',
		description: 'List the accounts currently managed by this service.',
		tags
	}
};

export const v2ManagerRequest = {
	body: v2ManagerRequestBody,
	detail: {
		summary: 'Add Managed Account',
		description: 'Add an account to manage resources for on behalf of this service.',
		tags
	},
	response: {
		200: v2ManagerResponseSuccess
	}
};
