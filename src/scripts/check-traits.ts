/**
 * Check SIP trait implementation for all contracts via local Stacks node.
 *
 * Usage:
 *   npx tsx src/scripts/check-traits.ts <trait> <column>
 *
 * Examples:
 *   npx tsx src/scripts/check-traits.ts SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait.nft-trait sip_009
 *   npx tsx src/scripts/check-traits.ts SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard.sip-010-trait sip_010
 */

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { contracts } from "../lib/schema";
import { inArray } from "drizzle-orm";

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgres://agent@/source_of_clarity?host=/var/run/postgresql";
const API_BASE =
  process.env.STACKS_API_BASE || "http://172.235.160.149:3999";
const BATCH_SIZE = 500;
const CONCURRENCY = 50;
const LOG_INTERVAL = 1000;

const ALLOWED_COLUMNS = new Set(["sip_009", "sip_010"]);
const COLUMN_MAP: Record<string, "sip009" | "sip010"> = {
  sip_009: "sip009",
  sip_010: "sip010",
};

const pool = new Pool({ connectionString: DATABASE_URL });
const db = drizzle(pool);

function parseTrait(arg: string): { address: string; contract: string; name: string } {
  const parts = arg.split(".");
  if (parts.length !== 3) {
    throw new Error(`Invalid trait format: ${arg} (expected ADDRESS.CONTRACT.TRAIT)`);
  }
  return { address: parts[0], contract: parts[1], name: parts[2] };
}

async function checkTrait(
  contractAddress: string,
  contractName: string,
  trait: { address: string; contract: string; name: string }
): Promise<boolean | null> {
  const url = `${API_BASE}/v2/traits/${contractAddress}/${contractName}/${trait.address}/${trait.contract}/${trait.name}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return res.status === 404 ? false : null;
    const data = await res.json();
    return data.is_implemented === true;
  } catch {
    return null;
  }
}

async function main() {
  const [traitArg, columnArg] = process.argv.slice(2);

  if (!traitArg || !columnArg) {
    console.error("Usage: npx tsx src/scripts/check-traits.ts <trait> <column>");
    console.error("  trait:  ADDRESS.CONTRACT.TRAIT (e.g. SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait.nft-trait)");
    console.error("  column: sip_009 or sip_010");
    process.exit(1);
  }

  if (!ALLOWED_COLUMNS.has(columnArg)) {
    console.error(`Invalid column: ${columnArg}. Allowed: ${[...ALLOWED_COLUMNS].join(", ")}`);
    process.exit(1);
  }

  const field = COLUMN_MAP[columnArg];
  const trait = parseTrait(traitArg);
  console.log(`Trait: ${trait.address}.${trait.contract}.${trait.name}`);
  console.log(`Column: ${columnArg}`);
  console.log(`API: ${API_BASE}`);
  console.log(`Concurrency: ${CONCURRENCY}`);

  // Reset all values to false
  console.log("Resetting all values to false...");
  await db.update(contracts).set({ [field]: false });
  console.log("Reset complete.");

  let offset = 0;
  let totalChecked = 0;
  let totalImplemented = 0;
  let totalErrors = 0;
  const startTime = Date.now();

  while (true) {
    const rows = await db
      .select({ contractId: contracts.contractId })
      .from(contracts)
      .orderBy(contracts.id)
      .limit(BATCH_SIZE)
      .offset(offset);

    if (rows.length === 0) break;

    const implementedIds: string[] = [];

    // Process in concurrent chunks
    for (let i = 0; i < rows.length; i += CONCURRENCY) {
      const chunk = rows.slice(i, i + CONCURRENCY);
      const results = await Promise.all(
        chunk.map(async (row) => {
          const dotIdx = row.contractId.indexOf(".");
          if (dotIdx === -1) return { contractId: row.contractId, result: null as boolean | null };
          const addr = row.contractId.slice(0, dotIdx);
          const name = row.contractId.slice(dotIdx + 1);
          return { contractId: row.contractId, result: await checkTrait(addr, name, trait) };
        })
      );

      for (const { contractId, result } of results) {
        if (result === true) {
          implementedIds.push(contractId);
          totalImplemented++;
        } else if (result === null) {
          totalErrors++;
        }
        totalChecked++;
      }

      if (totalChecked % LOG_INTERVAL < CONCURRENCY) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
        const rate = (totalChecked / ((Date.now() - startTime) / 1000)).toFixed(0);
        console.log(
          `Checked: ${totalChecked} | Implemented: ${totalImplemented} | Errors: ${totalErrors} | ${rate}/s | ${elapsed}s`
        );
      }
    }

    // Batch update implemented contracts
    if (implementedIds.length > 0) {
      await db
        .update(contracts)
        .set({ [field]: true })
        .where(inArray(contracts.contractId, implementedIds));
    }

    offset += BATCH_SIZE;
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\nDone in ${totalTime}s!`);
  console.log(`Total checked: ${totalChecked}`);
  console.log(`Implemented (${columnArg}): ${totalImplemented}`);
  console.log(`Errors/skipped: ${totalErrors}`);

  await pool.end();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
