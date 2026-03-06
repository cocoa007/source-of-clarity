import { NextRequest, NextResponse } from "next/server";
import { createSession, makeSessionCookie } from "@/lib/atproto-auth";

export async function POST(request: NextRequest) {
  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "identifier and password are required" },
        { status: 400 }
      );
    }

    const session = await createSession(identifier, password);
    if (!session) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      did: session.did,
      handle: session.handle,
    });
    response.headers.set("Set-Cookie", makeSessionCookie(session));
    return response;
  } catch (err) {
    console.error("Auth error:", err);
    return NextResponse.json(
      { error: "Authentication failed. Check your handle and app password." },
      { status: 500 }
    );
  }
}
