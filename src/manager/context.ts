import { SampleUsage, PowerUpState } from '@wharfkit/resources';
import { Static } from 'elysia';

import { v2ManagedAccountType } from '$api/v2/manager/types';
import { ManagedAccountDatabase, managedAccounts } from '$lib/db/models/manager/account';
import { getSampledUsage, getResourcesClient } from '$lib/wharf/resources';

export interface ManagerContext {
	db: ManagedAccountDatabase;
	managedAccounts: Array<Static<typeof v2ManagedAccountType>>;
	sampleUsage: SampleUsage;
	powerup: PowerUpState;
}

export async function getManagerContext(): Promise<ManagerContext> {
	return {
		db: managedAccounts,
		managedAccounts: await managedAccounts.getManagedAccounts(),
		sampleUsage: await getSampledUsage(),
		powerup: await getResourcesClient().v1.powerup.get_state()
	};
}
