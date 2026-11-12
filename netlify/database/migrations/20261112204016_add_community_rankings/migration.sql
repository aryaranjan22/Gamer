CREATE TABLE "confirmed_donations" (
	"id" uuid PRIMARY KEY,
	"name" text NOT NULL,
	"country" text DEFAULT '' NOT NULL,
	"provider" text NOT NULL,
	"reference" text NOT NULL UNIQUE,
	"amount_paise" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "player_profiles" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"country" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "game_runs" (
	"id" uuid PRIMARY KEY,
	"user_id" text NOT NULL,
	"mode" text NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "game_scores" (
	"user_id" text,
	"mode" text,
	"distance" integer NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "game_scores_pkey" PRIMARY KEY("user_id","mode")
);
--> statement-breakpoint
CREATE TABLE "support_settings" (
	"id" integer PRIMARY KEY,
	"coffee_url" text DEFAULT '' NOT NULL,
	"razorpay_url" text DEFAULT '' NOT NULL,
	"message" text DEFAULT 'Help keep paperweight moving.' NOT NULL,
	"goal_paise" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "game_scores" ADD CONSTRAINT "game_scores_user_id_player_profiles_id_fkey" FOREIGN KEY ("user_id") REFERENCES "player_profiles"("id");