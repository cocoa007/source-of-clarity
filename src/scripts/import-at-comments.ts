/**
 * Import comments and reactions from AT Protocol network into the local DB.
 *
 * Scans known DIDs for com.source-of-clarity.temp.comment and
 * com.source-of-clarity.temp.reaction records.
 *
 * Usage: npx tsx src/scripts/import-at-comments.ts
 */

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { contracts, comments, reactions } from "../lib/schema";
import { eq, sql } from "drizzle-orm";
import { LEXICON_COMMENT, LEXICON_REACTION } from "../lexicon/types";

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgres://agent@/source_of_clarity?host=/var/run/postgresql";

const pool = new Pool({ connectionString: DATABASE_URL });
const db = drizzle(pool);

const KNOWN_DIDS = [
  "did:plc:buan5xkx5tn2aipmptfs63cw", // friedger.eurosky.social
  "did:plc:yozhoiev6cypqvb2gngvpy6z", // raficostar.bsky.social
  "did:plc:nzm7vgxpzrx267efzhzmryup", // cryptosmith-btc.bsky.social
];

interface PDSInfo {
  did: string;
  pds: string;
  handle: string;
}

interface ATRecord {
  uri: string;
  cid: string;
  value: Record<string, unknown>;
}

async function resolveDID(did: string): Promise<PDSInfo | null> {
  try {
    const res = await fetch(`https://plc.directory/${did}`);
    if (!res.ok) return null;
    const doc = await res.json();

    // Find PDS endpoint
    let pds = "";
    const services = doc.service || [];
    for (const svc of services) {
      if (
        svc.id === "#atproto_pds" ||
        svc.type === "AtprotoPersonalDataServer"
      ) {
        pds = svc.serviceEndpoint;
        break;
      }
    }
    if (!pds) return null;

    // Get handle from alsoKnownAs
    let handle = did;
    const aka = doc.alsoKnownAs || [];
    for (const alias of aka) {
      if (typeof alias === "string" && alias.startsWith("at://")) {
        handle = alias.replace("at://", "");
        break;
      }
    }

    return { did, pds, handle };
  } catch (err) {
    console.error(`Failed to resolve ${did}:`, (err as Error).message);
    return null;
  }
}

async function listRecords(
  pds: string,
  did: string,
  collection: string
): Promise<ATRecord[]> {
  const allRecords: ATRecord[] = [];
  let cursor: string | undefined;

  while (true) {
    const params = new URLSearchParams({
      repo: did,
      collection,
      limit: "100",
    });
    if (cursor) params.set("cursor", cursor);

    try {
      const res = await fetch(
        `${pds}/xrpc/com.atproto.repo.listRecords?${params}`
      );
      if (!res.ok) {
        if (res.status === 400) break; // Collection doesn't exist
        console.error(`listRecords error: HTTP ${res.status} for ${did}/${collection}`);
        break;
      }
      const data = await res.json();
      const records = data.records || [];
      allRecords.push(...records);

      if (!data.cursor || records.length === 0) break;
      cursor = data.cursor;
    } catch (err) {
      console.error(`listRecords fetch error:`, (err as Error).message);
      break;
    }
  }

  return allRecords;
}

function extractDid(uri: string): string {
  // at://did:plc:xxx/collection/rkey -> did:plc:xxx
  const parts = uri.replace("at://", "").split("/");
  return parts[0];
}

async function commentExists(postUri: string): Promise<boolean> {
  const rows = await db
    .select({ id: comments.id })
    .from(comments)
    .where(eq(comments.postUri, postUri))
    .limit(1);
  return rows.length > 0;
}

async function reactionExists(postUri: string): Promise<boolean> {
  const rows = await db
    .select({ id: reactions.id })
    .from(reactions)
    .where(eq(reactions.postUri, postUri))
    .limit(1);
  return rows.length > 0;
}

async function contractExists(contractId: string): Promise<boolean> {
  const rows = await db
    .select({ id: contracts.id })
    .from(contracts)
    .where(eq(contracts.contractId, contractId))
    .limit(1);
  return rows.length > 0;
}

