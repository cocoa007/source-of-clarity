import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { contracts } from "../lib/schema";
import { isNull, and, isNotNull, eq, sql } from "drizzle-orm";
import { createHash } from "crypto";

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgres://agent@/source_of_clarity?host=/var/run/postgresql";
const API_BASE = "http://172.235.160.149:3999";
const CONCURRENCY = 20;
const LOG_INTERVAL = 1000;

const pool = new Pool({ connectionString: DATABASE_URL });
const db = drizzle(pool);

function sha512_256(source: string): string {
  return createHash("sha512-256").update(source).digest("hex");
}

async function fetchContractMetadata(
  contractId: string
): Promise<{ tx_id: string; block_height: number } | null> {
  try {
    const res = await fetch(
      `${API_BASE}/extended/v1/contract/${contractId}`
    );
    if (!res.ok) {
      if (res.status === 404) return null;
      console.error(`HTTP ${res.status} for ${contractId}`);
      return null;
    }
    const data = await res.json();
    return {
      tx_id: data.tx_id,
      block_height: data.block_height,
    };
  } catch (err) {
    console.error(`Fetch error for ${contractId}:`, (err as Error).message);
    return null;
  }
}

async function processChunk(
  rows: { id: number; contractId: string; source: string | null; txId: string | null }[]
) {
  await Promise.all(
    rows.map(async (row) => {
      const setClauses: Partial<{
        txId: string;
        blockHeight: number;
        sourceHash: string;
      }> = {};

      // Fetch metadata if missing
      if (!row.txId) {
        const meta = await fetchContractMetadata(row.contractId);
        if (meta) {
          setClauses.txId = meta.tx_id;
          setClauses.blockHeight = meta.block_height;
        }
      }

      // Compute source hash if source exists
      if (row.source) {
        setClauses.sourceHash = sha512_256(row.source);
      }

      if (Object.keys(setClauses).length > 0) {
        await db
          .update(contracts)
          .set(setClauses)
          .where(eq(contracts.id, row.id));
      }
    })
  );
}

async function main() {
  console.log("Backfill: fetching contracts needing metadata or source_hash...");

  // Get all contracts where tx_id IS NULL OR (source IS NOT NULL AND source_hash IS NULL)
  const rows = await db
    .select({
      id: contracts.id,
      contractId: contracts.contractId,
      source: contracts.source,
      txId: contracts.txId,
    })
    .from(contracts)
    .where(
      sql`${contracts.txId} IS NULL OR (${contracts.source} IS NOT NULL AND ${contracts.sourceHash} IS NULL)`
    );

  console.log(`Found ${rows.length} contracts to process`);

  let processed = 0;
  let updated = 0;
  let notFound = 0;

  for (let i = 0; i < rows.length; i += CONCURRENCY) {
    const chunk = rows.slice(i, i + CONCURRENCY);
    await processChunk(chunk);
    processed += chunk.length;

    if (processed % LOG_INTERVAL < CONCURRENCY || processed === rows.length) {
      console.log(
        `Progress: ${processed}/${rows.length} (${((processed / rows.length) * 100).toFixed(1)}%)`
      );
    }
  }

  console.log("Backfill complete!");
  await pool.end();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
