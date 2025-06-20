import js from '@eslint/js';
import prettier from 'eslint-config-prettier/flat';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import eslintPlugin from 'eslint-plugin-eslint-plugin';
import { flatConfigs } from 'eslint-plugin-import-x';
import json from 'eslint-plugin-json';
import * as mdx from 'eslint-plugin-mdx';
import eslintPrettier from 'eslint-plugin-prettier/recommended';
import { config, configs } from 'typescript-eslint';

export default config([
	{
		ignores: ['dist/', 'src/lib/contracts/']
	},
	js.configs.recommended,
	configs.recommended,
	flatConfigs.recommended,
	flatConfigs.typescript,
	json.configs.recommended,
	mdx.configs.flat,
	mdx.configs.flatCodeBlocks,
	prettier,
	eslintPrettier,
	{
		plugins: {
			'eslint-plugin': eslintPlugin
		},
		settings: {
			'import-x/resolver-next': [
				createTypeScriptImportResolver({
					alwaysTryTypes: true,
					bun: true,
					project: 'tsconfig.json'
				})
			]
		},
		languageOptions: {
			parserOptions: {
				sourceType: 'module',
				ecmaVersion: 2020
			}
		}
	},
	{
		files: ['**/*.ts', '**/*.js'],
		rules: {
			'import-x/order': [
				'error',
				{
					alphabetize: {
						order: 'asc'
					},
					'newlines-between': 'always'
				}
			]
		}
	}
]);
