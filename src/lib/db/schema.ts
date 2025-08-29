import { integer, pgTable, text } from 'drizzle-orm/pg-core';

export const users = pgTable('accounts', {
	account: text('account').primaryKey(),
	min_ms: integer('min_ms').notNull(),
	min_net_kb: integer('min_net_kb').notNull(),
	min_ram_kb: integer('min_ram_kb').notNull(),
	inc_ms: integer('inc_ms').notNull(),
	inc_net_kb: integer('inc_net_kb').notNull(),
	inc_ram_kb: integer('inc_ram_kb').notNull(),
	max_fee: text('max_fee').notNull()
});

export const contracts = pgTable('contracts', {
	contract: text('contract').primaryKey(),
	abi: text('abi').notNull()
});

export const manager = pgTable('manager', {
	account: text('account').primaryKey(),
	permission: text('permission').notNull(),
	key: text('key').notNull()
});