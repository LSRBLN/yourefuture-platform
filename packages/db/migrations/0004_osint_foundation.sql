CREATE TYPE "public"."osint_export_format" AS ENUM('json', 'csv', 'pdf');--> statement-breakpoint
CREATE TYPE "public"."osint_export_status" AS ENUM('queued', 'running', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."osint_history_event_type" AS ENUM('search_created', 'job_queued', 'job_running', 'job_completed', 'job_failed', 'export_queued', 'export_completed', 'export_failed', 'saved_item_added', 'saved_item_removed');--> statement-breakpoint
CREATE TYPE "public"."osint_query_type" AS ENUM('username', 'email', 'phone', 'domain', 'ip', 'name', 'image_url');--> statement-breakpoint
CREATE TYPE "public"."osint_search_scope" AS ENUM('quick', 'comprehensive');--> statement-breakpoint
CREATE TYPE "public"."osint_search_status" AS ENUM('queued', 'running', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "osint_searches" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_user_id" text,
	"query" text NOT NULL,
	"query_type" "osint_query_type" NOT NULL,
	"scope" "osint_search_scope" DEFAULT 'quick' NOT NULL,
	"status" "osint_search_status" DEFAULT 'queued' NOT NULL,
	"schema_version" text DEFAULT '1.0' NOT NULL,
	"requested_by" text,
	"providers" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"result_count" integer DEFAULT 0 NOT NULL,
	"dedupe_key" text,
	"latest_job_id" text,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"last_error" text,
	"retention_until" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE "osint_results" (
	"id" text PRIMARY KEY NOT NULL,
	"search_id" text NOT NULL,
	"owner_user_id" text,
	"source_tool" text NOT NULL,
	"source_provider" text,
	"source_url" text,
	"source_title" text,
	"confidence_score" integer DEFAULT 0 NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"discovered_at" timestamp with time zone,
	"collected_at" timestamp with time zone,
	"retention_until" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE "osint_exports" (
	"id" text PRIMARY KEY NOT NULL,
	"search_id" text NOT NULL,
	"owner_user_id" text,
	"format" "osint_export_format" NOT NULL,
	"status" "osint_export_status" DEFAULT 'queued' NOT NULL,
	"requested_by" text,
	"file_name" text,
	"storage_key" text,
	"expires_at" timestamp with time zone,
	"error_message" text,
	"retention_until" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE "osint_history" (
	"id" text PRIMARY KEY NOT NULL,
	"search_id" text NOT NULL,
	"owner_user_id" text,
	"event_type" "osint_history_event_type" NOT NULL,
	"message" text,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE "osint_saved_items" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_user_id" text NOT NULL,
	"search_id" text,
	"result_id" text,
	"title" text,
	"url" text NOT NULL,
	"notes" text,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"retention_until" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "osint_results" ADD CONSTRAINT "osint_results_search_id_osint_searches_id_fk" FOREIGN KEY ("search_id") REFERENCES "public"."osint_searches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "osint_exports" ADD CONSTRAINT "osint_exports_search_id_osint_searches_id_fk" FOREIGN KEY ("search_id") REFERENCES "public"."osint_searches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "osint_history" ADD CONSTRAINT "osint_history_search_id_osint_searches_id_fk" FOREIGN KEY ("search_id") REFERENCES "public"."osint_searches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "osint_saved_items" ADD CONSTRAINT "osint_saved_items_search_id_osint_searches_id_fk" FOREIGN KEY ("search_id") REFERENCES "public"."osint_searches"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "osint_saved_items" ADD CONSTRAINT "osint_saved_items_result_id_osint_results_id_fk" FOREIGN KEY ("result_id") REFERENCES "public"."osint_results"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "osint_searches_owner_user_idx" ON "osint_searches" USING btree ("owner_user_id");--> statement-breakpoint
CREATE INDEX "osint_searches_status_idx" ON "osint_searches" USING btree ("status");--> statement-breakpoint
CREATE INDEX "osint_searches_query_type_idx" ON "osint_searches" USING btree ("query_type");--> statement-breakpoint
CREATE INDEX "osint_searches_dedupe_key_idx" ON "osint_searches" USING btree ("dedupe_key");--> statement-breakpoint
CREATE INDEX "osint_results_search_idx" ON "osint_results" USING btree ("search_id");--> statement-breakpoint
CREATE INDEX "osint_results_owner_user_idx" ON "osint_results" USING btree ("owner_user_id");--> statement-breakpoint
CREATE INDEX "osint_results_source_url_idx" ON "osint_results" USING btree ("source_url");--> statement-breakpoint
CREATE INDEX "osint_exports_search_idx" ON "osint_exports" USING btree ("search_id");--> statement-breakpoint
CREATE INDEX "osint_exports_owner_user_idx" ON "osint_exports" USING btree ("owner_user_id");--> statement-breakpoint
CREATE INDEX "osint_exports_status_idx" ON "osint_exports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "osint_history_search_idx" ON "osint_history" USING btree ("search_id");--> statement-breakpoint
CREATE INDEX "osint_history_owner_user_idx" ON "osint_history" USING btree ("owner_user_id");--> statement-breakpoint
CREATE INDEX "osint_history_event_type_idx" ON "osint_history" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "osint_saved_items_owner_user_idx" ON "osint_saved_items" USING btree ("owner_user_id");--> statement-breakpoint
CREATE INDEX "osint_saved_items_search_idx" ON "osint_saved_items" USING btree ("search_id");--> statement-breakpoint
CREATE INDEX "osint_saved_items_result_idx" ON "osint_saved_items" USING btree ("result_id");--> statement-breakpoint
CREATE INDEX "osint_saved_items_url_idx" ON "osint_saved_items" USING btree ("url");
