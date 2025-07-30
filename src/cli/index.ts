import { Argument, Command } from 'commander';

import { version } from '../../package.json';
import { generalLog } from '../lib/logger';
import { manager } from '../manager';
import { server } from '../provider';

import { makeManagerAddCommand } from './manager/add';
import { makeManagerUnauthorizeCommand } from './manager/delete';
import { makeManagerListCommand } from './manager/list';
import { makeManagerRemoveCommand } from './manager/remove';
import { makeManagerRunCommand } from './manager/run';
import { makeManagerSetupCommand } from './manager/setup';

import { UsageDatabase, defaultTtl } from '$lib/db/models/provider/usage';

const services = ['all', 'api', 'manager'];

export function prompt() {
	const usage = new UsageDatabase();
	const program = new Command();
	program
		.version(version)
		.name('resource-provider')
		.description('Antelope Resource Provider Service');

	program.commandsGroup('Run Service');
	program
		.command('start')
		.addArgument(
			new Argument('[service]', 'The service name to start').default('all').choices(services)
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

	program.commandsGroup('Resource Manager');
	const manage = program
		.command('manager [add|list|remove|run|setup|delete]')
		.description('Manage resources for defined accounts automatically.');
	manage.addCommand(makeManagerAddCommand());
	manage.addCommand(makeManagerListCommand());
	manage.addCommand(makeManagerRemoveCommand());
	manage.addCommand(makeManagerRunCommand());
	manage.addCommand(makeManagerSetupCommand());
	manage.addCommand(makeManagerUnauthorizeCommand());

	// TODO: Implement the permissions command
	// This command should read the cosigner's account information and determine which permissions are needed
	// for the cosigner to operate. It then should create a signing request and embed it in a Unicove URL
	// that can be used to easily update the account.

	program.commandsGroup('User Management');
	program
		.command('expire')
		.description('Expire all usage records which are older than the specified seconds')
		.option('-s, --seconds [seconds]', 'Seconds to expire usage records', String(defaultTtl)) // Default to 1 day
		.action(({ seconds }) => {
			generalLog.info(`Cleaning usage records older than ${seconds} seconds`);
			// usage.cleanUsage(seconds);
		});
	program
		.command('reset')
		.description('Expire all usage records which are older than the specified seconds')
		.argument('<string>', 'account name to add usage for')
		.action((name) => {
			generalLog.info(`Resetting all usage records for ${name}`);
			// usage.resetUsage(name);
		});
	program
		.command('usage')
		.description('Get the total usage for a specific account name')
		.argument('<string>', 'account name to query')
		.action(async (name) => {
			generalLog.info(`Counting usage for name: ${name}`);
			// generalLog.info(await usage.getUsage(name));
		});
	program.commandsGroup('Database Management');
	program
		.command('vacuum')
		.description('Force SQLITE3 database vacuum')
		.action(() => {
			generalLog.info('Vacuuming database');
			usage.vacuum();
		});
	program.commandsGroup('Debug');
	program
		.command('add')
		.argument('<string>', 'account name to add usage for')
		.action((name) => {
			generalLog.info(`Adding usage for name: ${name}`);
			// usage.addUsage(name, 10);
		});
	program.parse(process.argv);
}
