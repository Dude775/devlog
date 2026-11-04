CREATE TYPE "public"."reaction_type" AS ENUM('fire', 'brain', 'rocket');--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_view_visitors" (
	"slug" text NOT NULL,
	"visitor_hash" text NOT NULL,
	"day" date NOT NULL,
	CONSTRAINT "post_view_visitors_slug_visitor_hash_pk" PRIMARY KEY("slug","visitor_hash")
);
--> statement-breakpoint
CREATE TABLE "post_views" (
	"slug" text PRIMARY KEY NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reaction_visitors" (
	"slug" text NOT NULL,
	"type" "reaction_type" NOT NULL,
	"visitor_hash" text NOT NULL,
	"day" date NOT NULL,
	CONSTRAINT "reaction_visitors_slug_type_visitor_hash_pk" PRIMARY KEY("slug","type","visitor_hash")
);
--> statement-breakpoint
CREATE TABLE "reactions" (
	"slug" text NOT NULL,
	"type" "reaction_type" NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "reactions_slug_type_pk" PRIMARY KEY("slug","type")
);
--> statement-breakpoint
CREATE TABLE "subscribers" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"confirmed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subscribers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE INDEX "post_view_visitors_day_idx" ON "post_view_visitors" USING btree ("day");--> statement-breakpoint
CREATE INDEX "reaction_visitors_day_idx" ON "reaction_visitors" USING btree ("day");