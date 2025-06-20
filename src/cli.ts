import { Asset, Int64, Name } from '@wharfkit/antelope';
import { Argument, Command } from 'commander';

import { version } from '../package.json';

import { logger } from './lib/logger';
import { ManagedDatabase, UsageDatabase, defaultTtl } from './lib/sqlite/db';
import { manager } from './manager';
import { server } from './server';

import { objectify } from '$lib/utils';

export function prompt() {
	const managed = new ManagedDatabase();
	const usage = new UsageDatabase();
	const program = new Command();
	program
		.version(version)
		.name('resource-provider')
		.description('Antelope Resource Provider Service');
	program.commandsGroup('Service');
	program
		.command('start')
		.addArgument(
			new Argument('[service]', 'The service name to start')
				.default('all')
				.choices(['all', 'api', 'manager'])
		)
		.description('Run one or more resource provider services (e.g. all, api, manager)')
		.action((service) => {
			if (service === 'all' || service === 'api') {
				server();
			}
			if (service === 'all' || service === 'manager') {
				manager();
			}
		});
	program.commandsGroup('Account Management');
	program
		.command('resources <account>')
		.description('View current resources of an account')
		.action(() => {
			logger.warn('Not yet implemented');
		});

	// command managed
	program
		.command('managed')
		.description('List all managed accounts')
		.action(async () => {
			const accounts = await managed.getManagedAccounts();
			if (accounts.length === 0) {
				logger.warn('No managed accounts found in database.');
				return;
			}
			console.table(objectify(accounts));
		});

	// command manage account <account> <min_cpu> <min_net> <inc_ms> <inc_kb> <max_fee>
	program
		.command('manage')
		.addArgument(new Argument('<account>', 'The account name to manage'))
		.addArgument(
			new Argument(
				'<min_cpu>',
				'Minimum CPU available for account in milliseconds (e.g. 1 for 1ms/1000µs)'
			)
		)
		.addArgument(
			new Argument(
				'<min_net>',
				'Minimum NET available for account in kilobytes (e.g. 1 for 1kB/1000b)'
			)
		)
		.addArgument(
			new Argument('<inc_ms>', 'CPU increment per powerup in milliseconds (e.g. 1 for 1ms/1000µs)')
		)
		.addArgument(
			new Argument('<inc_kb>', 'NET increment per powerup in kilobytes (e.g. 1 for 1kB/1000b)')
		)
		.addArgument(
			new Argument(
				'<max_fee>',
				`Maximum fee the provider can charge for a single powerup (e.g. 1 for ${Asset.fromFloat(1, Bun.env.ANTELOPE_SYSTEM_TOKEN)})`
			)
		)
		.description('Automatically manage CPU/NET resources for an account')
		.action((account, min_cpu, min_net, inc_ms, inc_kb, max_fee) => {
			logger.info('Adding account to manage', {
				account,
				min_cpu,
				min_net,
				inc_ms,
				inc_kb,
				max_fee
			});
			managed.addManagedAccount({
				account: Name.from(account),
				min_cpu: Int64.from(min_cpu),
				min_net: Int64.from(min_net),
				inc_ms: Int64.from(inc_ms),
				inc_kb: Int64.from(inc_kb),
				max_fee: Asset.fromFloat(Number(max_fee), Bun.env.ANTELOPE_SYSTEM_TOKEN)
			});
		});

	// command manage remove <account>
	program
		.command('remove <account>')
		.description('Remove an account from automatic resource management')
		.action(() => {
			logger.warn('Not yet implemented');
		});

	// TODO: Implement the permissions command
	// This command should read the cosigner's account information and determine which permissions are needed
	// for the cosigner to operate. It then should create a signing request and embed it in a Unicove URL
	// that can be used to easily update the account.
	program
		.command('permissions <service>')
		.description('Create a signing request to configure account permissions for a specific service')
		.action(() => {
			logger.warn('Not yet implemented');
		});
	program.commandsGroup('User Management');
	program
		.command('expire')
		.description('Expire all usage records which are older than the specified seconds')
		.option('-s, --seconds [seconds]', 'Seconds to expire usage records', String(defaultTtl)) // Default to 1 day
		.action(({ seconds }) => {
			logger.info(`Cleaning usage records older than ${seconds} seconds`);
			usage.cleanUsage(seconds);
		});
	program
		.command('reset')
		.description('Expire all usage records which are older than the specified seconds')
		.argument('<string>', 'account name to add usage for')
		.action((name) => {
			logger.info(`Resetting all usage records for ${name}`);
			usage.resetUsage(name);
		});
	program
		.command('usage')
		.description('Get the total usage for a specific account name')
		.argument('<string>', 'account name to query')
		.action(async (name) => {
			logger.info(`Counting usage for name: ${name}`);
			logger.info(await usage.getUsage(name));
		});
	program.commandsGroup('Database Management');
	program
		.command('vacuum')
		.description('Force SQLITE3 database vacuum')
		.action(() => {
			logger.info('Vacuuming database');
			usage.vacuum();
		});
	program.commandsGroup('Debug');
	program
		.command('add')
		.argument('<string>', 'account name to add usage for')
		.action((name) => {
			logger.info(`Adding usage for name: ${name}`);
			usage.addUsage(name, 10);
		});
	program.parse(process.argv);
}
