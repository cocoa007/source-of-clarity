import { NextResponse } from "next/server";
import { AUDIT_TYPES } from "@/lib/x402-client";

export async function GET() {
  return NextResponse.json(AUDIT_TYPES);
}
