import { NextRequest, NextResponse } from "next/server";
import { processChainhookPayload } from "@/lib/chainhook";

export async function POST(request: NextRequest) {
  const authToken = process.env.CHAINHOOK_AUTH_TOKEN;
  if (!authToken) {
    return NextResponse.json(
      { error: "CHAINHOOK_AUTH_TOKEN not configured" },
      { status: 500 }
    );
  }
  const provided = request.headers.get("authorization")?.replace("Bearer ", "");
  if (provided !== authToken) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const indexed = await processChainhookPayload(payload);
    return NextResponse.json({ indexed });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "unknown" },
      { status: 500 }
    );
  }
}
