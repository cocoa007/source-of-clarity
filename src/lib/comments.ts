import { db } from "./db";
import { comments, reactions } from "./schema";
import { eq, and, sql, desc } from "drizzle-orm";

export async function getCommentsByContract(contractId: string) {
  const rows = await db
    .select()
    .from(comments)
    .where(eq(comments.contractId, contractId))
    .orderBy(desc(comments.createdAt));

  if (rows.length === 0) return [];

  const uris = rows.map((r) => r.postUri);
  const reactionRows = await db
    .select({
      commentUri: reactions.commentUri,
      emoji: reactions.emoji,
      count: sql<number>`count(*)::int`,
    })
    .from(reactions)
    .where(sql`${reactions.commentUri} = ANY(${uris})`)
    .groupBy(reactions.commentUri, reactions.emoji);

  const reactionMap = new Map<string, Record<string, number>>();
  for (const r of reactionRows) {
    if (!reactionMap.has(r.commentUri)) reactionMap.set(r.commentUri, {});
    reactionMap.get(r.commentUri)![r.emoji] = r.count;
  }

  const replyCounts = new Map<string, number>();
  for (const row of rows) {
    if (row.parentUri) {
      replyCounts.set(row.parentUri, (replyCounts.get(row.parentUri) || 0) + 1);
    }
  }

  return rows.map((row) => ({
    ...row,
    reactions: reactionMap.get(row.postUri) || {},
    replyCount: replyCounts.get(row.postUri) || 0,
  }));
}

export async function getCommentCountsByLine(
  contractId: string
): Promise<Record<number, number>> {
  const rows = await db
    .select({
      lineNumber: comments.lineNumber,
      count: sql<number>`count(*)::int`,
    })
    .from(comments)
    .where(
      and(
        eq(comments.contractId, contractId),
        sql`${comments.lineNumber} IS NOT NULL`
      )
    )
    .groupBy(comments.lineNumber);

  const result: Record<number, number> = {};
  for (const row of rows) {
    if (row.lineNumber !== null) result[row.lineNumber] = row.count;
  }
  return result;
}

export async function getCommentByUri(uri: string) {
  const rows = await db
    .select()
    .from(comments)
    .where(eq(comments.postUri, uri))
    .limit(1);
  return rows[0] || null;
}

export async function insertComment(data: {
  contractId: string;
  principal: string;
  contractName: string;
  lineNumber?: number;
  lineRangeStart?: number;
  lineRangeEnd?: number;
  authorDid: string;
  authorHandle?: string;
  postUri: string;
  postCid: string;
  parentUri?: string;
  rootUri?: string;
  body: string;
}) {
  const rows = await db.insert(comments).values(data).returning();
  return rows[0];
}

export async function upsertReaction(data: {
  commentUri: string;
  authorDid: string;
  emoji: string;
  postUri: string;
}) {
  const existing = await db
    .select()
    .from(reactions)
    .where(
      and(
        eq(reactions.commentUri, data.commentUri),
        eq(reactions.authorDid, data.authorDid)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    if (existing[0].emoji === data.emoji) {
      await db.delete(reactions).where(eq(reactions.id, existing[0].id));
      return { action: "removed" as const, oldUri: existing[0].postUri };
    }
    await db
      .update(reactions)
      .set({ emoji: data.emoji, postUri: data.postUri })
      .where(eq(reactions.id, existing[0].id));
    return { action: "updated" as const, oldUri: existing[0].postUri };
  }

  await db.insert(reactions).values(data);
  return { action: "created" as const, oldUri: null };
}

export async function deleteReactionByUri(postUri: string, authorDid: string) {
  await db
    .delete(reactions)
    .where(and(eq(reactions.postUri, postUri), eq(reactions.authorDid, authorDid)));
}

export async function getUserReactions(commentUris: string[], authorDid: string) {
  if (commentUris.length === 0) return {};
  const rows = await db
    .select({
      commentUri: reactions.commentUri,
      emoji: reactions.emoji,
      postUri: reactions.postUri,
    })
    .from(reactions)
    .where(
      and(
        sql`${reactions.commentUri} = ANY(${commentUris})`,
        eq(reactions.authorDid, authorDid)
      )
    );
  const result: Record<string, { emoji: string; postUri: string }> = {};
  for (const r of rows) {
    result[r.commentUri] = { emoji: r.emoji, postUri: r.postUri };
  }
  return result;
}
