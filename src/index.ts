import { prompt } from './cli';
import { ENVIRONMENT } from './config';
import { server } from './provider';

// import { runMigrations } from '$lib/db/migrate';
import { generalLog } from '$lib/logger';

// runMigrations();

if (ENVIRONMENT === 'testing') {
	// Automatically start the server in testing environment
	generalLog.debug('Starting server in testing environment...');
	server();
} else {
	// Otherwise use prompt for CLI commands
	(async () => {
		await prompt();
	})();
}