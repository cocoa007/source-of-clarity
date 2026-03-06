import fs from "fs";
import path from "path";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { audits, auditFindings } from "../lib/schema";
import { parseAuditHtml } from "../lib/audit-parser";

const AUDIT_DIR = "/home/agent/cocoa007/workspace/clarity-audit";
const EXPLOITS_DIR = path.join(AUDIT_DIR, "exploits");

async function main() {
  const pool = new pg.Pool({
    connectionString:
      process.env.DATABASE_URL || "postgres://agent@/source_of_clarity?host=/var/run/postgresql",
  });
  const db = drizzle(pool);

  const files = fs
    .readdirSync(AUDIT_DIR)
    .filter((f) => f.endsWith(".html"))
    .sort();

  console.log(`Found ${files.length} audit reports`);

  // Check which exploit files exist
  const exploitFiles = new Set<string>();
  if (fs.existsSync(EXPLOITS_DIR)) {
    for (const f of fs.readdirSync(EXPLOITS_DIR)) {
      // e.g. "aegis-quest-escrow-exploits.clar" -> "aegis-quest-escrow"
      const match = f.match(/^(.+)-exploits?\./);
      if (match) exploitFiles.add(match[1]);
    }
  }

  let imported = 0;
  let skipped = 0;

  for (const file of files) {
    const slug = file.replace(".html", "");
    const html = fs.readFileSync(path.join(AUDIT_DIR, file), "utf-8");

    try {
      const parsed = parseAuditHtml(html, slug);

      const [inserted] = await db
        .insert(audits)
        .values({
          slug,
          contractsAudited: parsed.contractsAudited,
          deployer: parsed.deployer || null,
          date: parsed.date,
          confidence: parsed.confidence || null,
          priorityScore: parsed.priorityScore?.toString() || null,
          blockHeight: parsed.blockHeight,
          sourceUrl: parsed.sourceUrl || null,
          criticalCount: parsed.criticalCount,
          highCount: parsed.highCount,
          mediumCount: parsed.mediumCount,
          lowCount: parsed.lowCount,
          infoCount: parsed.infoCount,
          htmlContent: parsed.htmlContent,
          hasExploits: exploitFiles.has(slug),
        })
        .onConflictDoNothing()
        .returning();

      if (!inserted) {
        skipped++;
        continue;
      }

      // Insert findings
      if (parsed.findings.length > 0) {
        await db.insert(auditFindings).values(
          parsed.findings.map((f) => ({
            auditId: inserted.id,
            findingId: f.findingId,
            severity: f.severity,
            title: f.title,
            location: f.location || null,
            description: f.description || null,
            impact: f.impact || null,
            recommendation: f.recommendation || null,
            codeSnippet: f.codeSnippet || null,
          }))
        );
      }

      imported++;
      console.log(
        `  [${imported}/${files.length}] ${slug}: ${parsed.findings.length} findings`
      );
    } catch (err) {
      console.error(`  ERROR: ${slug}: ${err}`);
    }
  }

  console.log(`\nDone: ${imported} imported, ${skipped} skipped (already exist)`);
  await pool.end();
}

main().catch(console.error);
