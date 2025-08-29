ALTER TABLE "accounts" RENAME COLUMN "min_kb" TO "min_net_kb";--> statement-breakpoint
ALTER TABLE "accounts" RENAME COLUMN "inc_kb" TO "inc_net_kb";--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "min_ram_kb" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "inc_ram_kb" integer NOT NULL;