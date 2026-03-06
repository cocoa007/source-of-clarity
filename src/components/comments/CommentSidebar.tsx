"use client";

import type { CommentData } from "../ContractSourceInteractive";
import CommentForm from "./CommentForm";
import CommentThread from "./CommentThread";

interface Props {
  contractId: string;
  principal: string;
  contractName: string;
  selectedLine: number | null;
  comments: CommentData[];
  onClose: () => void;
  onShowAll: () => void;
  onCommentPosted: () => void;
}

export default function CommentSidebar({
  principal,
  contractName,
  selectedLine,
  comments,
  onClose,
  onShowAll,
  onCommentPosted,
}: Props) {
  const filtered = selectedLine
    ? comments.filter((c) => c.lineNumber === selectedLine && !c.parentUri)
    : comments.filter((c) => !c.parentUri);

  const lineLabel = selectedLine ? `Line ${selectedLine}` : "All";

  return (
    <div className="mt-4 rounded-lg border border-[#30363d] bg-[#161b22] p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-[#f0f6fc]">
            Comments
          </h3>
          <span className="rounded bg-[#30363d] px-2 py-0.5 text-xs text-[#8b949e]">
            {lineLabel}
          </span>
          <span className="text-xs text-[#484f58]">
            {filtered.length} comment{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {selectedLine && (
            <button
              onClick={onShowAll}
              className="text-xs text-[#58a6ff] hover:underline"
            >
              Show all
            </button>
          )}
          <button
            onClick={onClose}
            className="text-[#8b949e] hover:text-[#c9d1d9] text-lg leading-none"
          >
            &times;
          </button>
        </div>
      </div>

      {/* New comment form */}
      <div className="mb-4">
        <CommentForm
          principal={principal}
          contractName={contractName}
          lineNumber={selectedLine ?? undefined}
          onPosted={onCommentPosted}
        />
      </div>

      {/* Comment threads */}
      <div className="space-y-1 divide-y divide-[#21262d]">
        {filtered.length === 0 ? (
          <p className="py-4 text-center text-sm text-[#484f58]">
            No comments yet. Be the first!
          </p>
        ) : (
          filtered.map((comment) => {
            const replies = comments.filter(
              (c) => c.parentUri === comment.postUri
            );
            return (
              <CommentThread
                key={comment.postUri}
                comment={comment}
                replies={replies}
                allComments={comments}
                principal={principal}
                contractName={contractName}
                onCommentPosted={onCommentPosted}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
