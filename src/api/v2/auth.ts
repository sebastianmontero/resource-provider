import type { Context } from 'elysia';

function requireAuthorization({ bearer, set }: { bearer: string; set: Context['set'] }) {
	// TODO: Implement bearer token validation logic
	if (!bearer) {
		return (set.status = 'Unauthorized');
	}
}

export const guardAuthorization = {
	beforeHandle: requireAuthorization
};
