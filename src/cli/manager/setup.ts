import { SigningRequest } from '@wharfkit/signing-request';
import { Command } from 'commander';

import { managerLog } from '$lib/logger';
import { makeLinkAuthAction, makeUpdateAuthAction } from '$lib/manager/setup';
import { objectify } from '$lib/utils';
import { getClient } from '$lib/wharf/client';
import { getManagerSession } from '$lib/wharf/session/manager';
import {
	ANTELOPE_CHAIN_ID,
	explorers,
	MANAGER_ACCOUNT_NAME,
	MANAGER_BUYRAM_ACTION
} from 'src/config';
import { getManagerAccountStatus } from 'src/manager/manage/manager';

export function makeManagerSetupCommand() {
	const command = new Command('setup')
		.description('Create a signing request to configure account permissions for a specific service')
		.action(async () => {
			if (!MANAGER_ACCOUNT_NAME) {
				managerLog.error(
					'MANAGER_ACCOUNT_NAME is not set. Please set this environment variable to the account name you wish to configure.'
				);
				return;
			}
			const manager = await getManagerSession();
			const data = await getClient().v1.chain.get_account(manager.actor);
			const status = getManagerAccountStatus(manager, data);

			const actions = [];
			if (status.requiresUpdateAuth) {
				actions.push(await makeUpdateAuthAction(manager, status.existingPermission));
			}
			if (status.requiresLinkAuthPowerup) {
				actions.push(await makeLinkAuthAction(manager, 'powerup'));
			}
			if (status.requiresLinkAuthBuyRAM) {
				actions.push(await makeLinkAuthAction(manager, MANAGER_BUYRAM_ACTION));
			}

			if (!actions.length) {
				console.log('\n');
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

			console.log('\n');
			console.log(
				'Complete the following transaction setup the permissions on the manager account:'
			);
			console.log('\n');
			if (explorers[ANTELOPE_CHAIN_ID]) {
				console.log(`${explorers[ANTELOPE_CHAIN_ID]}/prompt/${request.encode(false, false, '')}`);
			} else {
				console.log(`Using Anchor: ${request.encode()}`);
			}

			if (status.existingPermission) {
				console.log('\n');
				console.log(
					'Note: An existing key was found on the manager permission. The existing key will be retained in addition to the new key being added.'
				);
			}
		});
	return command;
}
