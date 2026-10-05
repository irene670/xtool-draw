CREATE TABLE `login_attempts` (
	`bucket` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `rounds` (
	`id` text PRIMARY KEY NOT NULL,
	`sequence` integer NOT NULL,
	`created_at` integer NOT NULL,
	`drawn_at` integer,
	`completed_at` integer,
	`day` text NOT NULL,
	`status` text NOT NULL,
	`snapshot` text NOT NULL,
	`outcome` text,
	`draw_nonce` text,
	`note` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_rounds_day` ON `rounds` (`day`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_rounds_sequence` ON `rounds` (`sequence`);--> statement-breakpoint
CREATE TABLE `stage_secrets` (
	`id` text PRIMARY KEY NOT NULL,
	`salt` text NOT NULL,
	`hash` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `stage_sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`role` text NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `stage_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`config` text NOT NULL,
	`stock` text NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`active_round` text,
	`operation` text
);
