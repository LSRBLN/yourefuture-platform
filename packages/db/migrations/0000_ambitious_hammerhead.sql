CREATE TYPE "public"."check_status" AS ENUM('pending', 'queued', 'running', 'completed', 'partial_failure', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."check_type" AS ENUM('leak_email', 'leak_username', 'leak_phone', 'leak_domain', 'password_hash', 'image', 'video', 'source_only');--> statement-breakpoint
CREATE TYPE "public"."evidence_coverage" AS ENUM('complete', 'partial', 'missing');--> statement-breakpoint
CREATE TYPE "public"."evidence_snapshot_type" AS ENUM('search_result', 'review_brief', 'provider_packet');--> statement-breakpoint
CREATE TYPE "public"."evidence_source_kind" AS ENUM('url', 'screenshot', 'document', 'audit_log');--> statement-breakpoint
CREATE TYPE "public"."evidence_source_status" AS ENUM('verified', 'pending', 'missing');--> statement-breakpoint
CREATE TYPE "public"."job_status" AS ENUM('queued', 'running', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."recommended_action" AS ENUM('monitor', 'rerun_analysis', 'request_more_context', 'handover_support', 'recommend_removal', 'legal_escalation');--> statement-breakpoint
CREATE TYPE "public"."removal_case_type" AS ENUM('privacy_removal', 'non_consensual_intimate_content', 'impersonation', 'defamation', 'copyright', 'other');--> statement-breakpoint
CREATE TYPE "public"."removal_status" AS ENUM('open', 'preparing', 'submitted', 'under_review', 'followup_required', 'escalated', 'removed', 'partially_removed', 'rejected', 'closed');--> statement-breakpoint
CREATE TYPE "public"."review_decision_outcome" AS ENUM('no_evidence_of_manipulation', 'suspicious_needs_monitoring', 'likely_manipulated', 'confirmed_known_fake', 'insufficient_evidence', 'no_match', 'weak_candidate', 'strong_candidate_reviewed', 'insufficient_quality', 'not_actionable', 'monitor', 'action_recommended', 'removal_recommended');--> statement-breakpoint
CREATE TYPE "public"."review_priority" AS ENUM('low', 'medium', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."review_status" AS ENUM('open', 'triaged', 'assigned', 'in_review', 'waiting_more_context', 'decided', 'escalated', 'closed');--> statement-breakpoint
CREATE TYPE "public"."review_type" AS ENUM('analyst', 'support_escalation', 'removal_review');--> statement-breakpoint
CREATE TYPE "public"."severity" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."sla_risk" AS ENUM('healthy', 'watch', 'risk', 'breach');--> statement-breakpoint
CREATE TYPE "public"."source_type" AS ENUM('profile_url', 'listing_url', 'image_url', 'video_url', 'document_url', 'social_post_url', 'other_url');--> statement-breakpoint
CREATE TYPE "public"."source_validation_status" AS ENUM('pending', 'validated', 'invalid', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."support_request_type" AS ENUM('support', 'removal', 'upload_review', 'identity_review');--> statement-breakpoint
CREATE TYPE "public"."support_status" AS ENUM('open', 'triaged', 'assigned', 'in_progress', 'waiting_user', 'escalated', 'resolved', 'closed');--> statement-breakpoint
CREATE TABLE "checks" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_user_id" text,
	"type" "check_type" NOT NULL,
	"status" "check_status" DEFAULT 'queued' NOT NULL,
	"summary" text,
	"input" jsonb NOT NULL,
	"risk" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"submitted_source_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"primary_asset_id" text,
	"workflow_instance_id" text,
	"support_request_id" text,
	"review_item_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"removal_case_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"retention_until" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "evidence_snapshots" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_user_id" text,
	"check_id" text,
	"source_id" text,
	"review_item_id" text,
	"removal_case_id" text,
	"snapshot_type" "evidence_snapshot_type" NOT NULL,
	"source_kind" "evidence_source_kind" NOT NULL,
	"source_status" "evidence_source_status" DEFAULT 'pending' NOT NULL,
	"source_url" text,
	"storage_key" text,
	"sha256" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"captured_at" timestamp with time zone DEFAULT now() NOT NULL,
	"retention_until" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_user_id" text,
	"queue" text NOT NULL,
	"name" text NOT NULL,
	"status" "job_status" DEFAULT 'queued' NOT NULL,
	"resource_type" text NOT NULL,
	"resource_id" text NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"requested_by" text,
	"attempts" integer DEFAULT 0 NOT NULL,
	"max_attempts" integer DEFAULT 1 NOT NULL,
	"dedupe_key" text,
	"last_error" text,
	"enqueued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"available_at" timestamp with time zone DEFAULT now() NOT NULL,
	"retention_until" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "removal_cases" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_user_id" text,
	"linked_check_id" text,
	"linked_asset_id" text,
	"case_type" "removal_case_type" NOT NULL,
	"platform" text NOT NULL,
	"target_url" text NOT NULL,
	"legal_basis" text,
	"status" "removal_status" DEFAULT 'open' NOT NULL,
	"severity" "severity" NOT NULL,
	"summary" text NOT NULL,
	"evidence_coverage" "evidence_coverage" DEFAULT 'partial' NOT NULL,
	"sla_risk" "sla_risk" DEFAULT 'watch' NOT NULL,
	"review_status" "review_status" DEFAULT 'open' NOT NULL,
	"support_requested" boolean DEFAULT true NOT NULL,
	"next_action_label" text,
	"last_update_at" timestamp with time zone DEFAULT now() NOT NULL,
	"retention_until" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review_items" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_user_id" text,
	"check_id" text,
	"source_id" text,
	"support_request_id" text,
	"removal_case_id" text,
	"review_type" "review_type" NOT NULL,
	"priority" "review_priority" DEFAULT 'medium' NOT NULL,
	"status" "review_status" DEFAULT 'open' NOT NULL,
	"assigned_to" text,
	"evidence_coverage" "evidence_coverage" DEFAULT 'partial' NOT NULL,
	"sla_risk" "sla_risk" DEFAULT 'watch' NOT NULL,
	"recommended_action" "recommended_action",
	"decision_outcome" "review_decision_outcome",
	"decision_summary" text,
	"queue_name" text DEFAULT 'reviews' NOT NULL,
	"due_at" timestamp with time zone,
	"decided_at" timestamp with time zone,
	"retention_until" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sources" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_user_id" text,
	"check_id" text,
	"asset_id" text,
	"source_type" "source_type" NOT NULL,
	"source_url" text NOT NULL,
	"platform_name" text,
	"page_title" text,
	"notes" text,
	"validation_status" "source_validation_status" DEFAULT 'pending' NOT NULL,
	"retention_until" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "support_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_user_id" text,
	"check_id" text,
	"asset_id" text,
	"removal_case_id" text,
	"request_type" "support_request_type" NOT NULL,
	"priority" "review_priority" DEFAULT 'medium' NOT NULL,
	"status" "support_status" DEFAULT 'open' NOT NULL,
	"preferred_contact" text,
	"message" text NOT NULL,
	"assigned_to" text,
	"assignment_history" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status_history" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"audit" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"retention" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"retention_until" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "evidence_snapshots" ADD CONSTRAINT "evidence_snapshots_check_id_checks_id_fk" FOREIGN KEY ("check_id") REFERENCES "public"."checks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_snapshots" ADD CONSTRAINT "evidence_snapshots_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_snapshots" ADD CONSTRAINT "evidence_snapshots_review_item_id_review_items_id_fk" FOREIGN KEY ("review_item_id") REFERENCES "public"."review_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_snapshots" ADD CONSTRAINT "evidence_snapshots_removal_case_id_removal_cases_id_fk" FOREIGN KEY ("removal_case_id") REFERENCES "public"."removal_cases"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "removal_cases" ADD CONSTRAINT "removal_cases_linked_check_id_checks_id_fk" FOREIGN KEY ("linked_check_id") REFERENCES "public"."checks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_items" ADD CONSTRAINT "review_items_check_id_checks_id_fk" FOREIGN KEY ("check_id") REFERENCES "public"."checks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_items" ADD CONSTRAINT "review_items_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_items" ADD CONSTRAINT "review_items_support_request_id_support_requests_id_fk" FOREIGN KEY ("support_request_id") REFERENCES "public"."support_requests"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_items" ADD CONSTRAINT "review_items_removal_case_id_removal_cases_id_fk" FOREIGN KEY ("removal_case_id") REFERENCES "public"."removal_cases"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sources" ADD CONSTRAINT "sources_check_id_checks_id_fk" FOREIGN KEY ("check_id") REFERENCES "public"."checks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_requests" ADD CONSTRAINT "support_requests_check_id_checks_id_fk" FOREIGN KEY ("check_id") REFERENCES "public"."checks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "checks_owner_user_idx" ON "checks" USING btree ("owner_user_id");--> statement-breakpoint
CREATE INDEX "checks_type_idx" ON "checks" USING btree ("type");--> statement-breakpoint
CREATE INDEX "checks_status_idx" ON "checks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "checks_support_request_idx" ON "checks" USING btree ("support_request_id");--> statement-breakpoint
CREATE INDEX "evidence_snapshots_owner_user_idx" ON "evidence_snapshots" USING btree ("owner_user_id");--> statement-breakpoint
CREATE INDEX "evidence_snapshots_check_idx" ON "evidence_snapshots" USING btree ("check_id");--> statement-breakpoint
CREATE INDEX "evidence_snapshots_review_item_idx" ON "evidence_snapshots" USING btree ("review_item_id");--> statement-breakpoint
CREATE INDEX "evidence_snapshots_removal_case_idx" ON "evidence_snapshots" USING btree ("removal_case_id");--> statement-breakpoint
CREATE INDEX "evidence_snapshots_source_status_idx" ON "evidence_snapshots" USING btree ("source_status");--> statement-breakpoint
CREATE INDEX "jobs_owner_user_idx" ON "jobs" USING btree ("owner_user_id");--> statement-breakpoint
CREATE INDEX "jobs_queue_idx" ON "jobs" USING btree ("queue");--> statement-breakpoint
CREATE INDEX "jobs_status_idx" ON "jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "jobs_resource_idx" ON "jobs" USING btree ("resource_type","resource_id");--> statement-breakpoint
CREATE INDEX "removal_cases_owner_user_idx" ON "removal_cases" USING btree ("owner_user_id");--> statement-breakpoint
CREATE INDEX "removal_cases_linked_check_idx" ON "removal_cases" USING btree ("linked_check_id");--> statement-breakpoint
CREATE INDEX "removal_cases_status_idx" ON "removal_cases" USING btree ("status");--> statement-breakpoint
CREATE INDEX "removal_cases_platform_idx" ON "removal_cases" USING btree ("platform");--> statement-breakpoint
CREATE INDEX "review_items_owner_user_idx" ON "review_items" USING btree ("owner_user_id");--> statement-breakpoint
CREATE INDEX "review_items_check_idx" ON "review_items" USING btree ("check_id");--> statement-breakpoint
CREATE INDEX "review_items_support_request_idx" ON "review_items" USING btree ("support_request_id");--> statement-breakpoint
CREATE INDEX "review_items_removal_case_idx" ON "review_items" USING btree ("removal_case_id");--> statement-breakpoint
CREATE INDEX "review_items_status_idx" ON "review_items" USING btree ("status");--> statement-breakpoint
CREATE INDEX "review_items_assigned_to_idx" ON "review_items" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "sources_owner_user_idx" ON "sources" USING btree ("owner_user_id");--> statement-breakpoint
CREATE INDEX "sources_check_idx" ON "sources" USING btree ("check_id");--> statement-breakpoint
CREATE INDEX "sources_asset_idx" ON "sources" USING btree ("asset_id");--> statement-breakpoint
CREATE INDEX "sources_source_url_idx" ON "sources" USING btree ("source_url");--> statement-breakpoint
CREATE INDEX "support_requests_owner_user_idx" ON "support_requests" USING btree ("owner_user_id");--> statement-breakpoint
CREATE INDEX "support_requests_check_idx" ON "support_requests" USING btree ("check_id");--> statement-breakpoint
CREATE INDEX "support_requests_removal_case_idx" ON "support_requests" USING btree ("removal_case_id");--> statement-breakpoint
CREATE INDEX "support_requests_status_idx" ON "support_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "support_requests_assigned_to_idx" ON "support_requests" USING btree ("assigned_to");