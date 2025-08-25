CREATE TABLE "contracts" (
	"contract" text PRIMARY KEY NOT NULL,
	"abi" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "manager" (
	"account" text PRIMARY KEY NOT NULL,
	"permission" text NOT NULL,
	"key" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"account" text PRIMARY KEY NOT NULL,
	"min_ms" integer NOT NULL,
	"min_kb" integer NOT NULL,
	"inc_ms" integer NOT NULL,
	"inc_kb" integer NOT NULL,
	"max_fee" text NOT NULL
);
