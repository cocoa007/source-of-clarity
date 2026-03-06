import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { contracts, contractFunctions } from "../lib/schema";
import { parseClaritySource } from "../lib/clarity-parser";

const REPO_URL = "https://github.com/boomcrypto/clarity-deployed-contracts.git";
const CLONE_DIR = "/home/agent/cocoa007/clarity-deployed-contracts";
const CONTRACTS_DIR = path.join(CLONE_DIR, "contracts");
const BATCH_SIZE = 100;

async function main() {
  // 1. Clone repo (shallow, single branch)
  if (!fs.existsSync(CLONE_DIR)) {
    console.log("Cloning clarity-deployed-contracts (shallow)...");
    execSync(`git clone --depth 1 --single-branch ${REPO_URL} ${CLONE_DIR}`, {
      stdio: "inherit",
    });
  } else {
    console.log("Repo already cloned, pulling latest...");
    execSync(`git -C ${CLONE_DIR} pull --ff-only`, { stdio: "inherit" });
  }

  // 2. Load SIP-009 and SIP-010 lists
  const sip9Set = loadSipList(path.join(CLONE_DIR, "sip9.txt"));
  const sip10Set = loadSipList(path.join(CLONE_DIR, "sip10.txt"));
  console.log(`SIP-009 contracts: ${sip9Set.size}, SIP-010 contracts: ${sip10Set.size}`);

  // 3. Connect to DB
  const pool = new pg.Pool({
    connectionString:
      process.env.DATABASE_URL ||
      "postgres://agent@/source_of_clarity?host=/var/run/postgresql",
  });
  const db = drizzle(pool);

  // 4. Walk contracts directory
  const principals = fs.readdirSync(CONTRACTS_DIR).filter((f) => {
    const full = path.join(CONTRACTS_DIR, f);
    return fs.statSync(full).isDirectory() && f.startsWith("S");
  });

  console.log(`Found ${principals.length} deployer directories`);

  let imported = 0;
  let skipped = 0;
  let errors = 0;
  let batch: typeof contractRows = [];
  let fnBatch: typeof fnRows = [];

  type ContractRow = typeof contracts.$inferInsert;
  type FnRow = typeof contractFunctions.$inferInsert;
  const contractRows: ContractRow[] = [];
  const fnRows: FnRow[] = [];

  for (let pi = 0; pi < principals.length; pi++) {
    const principal = principals[pi];
    const principalDir = path.join(CONTRACTS_DIR, principal);
    const files = fs
      .readdirSync(principalDir)
      .filter((f) => f.endsWith(".clar"));

    for (const file of files) {
      const name = file.replace(".clar", "");
      const contractId = `${principal}.${name}`;

      try {
        const source = fs.readFileSync(
          path.join(principalDir, file),
          "utf-8"
        );
        const parsed = parseClaritySource(source);

        batch.push({
          principal,
          name,
          contractId,
          source,
          sip009: sip9Set.has(contractId) || parsed.sip009,
          sip010: sip10Set.has(contractId) || parsed.sip010,
          functionCount: parsed.functions.length,
        });

        for (const fn of parsed.functions) {
          fnBatch.push({
            contractId,
            name: fn.name,
            access: fn.access,
            args: fn.args,
            returnType: fn.returnType,
          });
        }

        // Flush batch
        if (batch.length >= BATCH_SIZE) {
          const result = await flushBatch(db, batch, fnBatch);
          imported += result.inserted;
          skipped += result.skipped;
          batch = [];
          fnBatch = [];

          if ((imported + skipped) % 5000 === 0) {
            console.log(
              `  Progress: ${imported} imported, ${skipped} skipped (${pi + 1}/${principals.length} deployers)`
            );
          }
        }
      } catch (err) {
        errors++;
      }
    }
  }

  // Flush remaining
  if (batch.length > 0) {
    const result = await flushBatch(db, batch, fnBatch);
    imported += result.inserted;
    skipped += result.skipped;
  }

  console.log(
    `\nDone: ${imported} imported, ${skipped} skipped, ${errors} errors`
  );
  await pool.end();
}

async function flushBatch(
  db: ReturnType<typeof drizzle>,
  batch: (typeof contracts.$inferInsert)[],
  fnBatch: (typeof contractFunctions.$inferInsert)[]
) {
  let inserted = 0;
  let skipped = 0;

  // Insert contracts one-by-one with onConflictDoNothing to count
  // But for speed, do bulk insert and catch conflicts
  try {
    const result = await db
      .insert(contracts)
      .values(batch)
      .onConflictDoNothing()
      .returning({ contractId: contracts.contractId });

    inserted = result.length;
    skipped = batch.length - result.length;

    // Only insert functions for newly inserted contracts
    if (result.length > 0 && fnBatch.length > 0) {
      const insertedIds = new Set(result.map((r) => r.contractId));
      const fnsToInsert = fnBatch.filter((fn) => insertedIds.has(fn.contractId));
      if (fnsToInsert.length > 0) {
        await db.insert(contractFunctions).values(fnsToInsert).onConflictDoNothing();
      }
    }
  } catch (err) {
    // Fallback: insert one by one
    for (const row of batch) {
      try {
        const [r] = await db
          .insert(contracts)
          .values(row)
          .onConflictDoNothing()
          .returning({ contractId: contracts.contractId });
        if (r) {
          inserted++;
          const fns = fnBatch.filter((fn) => fn.contractId === r.contractId);
          if (fns.length > 0) {
            await db.insert(contractFunctions).values(fns).onConflictDoNothing();
          }
        } else {
          skipped++;
        }
      } catch {
        skipped++;
      }
    }
  }

  return { inserted, skipped };
}

function loadSipList(filePath: string): Set<string> {
  const set = new Set<string>();
  if (!fs.existsSync(filePath)) return set;
  const lines = fs.readFileSync(filePath, "utf-8").split("\n");
  for (const line of lines) {
    const parts = line.split(",").map((s) => s.trim());
    if (parts.length >= 2 && parts[1].includes(".")) {
      set.add(parts[1]);
    }
  }
  return set;
}

main().catch(console.error);
