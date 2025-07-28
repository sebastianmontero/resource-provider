import { SigningRequest } from '@wharfkit/signing-request';
import { Command } from 'commander';

import { managerLog } from '$lib/logger';
import {
	checkManagerAccount,
	makeDeleteAuthAction,
	makeUnlinkAuthAction
} from '$lib/manager/setup';
import { objectify } from '$lib/utils';
import { getManagerSession } from '$lib/wharf/session/manager';
import { ANTELOPE_CHAIN_ID, explorers } from 'src/config';

export function makeManagerDeleteCommand() {
	const command = new Command('delete')
		.description(
			'Remove the resource management permissions from the manager account. The "manager setup" command will need to be run to re-enable resource management.'
		)
		.action(async () => {
			const manager = getManagerSession();
			const status = await checkManagerAccount(manager);

			const actions = [];
			if (!status.requiresLinkAuth) {
				actions.push(makeUnlinkAuthAction(manager));
			}
			if (!status.requiresUpdateAuth) {
				actions.push(makeDeleteAuthAction(manager));
			}

			if (!actions.length) {
				console.log(
					'Delete not required. Manager account is already missing the required permissions.'
				);
				console.log('\n');
				console.log('View current account permissions on Unicove using the URL below:');
				console.log('\n');
				console.log(`${explorers[ANTELOPE_CHAIN_ID]}/account/${manager.actor}/permissions`);
				return;
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
				'Complete the following transaction remove the permissions on the manager account:'
			);
			console.log('\n');
			if (explorers[ANTELOPE_CHAIN_ID]) {
				console.log(`${explorers[ANTELOPE_CHAIN_ID]}/prompt/${request.encode(false, false, '')}`);
			} else {
				console.log(`Using Anchor: ${request.encode()}`);
			}
		});
	return command;
}
