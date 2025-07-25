import { Elysia } from 'elysia';

import { managed } from './manager';
import { provider } from './provider';

export const v2 = new Elysia()
	.group('/v2', (root) =>
		root.group('/resource', (resource) =>
			resource
				.group('/manager', (app) => app.use(managed))
				.group('/provider', (app) => app.use(provider))
		)
	)
	.onError((context) => {
		switch (context.code) {
			case 'VALIDATION':
				return {
					message: String(context.error),
					all: context.error.all
				};
			default:
				return {
					message: String(context.error)
				};
		}
	});
