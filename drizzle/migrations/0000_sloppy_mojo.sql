CREATE TABLE "audit_findings" (
	"id" serial PRIMARY KEY NOT NULL,
	"audit_id" integer NOT NULL,
	"finding_id" text NOT NULL,
	"severity" text NOT NULL,
	"title" text NOT NULL,
	"location" text,
	"description" text,
	"impact" text,
	"recommendation" text,
	"code_snippet" text
);
--> statement-breakpoint
CREATE TABLE "audit_jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_id" text NOT NULL,
	"contract_id" text,
	"type" text NOT NULL,
	"status" text DEFAULT 'queued',
	"result" jsonb,
	"results_url" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "audit_jobs_job_id_unique" UNIQUE("job_id")
);
--> statement-breakpoint
CREATE TABLE "audits" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"contract_id" text,
	"contracts_audited" text[],
	"deployer" text,
	"date" date NOT NULL,
	"confidence" text,
	"priority_score" numeric(3, 1),
	"block_height" integer,
	"source_url" text,
	"critical_count" integer DEFAULT 0,
	"high_count" integer DEFAULT 0,
	"medium_count" integer DEFAULT 0,
	"low_count" integer DEFAULT 0,
	"info_count" integer DEFAULT 0,
	"html_content" text,
	"has_exploits" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "audits_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"contract_id" text NOT NULL,
	"principal" text NOT NULL,
	"contract_name" text NOT NULL,
	"line_number" integer,
	"line_range_start" integer,
	"line_range_end" integer,
	"author_did" text NOT NULL,
	"author_handle" text,
	"post_uri" text NOT NULL,
	"post_cid" text NOT NULL,
	"parent_uri" text,
	"root_uri" text,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "comments_post_uri_unique" UNIQUE("post_uri")
);
--> statement-breakpoint
CREATE TABLE "contract_functions" (
	"id" serial PRIMARY KEY NOT NULL,
	"contract_id" text NOT NULL,
	"name" text NOT NULL,
	"access" text NOT NULL,
	"args" jsonb DEFAULT '[]'::jsonb,
	"return_type" text
);
--> statement-breakpoint
CREATE TABLE "contracts" (
	"id" serial PRIMARY KEY NOT NULL,
	"principal" text NOT NULL,
	"name" text NOT NULL,
	"contract_id" text NOT NULL,
	"source" text,
	"source_hash" text,
	"tx_id" text,
	"block_height" integer,
	"deployed_at" timestamp with time zone,
	"sip_009" boolean DEFAULT false,
	"sip_010" boolean DEFAULT false,
	"function_count" integer DEFAULT 0,
	"protocol" text,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "contracts_contract_id_unique" UNIQUE("contract_id")
);
--> statement-breakpoint
CREATE TABLE "reactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"comment_uri" text NOT NULL,
	"author_did" text NOT NULL,
	"emoji" text NOT NULL,
	"post_uri" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "reactions_post_uri_unique" UNIQUE("post_uri")
);
--> statement-breakpoint
ALTER TABLE "audit_findings" ADD CONSTRAINT "audit_findings_audit_id_audits_id_fk" FOREIGN KEY ("audit_id") REFERENCES "public"."audits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_functions" ADD CONSTRAINT "contract_functions_contract_id_contracts_contract_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("contract_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_audits_slug" ON "audits" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_audits_deployer" ON "audits" USING btree ("deployer");--> statement-breakpoint
CREATE INDEX "idx_comments_contract_id" ON "comments" USING btree ("contract_id");--> statement-breakpoint
CREATE INDEX "idx_comments_contract_line" ON "comments" USING btree ("contract_id","line_number");--> statement-breakpoint
CREATE INDEX "idx_comments_parent_uri" ON "comments" USING btree ("parent_uri");--> statement-breakpoint
CREATE INDEX "idx_contracts_principal" ON "contracts" USING btree ("principal");--> statement-breakpoint
CREATE INDEX "idx_contracts_block_height" ON "contracts" USING btree ("block_height");--> statement-breakpoint
CREATE INDEX "idx_contracts_sip009" ON "contracts" USING btree ("sip_009");--> statement-breakpoint
CREATE INDEX "idx_contracts_sip010" ON "contracts" USING btree ("sip_010");--> statement-breakpoint
CREATE INDEX "idx_reactions_comment_uri" ON "reactions" USING btree ("comment_uri");--> statement-breakpoint
CREATE INDEX "idx_reactions_comment_author" ON "reactions" USING btree ("comment_uri","author_did");