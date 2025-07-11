CREATE TABLE `accounts` (
	`account` text PRIMARY KEY NOT NULL,
	`min_cpu` integer NOT NULL,
	`min_net` integer NOT NULL,
	`inc_ms` integer NOT NULL,
	`inc_kb` integer NOT NULL,
	`max_fee` text NOT NULL
);
