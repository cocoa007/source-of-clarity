import { db } from "./db";
import { contracts, contractFunctions } from "./schema";
import { eq, ilike, or, desc, sql, and } from "drizzle-orm";

export async function getContractById(contractId: string) {
  const rows = await db
    .select()
    .from(contracts)
    .where(eq(contracts.contractId, contractId))
    .limit(1);
  return rows[0] || null;
}

export async function getContractFunctions(contractId: string) {
  return db
    .select()
    .from(contractFunctions)
    .where(eq(contractFunctions.contractId, contractId));
}

export async function searchContracts(opts: {
  query?: string;
  sip009?: boolean;
  sip010?: boolean;
  deployer?: string;
  network?: string;
  page?: number;
  limit?: number;
}) {
  const { query, sip009, sip010, deployer, network = "mainnet", page = 1, limit = 24 } = opts;
  const conditions = [];
  conditions.push(eq(contracts.network, network));

  if (query) {
    conditions.push(
      or(
        ilike(contracts.name, `%${query}%`),
        ilike(contracts.contractId, `%${query}%`)
      )
    );
  }
  if (sip009) conditions.push(eq(contracts.sip009, true));
  if (sip010) conditions.push(eq(contracts.sip010, true));
  if (deployer) conditions.push(eq(contracts.principal, deployer));

  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const offset = (page - 1) * limit;

  const queries: [
    Promise<(typeof contracts.$inferSelect)[]>,
    Promise<{ count: number }[]>,
    Promise<{ contractId: string; functionName: string; access: string }[]>,
  ] = [
    db
      .select()
      .from(contracts)
      .where(where)
      .orderBy(desc(contracts.blockHeight))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(contracts)
      .where(where),
    // Search functions by name when there's a query
    query
      ? db
          .select({
            contractId: contractFunctions.contractId,
            functionName: contractFunctions.name,
            access: contractFunctions.access,
          })
          .from(contractFunctions)
          .where(ilike(contractFunctions.name, `%${query}%`))
          .limit(20)
      : Promise.resolve([]),
  ];

  const [rows, countResult, functionMatches] = await Promise.all(queries);

  return {
    contracts: rows,
    total: countResult[0]?.count || 0,
    page,
    totalPages: Math.ceil((countResult[0]?.count || 0) / limit),
    functionMatches,
  };
}

export async function getContractStats(network = "mainnet") {
  const result = await db
    .select({
      total: sql<number>`count(*)::int`,
      nftCount: sql<number>`count(*) filter (where sip_009 = true)::int`,
      ftCount: sql<number>`count(*) filter (where sip_010 = true)::int`,
    })
    .from(contracts)
    .where(eq(contracts.network, network));
  return result[0];
}

export async function getRecentContracts(limit = 10, network = "mainnet") {
  return db
    .select()
    .from(contracts)
    .where(eq(contracts.network, network))
    .orderBy(desc(contracts.blockHeight))
    .limit(limit);
}

export async function getContractsByDeployer(address: string) {
  return db
    .select()
    .from(contracts)
    .where(eq(contracts.principal, address))
    .orderBy(desc(contracts.blockHeight));
}
