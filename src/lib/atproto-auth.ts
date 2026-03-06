import crypto from "crypto";

const SESSION_SECRET =
  process.env.ATPROTO_SESSION_SECRET || "default-dev-secret-change-in-prod!!";

interface SessionData {
  did: string;
  handle: string;
  accessJwt?: string;
  refreshJwt?: string;
}

export function encryptSession(data: SessionData): string {
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(SESSION_SECRET, "salt", 32);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(JSON.stringify(data), "utf8", "base64");
  encrypted += cipher.final("base64");
  return iv.toString("base64") + "." + encrypted;
}

export function decryptSession(token: string): SessionData | null {
  try {
    const [ivB64, encrypted] = token.split(".");
    if (!ivB64 || !encrypted) return null;
    const iv = Buffer.from(ivB64, "base64");
    const key = crypto.scryptSync(SESSION_SECRET, "salt", 32);
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decrypted = decipher.update(encrypted, "base64", "utf8");
    decrypted += decipher.final("utf8");
    return JSON.parse(decrypted);
  } catch {
    return null;
  }
}

export function getSessionFromCookies(
  cookieHeader: string | null
): SessionData | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/atproto_session=([^;]+)/);
  if (!match) return null;
  return decryptSession(decodeURIComponent(match[1]));
}

export function makeSessionCookie(data: SessionData): string {
  const encrypted = encryptSession(data);
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `atproto_session=${encodeURIComponent(encrypted)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}${secure}`;
}

export function clearSessionCookie(): string {
  return "atproto_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0";
}

export async function resolveHandleToDid(
  handle: string
): Promise<string | null> {
  try {
    const res = await fetch(
      `https://bsky.social/xrpc/com.atproto.identity.resolveHandle?handle=${encodeURIComponent(handle)}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.did || null;
  } catch {
    return null;
  }
}

export async function createSession(
  identifier: string,
  password: string
): Promise<SessionData | null> {
  try {
    const res = await fetch(
      "https://bsky.social/xrpc/com.atproto.server.createSession",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return {
      did: data.did,
      handle: data.handle,
      accessJwt: data.accessJwt,
      refreshJwt: data.refreshJwt,
    };
  } catch {
    return null;
  }
}

export async function refreshSession(
  refreshJwt: string
): Promise<SessionData | null> {
  try {
    const res = await fetch(
      "https://bsky.social/xrpc/com.atproto.server.refreshSession",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${refreshJwt}` },
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return {
      did: data.did,
      handle: data.handle,
      accessJwt: data.accessJwt,
      refreshJwt: data.refreshJwt,
    };
  } catch {
    return null;
  }
}
