import { Argument, Command } from 'commander';

import { managedAccounts } from '$lib/db/models/manager/account';
import { managerLog } from '$lib/logger';

export function makeManagerRemoveCommand() {
	const command = new Command('remove');
	command
		.addArgument(new Argument('<account>', 'The account name to remove from management'))
		.description('Remove an account from automatic resource management')
		.action((account) => {
			managerLog.info('Removing account from management', { account });
			managedAccounts.removeManagedAccount(account);
		});
	return command;
}
