import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/atproto-auth";
import { upsertReaction, deleteReactionByUri } from "@/lib/comments";
import { createReactionRecord, generateTID } from "@/lexicon/conversion";
import { isValidReactionEmoji } from "@/lexicon/validation";
import { LEXICON_REACTION } from "@/lexicon/types";

export async function POST(request: NextRequest) {
  const session = getSessionFromCookies(request.headers.get("cookie"));
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { commentUri, commentCid, emoji } = await request.json();

  if (!commentUri || !emoji) {
    return NextResponse.json(
      { error: "commentUri and emoji are required" },
      { status: 400 }
    );
  }

  if (!isValidReactionEmoji(emoji)) {
    return NextResponse.json({ error: "Invalid emoji" }, { status: 400 });
  }

  const record = createReactionRecord({
    uri: commentUri,
    cid: commentCid || "",
    emoji,
  });

  // Write to PDS
  const rkey = generateTID();
  let postUri: string;

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
          collection: LEXICON_REACTION,
          rkey,
          record,
        }),
      }
    );

    if (!pdsRes.ok) {
      const err = await pdsRes.text();
      return NextResponse.json(
        { error: "Failed to write reaction to PDS", details: err },
        { status: 502 }
      );
    }

    const pdsData = await pdsRes.json();
    postUri = pdsData.uri;
  } catch (err) {
    return NextResponse.json(
      { error: "PDS request failed", details: String(err) },
      { status: 502 }
    );
  }

  // Cache locally — upsert handles toggling
  const result = await upsertReaction({
    commentUri,
    authorDid: session.did,
    emoji,
    postUri,
  });

  // If we replaced an old reaction, delete the old PDS record
  if (result.oldUri && result.action === "updated") {
    const oldRkey = result.oldUri.split("/").pop();
    if (oldRkey) {
      await fetch("https://bsky.social/xrpc/com.atproto.repo.deleteRecord", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessJwt}`,
        },
        body: JSON.stringify({
          repo: session.did,
          collection: LEXICON_REACTION,
          rkey: oldRkey,
        }),
      }).catch(() => {});
    }
  }

  return NextResponse.json({ action: result.action, postUri });
}

export async function DELETE(request: NextRequest) {
  const session = getSessionFromCookies(request.headers.get("cookie"));
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { reactionUri } = await request.json();
  if (!reactionUri) {
    return NextResponse.json(
      { error: "reactionUri is required" },
      { status: 400 }
    );
  }

  // Delete from PDS
  const rkey = reactionUri.split("/").pop();
  if (rkey) {
    await fetch("https://bsky.social/xrpc/com.atproto.repo.deleteRecord", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessJwt}`,
      },
      body: JSON.stringify({
        repo: session.did,
        collection: LEXICON_REACTION,
        rkey,
      }),
    }).catch(() => {});
  }

  await deleteReactionByUri(reactionUri, session.did);

  return NextResponse.json({ ok: true });
}
