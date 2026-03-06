import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/atproto-auth";
import {
  getCommentsByContract,
  insertComment,
  getUserReactions,
} from "@/lib/comments";
import { createCommentRecord, generateTID } from "@/lexicon/conversion";
import { isValidCommentRecord } from "@/lexicon/validation";
import { LEXICON_COMMENT } from "@/lexicon/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const contractId = searchParams.get("contractId");

  if (!contractId) {
    return NextResponse.json(
      { error: "contractId is required" },
      { status: 400 }
    );
  }

  const comments = await getCommentsByContract(contractId);

  // If user is logged in, attach their reactions
  const session = getSessionFromCookies(request.headers.get("cookie"));
  if (session) {
    const uris = comments.map((c) => c.postUri);
    const userReactions = await getUserReactions(uris, session.did);
    for (const comment of comments) {
      const r = userReactions[comment.postUri];
      if (r) {
        (comment as Record<string, unknown>).userReaction = r.emoji;
        (comment as Record<string, unknown>).userReactionUri = r.postUri;
      }
    }
  }

  return NextResponse.json(comments);
}

export async function POST(request: NextRequest) {
  const session = getSessionFromCookies(request.headers.get("cookie"));
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { principal, contractName, text, lineNumber, lineRange, parentUri, rootUri } =
    body;

  if (!principal || !contractName || !text) {
    return NextResponse.json(
      { error: "principal, contractName, and text are required" },
      { status: 400 }
    );
  }

  const record = createCommentRecord({
    principal,
    name: contractName,
    text,
    lineNumber,
    lineRange,
    replyRef:
      parentUri && rootUri
        ? {
            root: { uri: rootUri, cid: "" },
            parent: { uri: parentUri, cid: "" },
          }
        : undefined,
  });

  if (!isValidCommentRecord(record)) {
    return NextResponse.json({ error: "Invalid comment data" }, { status: 400 });
  }

  // Write record to user's PDS
  const rkey = generateTID();
  let postUri: string;
  let postCid: string;

  try {
    const pdsRes = await fetch(
      "https://bsky.social/xrpc/com.atproto.repo.createRecord",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessJwt}`,
        },
        body: JSON.stringify({
          repo: session.did,
          collection: LEXICON_COMMENT,
          rkey,
          record,
        }),
      }
    );

    if (!pdsRes.ok) {
      const err = await pdsRes.text();
      return NextResponse.json(
        { error: "Failed to write to PDS", details: err },
        { status: 502 }
      );
    }

    const pdsData = await pdsRes.json();
    postUri = pdsData.uri;
    postCid = pdsData.cid;
  } catch (err) {
    return NextResponse.json(
      { error: "PDS request failed", details: String(err) },
      { status: 502 }
    );
  }

  // Cache locally
  const contractId = `${principal}.${contractName}`;
  const comment = await insertComment({
    contractId,
    principal,
    contractName,
    lineNumber,
    lineRangeStart: lineRange?.start,
    lineRangeEnd: lineRange?.end,
    authorDid: session.did,
    authorHandle: session.handle,
    postUri,
    postCid,
    parentUri,
    rootUri,
    body: text,
  });

  return NextResponse.json(comment, { status: 201 });
}
