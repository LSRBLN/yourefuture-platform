CREATE TYPE "public"."asset_status" AS ENUM('pending_upload', 'uploaded', 'scanning', 'ready', 'flagged', 'failed');--> statement-breakpoint
CREATE TYPE "public"."asset_type" AS ENUM('image', 'video', 'document', 'other');--> statement-breakpoint
CREATE TABLE "assets" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_user_id" text,
	"primary_check_id" text,
	"asset_type" "asset_type" NOT NULL,
	"status" "asset_status" DEFAULT 'pending_upload' NOT NULL,
	"summary" text,
	"original_filename" text,
	"mime_type" text,
	"file_size_bytes" integer,
	"sha256" text,
	"dimensions" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"storage_key" text,
	"quarantine_storage_key" text,
	"flags" jsonb DEFAULT '{"nsfw":false,"sensitive":true,"malwareScanned":false,"malwareDetected":false}'::jsonb NOT NULL,
	"representation_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"source_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"upload_completed_at" timestamp with time zone,
	"scanned_at" timestamp with time zone,
	"retention_until" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "removal_actions" (
	"id" text PRIMARY KEY NOT NULL,
	"removal_case_id" text NOT NULL,
	"action_type" text NOT NULL,
	"recipient" text,
	"payload_summary" text,
	"result_status" text,
	"external_ticket_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_primary_check_id_checks_id_fk" FOREIGN KEY ("primary_check_id") REFERENCES "public"."checks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "removal_actions" ADD CONSTRAINT "removal_actions_removal_case_id_removal_cases_id_fk" FOREIGN KEY ("removal_case_id") REFERENCES "public"."removal_cases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "assets_owner_user_idx" ON "assets" USING btree ("owner_user_id");--> statement-breakpoint
CREATE INDEX "assets_primary_check_idx" ON "assets" USING btree ("primary_check_id");--> statement-breakpoint
CREATE INDEX "assets_status_idx" ON "assets" USING btree ("status");--> statement-breakpoint
CREATE INDEX "assets_asset_type_idx" ON "assets" USING btree ("asset_type");--> statement-breakpoint
CREATE INDEX "assets_sha256_idx" ON "assets" USING btree ("sha256");--> statement-breakpoint
CREATE INDEX "removal_actions_removal_case_idx" ON "removal_actions" USING btree ("removal_case_id");--> statement-breakpoint
CREATE INDEX "removal_actions_result_status_idx" ON "removal_actions" USING btree ("result_status");