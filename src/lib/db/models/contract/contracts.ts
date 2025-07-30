import { ABI, NameType } from '@wharfkit/antelope';
import { ContractKit } from '@wharfkit/contract';
import { eq } from 'drizzle-orm';

import { database } from '$lib/db';
import { AbstractDatabase } from '$lib/db/abstract';
import { generalLog } from '$lib/logger';
import { client } from '$lib/wharf/client';

export class ContractsDatabase extends AbstractDatabase {
	async save(contract: NameType, abi: ABI) {
		return database
			.insert(this.schema.contracts)
			.values({ contract: String(contract), abi: JSON.stringify(abi) })
			.onConflictDoUpdate({
				target: this.schema.contracts.contract,
				set: { abi: JSON.stringify(abi) }
			});
	}
	async load(contract: NameType): Promise<ABI> {
		const result = await database
			.select()
			.from(this.schema.contracts)
			.where(eq(this.schema.contracts.contract, String(contract)));
		if (!result.length) {
			const kit = new ContractKit({ client });
			generalLog.info(`No ABI found for "${contract}" contract, caching...`);
			const result = await kit.load(contract);
			if (!result) {
				throw new Error(`Failed to load contract: ${contract}`);
			}
			contractsDatabase.save(contract, result.abi);
			return result.abi;
		}
		return ABI.from(result[0].abi);
	}
	async clear() {
		return database.delete(this.schema.contracts);
	}
}

export const contractsDatabase = new ContractsDatabase();
