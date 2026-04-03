ALTER TABLE "user_sessions" ADD COLUMN "revoked_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user_sessions" ADD COLUMN "replaced_by_session_id" text;--> statement-breakpoint
CREATE INDEX "user_sessions_revoked_at_idx" ON "user_sessions" USING btree ("revoked_at");--> statement-breakpoint
CREATE INDEX "user_sessions_replaced_by_session_id_idx" ON "user_sessions" USING btree ("replaced_by_session_id");
