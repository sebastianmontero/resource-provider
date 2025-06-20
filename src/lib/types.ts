import type { Int64 } from '@wharfkit/antelope';
import { t } from 'elysia';

export const TSigner = t.Object({
	actor: t.String(),
	permission: t.String()
});

export const TAction = t.Object({
	account: t.String(),
	name: t.String(),
	authorization: t.Array(TSigner),
	data: t.Any()
});

export const TTransaction = t.Object({
	expiration: t.String(),
	ref_block_num: t.Numeric(),
	ref_block_prefix: t.Numeric(),
	max_net_usage_words: t.Numeric(),
	max_cpu_usage_ms: t.Numeric(),
	delay_sec: t.Numeric(),
	context_free_actions: t.Array(t.Any()),
	actions: t.Array(TAction),
	transaction_extensions: t.Array(t.Any())
});

export const TPackedTransaction = t.Object({
	compression: t.Numeric(),
	packed_context_free_data: t.String(),
	packed_trx: t.String(),
	signatures: t.Array(t.String())
});

export const v2GenericResponse = t.Object({
	code: t.Number(),
	message: t.Optional(t.String())
});

export const v2GenericResponseError = t.Object({
	code: t.Number(),
	message: t.Optional(t.String()),
	error: t.Optional(t.Any())
});

export interface AccountResources {
	cpu: Int64;
	net: Int64;
	ram: Int64;
}
