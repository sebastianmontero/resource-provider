import { Command } from 'commander';

import { managerJob } from 'src/manager';

export function makeManagerRunCommand() {
	const command = new Command('run');
	command.description('Execute a single run of the resource manager service').action(() => {
		managerJob();
	});
	return command;
}
