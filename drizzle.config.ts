import { Config, defineConfig } from 'drizzle-kit';

if (!process.env.DATABASE_ADAPTER) {
	throw new Error('DATABASE_ADAPTER environment variable is not set');
}

const config = {
	schema: './src/lib/db/schema',
	out: './drizzle',
	dialect: process.env.DATABASE_ADAPTER as Config['dialect'],
	dbCredentials: {
		url: process.env.DATABASE_FILE
	}
};

export default defineConfig(config);
