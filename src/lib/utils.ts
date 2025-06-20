import type { ABISerializable } from '@wharfkit/antelope';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function objectify(data: ABISerializable | Record<string, any>) {
	return JSON.parse(JSON.stringify(data));
}

export const isENVTrue = (value: string | undefined) => value === 'true';
export const isENVFalse = (value: string | undefined) => value === 'false';
