"use client";

import { useState } from "react";
import type { CommentData } from "../ContractSourceInteractive";
import CommentForm from "./CommentForm";
import ReactionPicker from "./ReactionPicker";

interface Props {
  comment: CommentData;
  replies: CommentData[];
  allComments: CommentData[];
  principal: string;
  contractName: string;
  depth?: number;
  onCommentPosted: () => void;
}

export default function CommentThread({
  comment,
  replies,
  allComments,
  principal,
  contractName,
  depth = 0,
  onCommentPosted,
}: Props) {
  const [showReply, setShowReply] = useState(false);
  const maxDepth = 3;

  const timeAgo = comment.createdAt
    ? formatTimeAgo(new Date(comment.createdAt))
    : "";

  return (
    <div
      className={`${depth > 0 ? "ml-4 border-l border-[#21262d] pl-3" : ""}`}
    >
      <div className="py-2">
        {/* Header */}
        <div className="flex items-center gap-2 text-xs">
          <a
            href={`https://bsky.app/profile/${comment.authorHandle || comment.authorDid}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#58a6ff] hover:underline"
          >
            @{comment.authorHandle || comment.authorDid.slice(0, 16)}
          </a>
          <span className="text-[#484f58]">{timeAgo}</span>
          {comment.lineNumber && (
            <span className="rounded bg-[#30363d] px-1.5 py-0.5 text-[10px] text-[#8b949e]">
              L{comment.lineNumber}
            </span>
          )}
        </div>

        {/* Body */}
        <p className="mt-1 text-sm text-[#c9d1d9] whitespace-pre-wrap">
          {comment.body}
        </p>

        {/* Actions */}
        <div className="mt-2 flex items-center gap-3">
          <ReactionPicker
            commentUri={comment.postUri}
            commentCid={comment.postCid}
            reactions={comment.reactions}
            userReaction={comment.userReaction}
            onReacted={onCommentPosted}
          />
          {depth < maxDepth && (
            <button
              onClick={() => setShowReply(!showReply)}
              className="text-xs text-[#8b949e] hover:text-[#58a6ff]"
            >
              {showReply ? "Cancel" : "Reply"}
            </button>
          )}
        </div>

        {/* Reply form */}
        {showReply && (
          <div className="mt-2">
            <CommentForm
              principal={principal}
              contractName={contractName}
              lineNumber={comment.lineNumber ?? undefined}
              parentUri={comment.postUri}
              rootUri={comment.rootUri || comment.postUri}
              onPosted={() => {
                setShowReply(false);
                onCommentPosted();
              }}
            />
          </div>
        )}
      </div>

      {/* Nested replies */}
      {replies.map((reply) => {
        const childReplies = allComments.filter(
          (c) => c.parentUri === reply.postUri
        );
        return (
          <CommentThread
            key={reply.postUri}
            comment={reply}
            replies={childReplies}
            allComments={allComments}
            principal={principal}
            contractName={contractName}
            depth={depth + 1}
            onCommentPosted={onCommentPosted}
          />
        );
      })}
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
}
