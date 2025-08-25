import { Config, defineConfig } from 'drizzle-kit';

import { DATABASE_ADAPTER, DATABASE_FILE, DATABASE_URL } from 'src/config';

if (!DATABASE_ADAPTER) {
	throw new Error('DATABASE_ADAPTER environment variable is not set');
}

const dbCredentials = DATABASE_ADAPTER === 'sqlite' ? { url: DATABASE_FILE } : { url: DATABASE_URL };

const config = {
	schema: './src/lib/db/schema.ts',
	out: './drizzle',
	dialect: DATABASE_ADAPTER as Config['dialect'],
	dbCredentials
};

export default defineConfig(config);
