import { NextRequest, NextResponse } from "next/server";
import {
  getSessionFromCookies,
  refreshSession,
  makeSessionCookie,
} from "@/lib/atproto-auth";

export async function GET(request: NextRequest) {
  const session = getSessionFromCookies(
    request.headers.get("cookie")
  );

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Try to verify the access token is still valid by checking profile
  const profileRes = await fetch(
    `https://bsky.social/xrpc/app.bsky.actor.getProfile?actor=${encodeURIComponent(session.did)}`,
    { headers: { Authorization: `Bearer ${session.accessJwt}` } }
  );

  if (profileRes.ok) {
    const profile = await profileRes.json();
    return NextResponse.json({
      did: session.did,
      handle: profile.handle || session.handle,
      displayName: profile.displayName,
      avatar: profile.avatar,
    });
  }

  // Try refresh
  const refreshed = await refreshSession(session.refreshJwt);
  if (!refreshed) {
    return NextResponse.json({ error: "Session expired" }, { status: 401 });
  }

  const response = NextResponse.json({
    did: refreshed.did,
    handle: refreshed.handle,
  });
  response.headers.set("Set-Cookie", makeSessionCookie(refreshed));
  return response;
}
