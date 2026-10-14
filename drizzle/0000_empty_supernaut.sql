CREATE TABLE "content_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"collection" text NOT NULL,
	"slug" text NOT NULL,
	"locale" text NOT NULL,
	"data" jsonb NOT NULL,
	"body" text,
	"sort_order" integer,
	"version" integer DEFAULT 1 NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text NOT NULL,
	CONSTRAINT "content_entries_collection_slug_locale_unique" UNIQUE("collection","slug","locale"),
	CONSTRAINT "content_entries_locale_check" CHECK ("content_entries"."locale" IN ('vi', 'en')),
	CONSTRAINT "content_entries_version_check" CHECK ("content_entries"."version" >= 1)
);
--> statement-breakpoint
CREATE TABLE "content_versions" (
	"id" serial PRIMARY KEY NOT NULL,
	"entry_id" integer NOT NULL,
	"version" integer NOT NULL,
	"op" text NOT NULL,
	"data" jsonb NOT NULL,
	"body" text,
	"actor" text NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "content_versions_entry_id_version_unique" UNIQUE("entry_id","version"),
	CONSTRAINT "content_versions_op_check" CHECK ("content_versions"."op" IN ('create', 'update', 'delete', 'rollback'))
);
--> statement-breakpoint
ALTER TABLE "content_versions" ADD CONSTRAINT "content_versions_entry_id_content_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."content_entries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "content_entries_collection_locale_live_idx" ON "content_entries" USING btree ("collection","locale") WHERE "content_entries"."deleted_at" IS NULL;