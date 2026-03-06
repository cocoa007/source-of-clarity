import { NextRequest, NextResponse } from "next/server";
import { requestAudit } from "@/lib/x402-client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await requestAudit(body);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "request failed" },
      { status: 500 }
    );
  }
}