async function importComments(info: PDSInfo): Promise<{ imported: number; skipped: number }> {
  const records = await listRecords(info.pds, info.did, LEXICON_COMMENT);
  let imported = 0;
  let skipped = 0;

  for (const rec of records) {
    const val = rec.value as {
      subject?: { principal?: string; contractName?: string; name?: string };
      text?: string;
      lineNumber?: number;
      lineRange?: { start?: number; end?: number };
      replyRef?: {
        root?: { uri?: string; cid?: string };
        parent?: { uri?: string; cid?: string };
      };
      reply?: {
        root?: { uri?: string; cid?: string };
        parent?: { uri?: string; cid?: string };
      };
      createdAt?: string;
    };

    const contractName = val.subject?.contractName || val.subject?.name;
    if (!val.subject?.principal || !contractName || !val.text) {
      skipped++;
      continue;
    }

    const contractId = `${val.subject.principal}.${contractName}`;

    // Check for duplicates
    if (await commentExists(rec.uri)) {
      skipped++;
      continue;
    }

    // Verify contract exists
    if (!(await contractExists(contractId))) {
      console.log(`  Skipping comment for unknown contract: ${contractId}`);
      skipped++;
      continue;
    }

    const replyData = val.replyRef || val.reply;

    await db.insert(comments).values({
      contractId,
      principal: val.subject.principal,
      contractName,
      lineNumber: val.lineNumber ?? null,
      lineRangeStart: val.lineRange?.start ?? null,
      lineRangeEnd: val.lineRange?.end ?? null,
      authorDid: info.did,
      authorHandle: info.handle,
      postUri: rec.uri,
      postCid: rec.cid,
      parentUri: replyData?.parent?.uri ?? null,
      rootUri: replyData?.root?.uri ?? null,
      body: val.text,
      createdAt: val.createdAt ? new Date(val.createdAt) : new Date(),
    });

    imported++;
  }

  return { imported, skipped };
}

async function importReactions(info: PDSInfo): Promise<{ imported: number; skipped: number }> {
  const records = await listRecords(info.pds, info.did, LEXICON_REACTION);
  let imported = 0;
  let skipped = 0;

  for (const rec of records) {
    const val = rec.value as {
      subject?: { uri?: string; cid?: string };
      emoji?: string;
      createdAt?: string;
    };

    if (!val.subject?.uri || !val.emoji) {
      skipped++;
      continue;
    }

    if (await reactionExists(rec.uri)) {
      skipped++;
      continue;
    }

    await db.insert(reactions).values({
      commentUri: val.subject.uri,
      authorDid: info.did,
      emoji: val.emoji,
      postUri: rec.uri,
      createdAt: val.createdAt ? new Date(val.createdAt) : new Date(),
    });

    imported++;
  }

  return { imported, skipped };
}

async function main() {
  console.log("AT Protocol Comment/Reaction Importer");
  console.log(`Scanning ${KNOWN_DIDS.length} DIDs...\n`);

  let totalComments = 0;
  let totalReactions = 0;
  let totalSkipped = 0;

  for (const did of KNOWN_DIDS) {
    console.log(`Resolving ${did}...`);
    const info = await resolveDID(did);
    if (!info) {
      console.log(`  Could not resolve DID, skipping`);
      continue;
    }
    console.log(`  Handle: ${info.handle}`);
    console.log(`  PDS: ${info.pds}`);

    // Import comments
    const commentResult = await importComments(info);
    console.log(`  Comments: ${commentResult.imported} imported, ${commentResult.skipped} skipped`);
    totalComments += commentResult.imported;
    totalSkipped += commentResult.skipped;

    // Import reactions
    const reactionResult = await importReactions(info);
    console.log(`  Reactions: ${reactionResult.imported} imported, ${reactionResult.skipped} skipped`);
    totalReactions += reactionResult.imported;
    totalSkipped += reactionResult.skipped;

    console.log();
  }

  console.log("Done!");
  console.log(`Total imported: ${totalComments} comments, ${totalReactions} reactions`);
  console.log(`Total skipped: ${totalSkipped}`);

  await pool.end();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
