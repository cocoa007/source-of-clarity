"use client";

import { useState, useCallback, type ReactNode } from "react";
import CommentSidebar from "./comments/CommentSidebar";

interface Props {
  children: ReactNode;
  contractId: string;
  principal: string;
  contractName: string;
  commentCounts: Record<number, number>;
  initialComments: CommentData[];
}

export interface CommentData {
  id: number;
  contractId: string;
  principal: string;
  contractName: string;
  lineNumber: number | null;
  lineRangeStart: number | null;
  lineRangeEnd: number | null;
  authorDid: string;
  authorHandle: string | null;
  postUri: string;
  postCid: string;
  parentUri: string | null;
  rootUri: string | null;
  body: string;
  createdAt: string | null;
  reactions: Record<string, number>;
  replyCount: number;
  userReaction?: string;
  userReactionUri?: string;
}

export default function ContractSourceInteractive({
  children,
  contractId,
  principal,
  contractName,
  commentCounts,
  initialComments,
}: Props) {
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [comments, setComments] = useState<CommentData[]>(initialComments);

  const handleSourceClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      const lineEl = target.closest("[data-line]") as HTMLElement | null;
      if (!lineEl) return;
      const line = parseInt(lineEl.dataset.line || "0", 10);
      if (line > 0) {
        setSelectedLine(line);
        setSidebarOpen(true);
      }
    },
    []
  );

  const refreshComments = useCallback(async () => {
    const res = await fetch(`/api/comments?contractId=${encodeURIComponent(contractId)}`);
    if (res.ok) {
      setComments(await res.json());
    }
  }, [contractId]);

  return (
    <div className="relative">
      {/* Source code with click handler */}
      <div onClick={handleSourceClick} className="cursor-pointer relative">
        {/* Comment count badges */}
        <div className="absolute left-0 top-0 w-10 pointer-events-none z-10">
          {Object.entries(commentCounts).map(([line, count]) => (
            <div
              key={line}
              className="absolute right-1 text-[10px] leading-[1.7rem] text-[#f7931a] font-bold"
              style={{ top: `calc(${(parseInt(line) - 1)} * 1.7rem + 1rem)` }}
              title={`${count} comment${count > 1 ? "s" : ""}`}
            >
              {count}
            </div>
          ))}
        </div>
        {children}
      </div>

      {/* Sidebar */}
      {sidebarOpen && (
        <CommentSidebar
          contractId={contractId}
          principal={principal}
          contractName={contractName}
          selectedLine={selectedLine}
          comments={comments}
          onClose={() => {
            setSidebarOpen(false);
            setSelectedLine(null);
          }}
          onShowAll={() => setSelectedLine(null)}
          onCommentPosted={refreshComments}
        />
      )}

      {/* Toggle button when sidebar is closed */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="mt-3 flex items-center gap-2 rounded-lg border border-[#30363d] bg-[#161b22] px-3 py-2 text-sm text-[#8b949e] hover:text-[#c9d1d9] hover:border-[#58a6ff] transition-colors"
        >
          <span>Comments ({comments.length})</span>
        </button>
      )}
    </div>
  );
}
