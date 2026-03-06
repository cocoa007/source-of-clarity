import { NextRequest, NextResponse } from "next/server";
import { getJobStatus } from "@/lib/x402-client";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const result = await getJobStatus(id);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "status check failed" },
      { status: 500 }
    );
  }
}
