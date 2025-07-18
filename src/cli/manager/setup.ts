import { PrivateKey } from '@wharfkit/antelope';
import { SigningRequest } from '@wharfkit/signing-request';
import { Command } from 'commander';

import { managerLog } from '$lib/logger';
import { objectify } from '$lib/utils';
import { client } from '$lib/wharf/client';
import { systemContract } from '$lib/wharf/contracts';
import { getManagerSession } from '$lib/wharf/session/manager';

export function makeManagerSetupCommand() {
	const command = new Command('setup')
		.description('Create a signing request to configure account permissions for a specific service')
		.action(async () => {
			if (!Bun.env.ANTELOPE_SYSTEM_CONTRACT) {
				throw new Error('ANETELOPE_SYSTEM_CONTRACT environment variable is not set');
			}
			const systemContractName = Bun.env.ANTELOPE_SYSTEM_CONTRACT;

			const manager = getManagerSession();
			managerLog.info(
				'Manager Account',
				objectify({
					actor: manager.actor,
					permission: manager.permission
				})
			);

			const actions = [];

			const account = await client.v1.chain.get_account(manager.actor);
			managerLog.info('Current Account Permissions', objectify(account.permissions));

			const permission = account.permissions.find((p) => p.perm_name.equals(manager.permission));
			if (!permission) {
				const params = {
					account: manager.actor,
					permission: manager.permission,
					parent: 'active',
					auth: {
						threshold: 1,
						keys: [
							{
								key: PrivateKey.from(manager.walletPlugin.data.privateKey).toPublic(),
								weight: 1
							}
						],
						accounts: [],
						waits: []
					}
				};
				managerLog.info(
					'Permission not found, creating signing request to set up permission',
					objectify(params)
				);
				actions.push(systemContract.action('updateauth', params));
			} else {
				managerLog.info('Existing permission found', objectify(permission));
				const actionLinked = permission.linked_actions.find((a) =>
					a.account.equals(systemContractName)
				);
				if (actionLinked) {
					managerLog.info(
						'Existing linked actions for permission',
						objectify(permission.linked_actions)
					);
				} else {
					const params = {
						account: manager.actor,
						requirement: manager.permission,
						code: systemContractName,
						type: 'powerup'
					};
					managerLog.info(
						'No linked actions for permission, creating signing request to update permission',
						objectify(params)
					);
					actions.push(systemContract.action('linkauth', params));
				}
			}

			console.log('actions', objectify(actions));

			const request = await SigningRequest.create({
				actions
			});
			console.log('Signing Request URI:', request.encode());
		});
	return command;
}
