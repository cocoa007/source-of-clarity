"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import AuthButton from "./AuthButton";

interface Props {
  principal: string;
  contractName: string;
  lineNumber?: number;
  lineRange?: { start: number; end: number };
  parentUri?: string;
  rootUri?: string;
  onPosted: () => void;
}

export default function CommentForm({
  principal,
  contractName,
  lineNumber,
  lineRange,
  parentUri,
  rootUri,
  onPosted,
}: Props) {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  if (!user) {
    return (
      <div className="rounded-lg border border-[#30363d] bg-[#0d1117] p-3">
        <p className="mb-2 text-sm text-[#8b949e]">Sign in to comment</p>
        <AuthButton />
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setError("");
    setPosting(true);

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          principal,
          contractName,
          text: text.trim(),
          lineNumber,
          lineRange,
          parentUri,
          rootUri,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to post comment");
      }

      setText("");
      onPosted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post");
    } finally {
      setPosting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {lineNumber && (
        <span className="inline-block rounded bg-[#30363d] px-2 py-0.5 text-xs text-[#8b949e]">
          Line {lineNumber}
        </span>
      )}
      {lineRange && (
        <span className="inline-block rounded bg-[#30363d] px-2 py-0.5 text-xs text-[#8b949e]">
          Lines {lineRange.start}-{lineRange.end}
        </span>
      )}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={parentUri ? "Write a reply..." : "Write a comment..."}
        rows={3}
        className="w-full resize-none rounded-lg border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-[#c9d1d9] placeholder:text-[#484f58] focus:border-[#58a6ff] focus:outline-none"
      />
      {error && <p className="text-xs text-[#f85149]">{error}</p>}
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#484f58]">
          Posting as @{user.handle}
        </span>
        <button
          type="submit"
          disabled={posting || !text.trim()}
          className="rounded-lg bg-[#1185fe] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#1185fe]/90 disabled:opacity-50"
        >
          {posting ? "Posting..." : parentUri ? "Reply" : "Comment"}
        </button>
      </div>
    </form>
  );
}
