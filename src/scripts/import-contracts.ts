import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { contracts, contractFunctions } from "../lib/schema";
import { parseClaritySource } from "../lib/clarity-parser";

const HIRO_API = "https://api.hiro.so";
const BATCH_SIZE = 50;
const MAX_CONTRACTS = 5000;

interface TxResult {
  tx_id: string;
  block_height: number;
  burn_block_time_iso: string;
  smart_contract: {
    contract_id: string;
    source_code: string;
  };
  tx_status: string;
}

async function fetchContractTxs(offset: number, limit: number) {
  const url = `${HIRO_API}/extended/v1/tx?type=smart_contract&offset=${offset}&limit=${limit}`;
  const headers: Record<string, string> = {};
  if (process.env.HIRO_API_KEY) {
    headers["x-hiro-api-key"] = process.env.HIRO_API_KEY;
  }
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Hiro API error: ${res.status}`);
  return res.json() as Promise<{
    results: TxResult[];
    total: number;
  }>;
}

async function main() {
  const pool = new pg.Pool({
    connectionString:
      process.env.DATABASE_URL || "postgres://agent@/source_of_clarity?host=/var/run/postgresql",
  });
  const db = drizzle(pool);

  let offset = 0;
  let imported = 0;
  let total = MAX_CONTRACTS;

  console.log(`Importing up to ${MAX_CONTRACTS} contracts from Hiro API...`);

  while (offset < total && imported < MAX_CONTRACTS) {
    try {
      const data = await fetchContractTxs(offset, BATCH_SIZE);
      total = Math.min(data.total, MAX_CONTRACTS);

      if (data.results.length === 0) break;

      for (const tx of data.results) {
        if (tx.tx_status !== "success" || !tx.smart_contract) continue;

        const contractId = tx.smart_contract.contract_id;
        const source = tx.smart_contract.source_code;
        const [principal, name] = contractId.split(".");
        const parsed = source ? parseClaritySource(source) : null;

        try {
          const [inserted] = await db
            .insert(contracts)
            .values({
              principal,
              name,
              contractId,
              source: source || null,
              txId: tx.tx_id,
              blockHeight: tx.block_height,
              deployedAt: tx.burn_block_time_iso
                ? new Date(tx.burn_block_time_iso)
                : null,
              sip009: parsed?.sip009 || false,
              sip010: parsed?.sip010 || false,
              functionCount: parsed?.functions.length || 0,
            })
            .onConflictDoNothing()
            .returning();

          if (inserted && parsed) {
            for (const fn of parsed.functions) {
              await db
                .insert(contractFunctions)
                .values({
                  contractId,
                  name: fn.name,
                  access: fn.access,
                  args: fn.args,
                  returnType: fn.returnType,
                })
                .onConflictDoNothing();
            }
            imported++;
          }
        } catch {
          // Skip duplicates
        }
      }

      console.log(`  Progress: ${imported} imported (offset: ${offset}/${total})`);
      offset += BATCH_SIZE;

      // Rate limit
      await new Promise((r) => setTimeout(r, 200));
    } catch (err) {
      console.error(`  Error at offset ${offset}:`, err);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }

  console.log(`\nDone: ${imported} contracts imported`);
  await pool.end();
}

main().catch(console.error);
