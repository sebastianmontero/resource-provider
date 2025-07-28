import { SigningRequest } from '@wharfkit/signing-request';
import { Command } from 'commander';

import { managerLog } from '$lib/logger';
import { checkManagerAccount, makeLinkAuthAction, makeUpdateAuthAction } from '$lib/manager/setup';
import { objectify } from '$lib/utils';
import { getManagerSession } from '$lib/wharf/session/manager';
import { ANTELOPE_CHAIN_ID, explorers } from 'src/config';

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

			if (!actions.length) {
				console.log(
					'Setup not required. Manager account is already configured with the required permissions.'
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
				'Complete the following transaction setup the permissions on the manager account:'
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
