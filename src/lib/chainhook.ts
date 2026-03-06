import { db } from "./db";
import { contracts, contractFunctions } from "./schema";
import { parseClaritySource } from "./clarity-parser";

interface ChainhookPayload {
  apply: {
    transactions: {
      metadata: {
        kind: {
          type: string;
          data?: {
            contract_identifier?: string;
            code?: string;
          };
        };
      };
      transaction_identifier: { hash: string };
    }[];
    block_identifier: { index: number };
    timestamp: number;
  }[];
}

export async function processChainhookPayload(payload: ChainhookPayload) {
  const results = [];

  for (const block of payload.apply || []) {
    for (const tx of block.transactions || []) {
      const kind = tx.metadata?.kind;
      if (kind?.type !== "ContractDeployment" || !kind.data) continue;

      const contractId = kind.data.contract_identifier;
      const source = kind.data.code;
      if (!contractId) continue;

      const [principal, name] = contractId.split(".");
      const parsed = source ? parseClaritySource(source) : null;

      const [inserted] = await db
        .insert(contracts)
        .values({
          principal,
          name,
          contractId,
          source: source || null,
          txId: tx.transaction_identifier?.hash,
          blockHeight: block.block_identifier?.index,
          deployedAt: block.timestamp
            ? new Date(block.timestamp * 1000)
            : null,
          sip009: parsed?.sip009 || false,
          sip010: parsed?.sip010 || false,
          functionCount: parsed?.functions.length || 0,
        })
        .onConflictDoNothing()
        .returning();

      if (inserted && parsed) {
        for (const fn of parsed.functions) {
          await db.insert(contractFunctions).values({
            contractId,
            name: fn.name,
            access: fn.access,
            args: fn.args,
            returnType: fn.returnType,
          });
        }
      }

      results.push(contractId);
    }
  }

  return results;
}
