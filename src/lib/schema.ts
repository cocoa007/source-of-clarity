import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  date,
  numeric,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

export const contracts = pgTable(
  "contracts",
  {
    id: serial("id").primaryKey(),
    principal: text("principal").notNull(),
    name: text("name").notNull(),
    contractId: text("contract_id").notNull().unique(),
    source: text("source"),
    sourceHash: text("source_hash"),
    txId: text("tx_id"),
    blockHeight: integer("block_height"),
    deployedAt: timestamp("deployed_at", { withTimezone: true }),
    sip009: boolean("sip_009").default(false),
    sip010: boolean("sip_010").default(false),
    functionCount: integer("function_count").default(0),
    protocol: text("protocol"),
    network: text("network").default("mainnet").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_contracts_principal").on(table.principal),
    index("idx_contracts_block_height").on(table.blockHeight),
    index("idx_contracts_sip009").on(table.sip009),
    index("idx_contracts_sip010").on(table.sip010),
    index("idx_contracts_network").on(table.network),
  ]
);

export const contractFunctions = pgTable("contract_functions", {
  id: serial("id").primaryKey(),
  contractId: text("contract_id")
    .notNull()
    .references(() => contracts.contractId),
  name: text("name").notNull(),
  access: text("access").notNull(),
  args: jsonb("args").default([]),
  returnType: text("return_type"),
});

export const audits = pgTable(
  "audits",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    contractId: text("contract_id"),
    contractsAudited: text("contracts_audited").array(),
    deployer: text("deployer"),
    date: date("date").notNull(),
    confidence: text("confidence"),
    priorityScore: numeric("priority_score", { precision: 3, scale: 1 }),
    blockHeight: integer("block_height"),
    sourceUrl: text("source_url"),
    criticalCount: integer("critical_count").default(0),
    highCount: integer("high_count").default(0),
    mediumCount: integer("medium_count").default(0),
    lowCount: integer("low_count").default(0),
    infoCount: integer("info_count").default(0),
    htmlContent: text("html_content"),
    hasExploits: boolean("has_exploits").default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_audits_slug").on(table.slug),
    index("idx_audits_deployer").on(table.deployer),
  ]
);

export const auditFindings = pgTable("audit_findings", {
  id: serial("id").primaryKey(),
  auditId: integer("audit_id")
    .notNull()
    .references(() => audits.id),
  findingId: text("finding_id").notNull(),
  severity: text("severity").notNull(),
  title: text("title").notNull(),
  location: text("location"),
  description: text("description"),
  impact: text("impact"),
  recommendation: text("recommendation"),
  codeSnippet: text("code_snippet"),
});

export const comments = pgTable(
  "comments",
  {
    id: serial("id").primaryKey(),
    contractId: text("contract_id").notNull(),
    principal: text("principal").notNull(),
    contractName: text("contract_name").notNull(),
    lineNumber: integer("line_number"),
    lineRangeStart: integer("line_range_start"),
    lineRangeEnd: integer("line_range_end"),
    authorDid: text("author_did").notNull(),
    authorHandle: text("author_handle"),
    postUri: text("post_uri").notNull().unique(),
    postCid: text("post_cid").notNull(),
    parentUri: text("parent_uri"),
    rootUri: text("root_uri"),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_comments_contract_id").on(table.contractId),
    index("idx_comments_contract_line").on(table.contractId, table.lineNumber),
    index("idx_comments_parent_uri").on(table.parentUri),
  ]
);

export const reactions = pgTable(
  "reactions",
  {
    id: serial("id").primaryKey(),
    commentUri: text("comment_uri").notNull(),
    authorDid: text("author_did").notNull(),
    emoji: text("emoji").notNull(),
    postUri: text("post_uri").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_reactions_comment_uri").on(table.commentUri),
    index("idx_reactions_comment_author").on(table.commentUri, table.authorDid),
  ]
);

export const auditJobs = pgTable("audit_jobs", {
  id: serial("id").primaryKey(),
  jobId: text("job_id").notNull().unique(),
  contractId: text("contract_id"),
  type: text("type").notNull(),
  status: text("status").default("queued"),
  result: jsonb("result"),
  resultsUrl: text("results_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
