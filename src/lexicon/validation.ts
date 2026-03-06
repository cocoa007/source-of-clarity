import type { CommentRecord } from "./types";
import { ALLOWED_REACTIONS } from "./types";

export function isValidCommentRecord(
  record: unknown
): record is CommentRecord {
  if (!record || typeof record !== "object") return false;
  const r = record as Record<string, unknown>;

  if (
    !r.subject ||
    typeof r.subject !== "object" ||
    !("principal" in (r.subject as object)) ||
    !("name" in (r.subject as object))
  )
    return false;

  if (typeof r.text !== "string" || r.text.length === 0 || r.text.length > 10000)
    return false;

  if (typeof r.createdAt !== "string") return false;

  if (r.lineNumber !== undefined && (typeof r.lineNumber !== "number" || r.lineNumber < 1))
    return false;

  if (r.lineRange !== undefined && !isValidLineRange(r.lineRange)) return false;

  return true;
}

export function isValidLineRange(
  range: unknown
): range is { start: number; end: number } {
  if (!range || typeof range !== "object") return false;
  const r = range as Record<string, unknown>;
  return (
    typeof r.start === "number" &&
    typeof r.end === "number" &&
    r.start >= 1 &&
    r.end >= r.start
  );
}

export function isValidReactionEmoji(emoji: string): boolean {
  return ALLOWED_REACTIONS.includes(emoji);
}

export function getCommentType(
  record: CommentRecord
): "contract" | "line" | "range" {
  if (record.lineRange) return "range";
  if (record.lineNumber) return "line";
  return "contract";
}
