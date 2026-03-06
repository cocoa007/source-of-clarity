import type { CommentRecord, ReactionRecord } from "./types";

export function createCommentRecord(opts: {
  principal: string;
  name: string;
  txId?: string;
  text: string;
  lineNumber?: number;
  lineRange?: { start: number; end: number };
  replyRef?: {
    root: { uri: string; cid: string };
    parent: { uri: string; cid: string };
  };
}): CommentRecord {
  return {
    subject: {
      principal: opts.principal,
      name: opts.name,
      ...(opts.txId ? { txId: opts.txId } : {}),
    },
    text: opts.text,
    ...(opts.lineNumber !== undefined ? { lineNumber: opts.lineNumber } : {}),
    ...(opts.lineRange ? { lineRange: opts.lineRange } : {}),
    ...(opts.replyRef ? { replyRef: opts.replyRef } : {}),
    createdAt: new Date().toISOString(),
  };
}

export function createReactionRecord(opts: {
  uri: string;
  cid: string;
  emoji: string;
}): ReactionRecord {
  return {
    subject: { uri: opts.uri, cid: opts.cid },
    emoji: opts.emoji,
    createdAt: new Date().toISOString(),
  };
}

const BASE32_CHARS = "234567abcdefghijklmnopqrstuvwxyz";

export function generateTID(): string {
  const now = BigInt(Date.now()) * BigInt(1000);
  const clockId = BigInt(Math.floor(Math.random() * 1024));
  const tid = (now << BigInt(10)) | clockId;

  let result = "";
  let remaining = tid;
  for (let i = 0; i < 13; i++) {
    result = BASE32_CHARS[Number(remaining & BigInt(31))] + result;
    remaining >>= BigInt(5);
  }
  return result;
}
