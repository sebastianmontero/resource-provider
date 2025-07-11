import { beforeEach, describe, expect, it } from 'bun:test';

import { UsageDatabase } from '$lib/db/models/provider/usage';

const usage = new UsageDatabase();

describe('Resource Provider (v2)', () => {
	// it('return a response', async () => {
	//     const response = await app
	//         .handle(new Request('http://localhost/'))
	//         .then((res) => res.text())
	//     expect(response).toBe('⛽')
	// })
	describe('Testing Database', () => {
		beforeEach(async () => {
			await usage.cleanUsage(0); // Clean up before each test
		});
		it('should be empty initially', async () => {
			const test = await usage.getUsage('eosio');
			expect(test).toEqual({ usage: 0 });
		});
		it('should add usage', async () => {
			await usage.addUsage('eosio', 100);
			const test = await usage.getUsage('eosio');
			expect(test).toEqual({ usage: 100 });
			await usage.addUsage('eosio', 100);
			const test2 = await usage.getUsage('eosio');
			expect(test2).toEqual({ usage: 200 });
		});
	});
});
