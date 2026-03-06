import { NextResponse } from "next/server";

export async function GET() {
  const clientId =
    process.env.ATPROTO_CLIENT_ID || "https://source-of-clarity.example.com/";

  return NextResponse.json({
    client_id: clientId,
    client_name: "Source of Clarity",
    client_uri: clientId,
    redirect_uris: [`${clientId}oauth/callback`],
    grant_types: ["authorization_code", "refresh_token"],
    scope: "atproto transition:generic",
    response_types: ["code"],
    token_endpoint_auth_method: "none",
    application_type: "web",
    dpop_bound_access_tokens: true,
  });
}
