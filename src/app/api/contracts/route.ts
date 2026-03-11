import { NextRequest, NextResponse } from "next/server";
import { searchContracts } from "@/lib/contracts";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const page = Math.max(1, parseInt(params.get("page") || "1", 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(params.get("limit") || "24", 10) || 24));
  const result = await searchContracts({
    query: params.get("q") || undefined,
    sip009: params.get("sip009") === "1",
    sip010: params.get("sip010") === "1",
    deployer: params.get("deployer") || undefined,
    network: params.get("network") === "testnet" ? "testnet" : "mainnet",
    page,
    limit,
  });
  return NextResponse.json(result);
}
