import { Config, defineConfig } from 'drizzle-kit';

import { DATABASE_ADAPTER, DATABASE_FILE, DATABASE_URL } from 'src/config';

if (!DATABASE_ADAPTER) {
	throw new Error('DATABASE_ADAPTER environment variable is not set');
}

const dbCredentials = DATABASE_ADAPTER === 'sqlite' ? { url: DATABASE_FILE } : { url: DATABASE_URL };

// Map 'postgres' to 'postgresql' for drizzle-kit
const dialect = DATABASE_ADAPTER === 'postgres' ? 'postgresql' : (DATABASE_ADAPTER as Config['dialect']);

const config = {
	schema: './src/lib/db/schema.ts',
	out: './drizzle',
	dialect: dialect as Config['dialect'],
	dbCredentials
};

export default defineConfig(config);