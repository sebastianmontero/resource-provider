import { Config, defineConfig } from 'drizzle-kit';

import { DATABASE_ADAPTER, DATABASE_FILE } from 'src/config';

if (!DATABASE_ADAPTER) {
	throw new Error('DATABASE_ADAPTER environment variable is not set');
}

const config = {
	schema: './src/lib/db/schema',
	out: './drizzle',
	dialect: DATABASE_ADAPTER as Config['dialect'],
	dbCredentials: {
		url: DATABASE_FILE
	}
};

export default defineConfig(config);
