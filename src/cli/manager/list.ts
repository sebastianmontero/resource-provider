import { Command } from 'commander';

import { managedAccounts } from '$lib/db/models/manager/account';
import { objectify } from '$lib/utils';

export function makeManagerListCommand() {
	const command = new Command('list');
	command.description('List all managed accounts').action(async () => {
		const accounts = await managedAccounts.getManagedAccounts();
		if (accounts.length === 0) {
			console.table([{ message: 'No managed accounts found in database.' }]);
			return;
		}
		console.table(objectify(accounts));
	});
	return command;
}
