CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text UNIQUE NOT NULL,
	"password_hash" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"bio" text,
	"avatar_url" text,
	"language" text DEFAULT 'de' NOT NULL,
	"theme" text DEFAULT 'dark' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE "user_images" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"filename" text NOT NULL,
	"mime_type" text NOT NULL,
	"file_size_bytes" integer NOT NULL,
	"storage_key" text NOT NULL,
	"image_url" text,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE "user_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"token" text UNIQUE NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "user_images" ADD CONSTRAINT "user_images_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_is_active_idx" ON "users" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "user_images_user_id_idx" ON "user_images" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_sessions_user_id_idx" ON "user_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_sessions_token_idx" ON "user_sessions" USING btree ("token");
