"use client";

import { useAuth } from "@/hooks/useAuth";
import { ALLOWED_REACTIONS } from "@/lexicon/types";

interface Props {
  commentUri: string;
  commentCid: string;
  reactions: Record<string, number>;
  userReaction?: string;
  onReacted: () => void;
}

export default function ReactionPicker({
  commentUri,
  commentCid,
  reactions,
  userReaction,
  onReacted,
}: Props) {
  const { user } = useAuth();

  async function handleReact(emoji: string) {
    if (!user) return;
    await fetch("/api/reactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentUri, commentCid, emoji }),
    });
    onReacted();
  }

  return (
    <div className="flex flex-wrap gap-1">
      {ALLOWED_REACTIONS.map((emoji) => {
        const count = reactions[emoji] || 0;
        const isActive = userReaction === emoji;
        if (count === 0 && !user) return null;
        return (
          <button
            key={emoji}
            onClick={() => handleReact(emoji)}
            disabled={!user}
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors ${
              isActive
                ? "border-[#58a6ff] bg-[#58a6ff]/10 text-[#58a6ff]"
                : "border-[#30363d] text-[#8b949e] hover:border-[#484f58]"
            } disabled:cursor-default disabled:opacity-60`}
          >
            <span>{emoji}</span>
            {count > 0 && <span>{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
