import { SigningRequest } from '@wharfkit/signing-request';
import { Command } from 'commander';

import { managerLog } from '$lib/logger';
import { checkManagerAccount, makeLinkAuthAction, makeUpdateAuthAction } from '$lib/manager/setup';
import { objectify } from '$lib/utils';
import { getManagerSession } from '$lib/wharf/session/manager';

export function makeManagerSetupCommand() {
	const command = new Command('setup')
		.description('Create a signing request to configure account permissions for a specific service')
		.action(async () => {
			const manager = getManagerSession();
			const status = await checkManagerAccount(manager);

			const actions = [];
			if (status.requiresUpdateAuth) {
				actions.push(makeUpdateAuthAction(manager));
			}
			if (status.requiresLinkAuth) {
				actions.push(makeLinkAuthAction(manager));
			}

			managerLog.debug(
				'Manager Account Status',
				objectify({
					actor: manager.actor,
					permission: manager.permission,
					status
				})
			);

			const request = await SigningRequest.create({
				actions
			});

			console.log(
				'Complete the following transaction setup the permissions on the manager account:'
			);
			console.log(request.encode());
		});
	return command;
}
