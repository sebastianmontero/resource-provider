import { beforeAll, describe, expect, it } from 'bun:test';
import type { Elysia } from 'elysia';

import { server } from '../src/server';

// Transfer from the signer to null.vaulta
const mockRequest =
	'esr://gmNgZGBY1mTC_MoglIGBIVzX5uxZRqAQGDBBaWeYABgAVcL4LK7-wSBaKSi1OL-0KDlVoaAovywzJbVIoSS1uEShpCgxrzgxuSQzPw-oBQA';

// Transfer from the signer to null.vaulta using the `greymassfuel` account
const mockRequestUsingCosigner =
	'esr://gmNgZGBY1mTC_MoglIGBIVzX5uxZxgkbT908WOr7GCjAsOKtkZEzsgADUCUjAwSwuPoHg2iloNTi_NKi5FSFgqL8ssyU1CKFktTiEoWSosS84sTkksz8PKAWAA';

const mockSigner = {
	actor: 'wharfkit1111',
	permission: 'active'
};

const mockRequestPayload = {
	signer: mockSigner,
	request: mockRequest
};

// const mockPackedPayload = {
// 	signer: mockSigner,
// 	request: mockRequest
// };

// const mockTransactionPayload = {
// 	signer: mockSigner,
// 	request: mockRequest
// };

let app: Elysia;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeRequest(path: string, data: any) {
	return new Request(`http://localhost${path}`, {
		method: 'POST',
		body: JSON.stringify(data),
		headers: { 'Content-Type': 'application/json' }
	});
}

describe('v1/resource_provider/request_transaction', () => {
	beforeAll(() => {
		app = server();
	});
	describe('signer validation', () => {
		it('requires signer', async () => {
			const request = makeRequest('/v1/resource_provider/request_transaction', {
				request: mockRequest
			});
			const response = await app.handle(request);
			expect(response.ok).toBeFalse();
		});
		it('requires actor value', async () => {
			const request = makeRequest('/v1/resource_provider/request_transaction', {
				signer: {
					actor: '',
					permission: 'active'
				},
				request: mockRequest
			});
			const response = await app.handle(request);
			expect(response.ok).toBeFalse();
		});
		it('requires permission value', async () => {
			const request = makeRequest('/v1/resource_provider/request_transaction', {
				signer: {
					actor: 'test.gm',
					permission: ''
				},
				request: mockRequest
			});
			const response = await app.handle(request);
			expect(response.ok).toBeFalse();
		});
		it('requires valid actor', async () => {
			const request = makeRequest('/v1/resource_provider/request_transaction', {
				signer: {
					actor: '9',
					permission: 'active'
				},
				request: mockRequest
			});
			const response = await app.handle(request);
			expect(response.ok).toBeFalse();
		});
		it('requires valid permission', async () => {
			const request = makeRequest('/v1/resource_provider/request_transaction', {
				signer: {
					actor: 'test',
					permission: '9'
				},
				request: mockRequest
			});
			const response = await app.handle(request);
			expect(response.ok).toBeFalse();
		});
		it('will not process identity request', async () => {
			const request = makeRequest('/v1/resource_provider/request_transaction', {
				signer: mockSigner,
				request: {
					signer: {
						actor: 'test',
						permission: 'active'
					},
					request:
						'esr://gz3MPU7DMBwF8KQFcQA4wH9sJRIndj4IXYIYAJWIoUiwFcc4xIprR0loBUdgQWLgKmwwsjAyUWbEwAxSJ1IJobc9vfczzK5hGPHk5v3V6AzypinrbYRYalPFcl3ZUqgCsZCEbkRCi4QMW95Whi1KaWoFbobPcRQE2KOdleX00fzXuhdXZ-r-y_t-cZ4XbxtciflD9CmN-eLpI_65XZ_emfEsp1VWiAaVlW4009LidQWuTWwMib4WUlLk2w70EsqEanSdD-BANVxCW8DRCE7BdcauPw77sFOWkp_wdNhyPgltEkBvuH-cHG6CFAWHPc4K3YfdvNITjlzSusvAiGa0En-X1Zrpkq9dKsH0lP8C'
				}
			});
			const response = await app.handle(request);
			expect(response.ok).toBeFalse();
		});
		it('will not process when signer equals cosigner', async () => {
			const request = makeRequest('/v1/resource_provider/request_transaction', {
				signer: {
					actor: Bun.env.PROVIDER_ACCOUNT_NAME,
					permission: Bun.env.PROVIDER_ACCOUNT_PERMISSION
				},
				request: mockRequest
			});
			const response = await app.handle(request);
			expect(response.ok).toBeFalse();
		});
		it('will not process when actions contain cosigner authorities', async () => {
			const request = makeRequest('/v1/resource_provider/request_transaction', {
				signer: mockSigner,
				request: mockRequestUsingCosigner
			});
			const response = await app.handle(request);
			expect(response.ok).toBeFalse();
		});
	});

	describe('request validation', () => {
		it('accepts request', async () => {
			const request = makeRequest('/v1/resource_provider/request_transaction', mockRequestPayload);
			const response = await app.handle(request);
			expect(response.ok).toBeTrue();
		});
		it('requires request/transaction/packed', async () => {
			const request = makeRequest('/v1/resource_provider/request_transaction', {
				signer: mockSigner
			});
			const response = await app.handle(request);
			expect(response.ok).toBeFalse();
		});
	});
	describe('appends cosigner noop', () => {
		it('appends noop action to request', async () => {
			const request = makeRequest('/v1/resource_provider/request_transaction', mockRequestPayload);
			const response = await app.handle(request);
			expect(response.ok).toBeTrue();
		});
	});
});
