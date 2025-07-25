CREATE TABLE `accounts` (
	`account` text PRIMARY KEY NOT NULL,
	`min_ms` integer NOT NULL,
	`min_kb` integer NOT NULL,
	`inc_ms` integer NOT NULL,
	`inc_kb` integer NOT NULL,
	`max_fee` text NOT NULL
);
