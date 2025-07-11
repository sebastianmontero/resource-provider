import { Asset } from '@wharfkit/antelope';
import { Argument, Command } from 'commander';

import { ManagedAccount, managedAccounts } from '$lib/db/models/manager/account';
import { managerLog } from '$lib/logger';

export function makeManagerAddCommand() {
	const command = new Command('add');
	command
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
			const data = new ManagedAccount({
				account,
				min_cpu,
				min_net,
				inc_ms,
				inc_kb,
				max_fee: String(Asset.fromFloat(Number(max_fee), Bun.env.ANTELOPE_SYSTEM_TOKEN))
			});
			managerLog.info('Adding account to manage', data);
			managedAccounts.addManagedAccount(data);
		});
	return command;
}
