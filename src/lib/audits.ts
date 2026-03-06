import { db } from "./db";
import { audits, auditFindings } from "./schema";
import { eq, ilike, or, desc, sql, and } from "drizzle-orm";

export async function getAuditBySlug(slug: string) {
  const rows = await db
    .select()
    .from(audits)
    .where(eq(audits.slug, slug))
    .limit(1);
  return rows[0] || null;
}

export async function getAuditFindings(auditId: number) {
  return db
    .select()
    .from(auditFindings)
    .where(eq(auditFindings.auditId, auditId));
}

export async function searchAudits(opts: {
  query?: string;
  severity?: string;
  page?: number;
  limit?: number;
}) {
  const { query, severity, page = 1, limit = 24 } = opts;
  const conditions = [];

  if (query) {
    conditions.push(
      or(
        ilike(audits.slug, `%${query}%`),
        ilike(audits.deployer, `%${query}%`)
      )
    );
  }
  if (severity === "critical") conditions.push(sql`${audits.criticalCount} > 0`);
  if (severity === "high") conditions.push(sql`${audits.highCount} > 0`);
  if (severity === "medium") conditions.push(sql`${audits.mediumCount} > 0`);

  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const offset = (page - 1) * limit;

  const [rows, countResult] = await Promise.all([
    db
      .select()
      .from(audits)
      .where(where)
      .orderBy(desc(audits.date))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(audits)
      .where(where),
  ]);

  return {
    audits: rows,
    total: countResult[0]?.count || 0,
    page,
    totalPages: Math.ceil((countResult[0]?.count || 0) / limit),
  };
}

export async function getAuditStats() {
  const result = await db
    .select({
      total: sql<number>`count(*)::int`,
      totalFindings: sql<number>`(sum(critical_count) + sum(high_count) + sum(medium_count) + sum(low_count) + sum(info_count))::int`,
      criticalTotal: sql<number>`sum(critical_count)::int`,
    })
    .from(audits);
  return result[0];
}

export async function getRecentAudits(limit = 10) {
  return db.select().from(audits).orderBy(desc(audits.date)).limit(limit);
}

export async function getAuditsForContract(contractId: string) {
  return db
    .select()
    .from(audits)
    .where(eq(audits.contractId, contractId))
    .orderBy(desc(audits.date));
}
