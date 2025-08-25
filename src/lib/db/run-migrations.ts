import { runMigrations } from '$lib/db/migrate';
import { database } from '$lib/db';

async function main() {
	try {
		await runMigrations();
	} finally {
		if (database) {
			await database.$client.end();
		}
	}
}

main();