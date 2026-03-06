"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function AuthButton({ compact }: { compact?: boolean }) {
  const { user, isLoading, login, logout } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isLoading) {
    return (
      <span className="text-sm text-[#8b949e]">...</span>
    );
  }

  if (user) {
    if (compact) {
      return (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-[#58a6ff]">@{user.handle}</span>
          <button
            onClick={logout}
            className="text-[#8b949e] hover:text-[#c9d1d9] text-xs"
          >
            Sign out
          </button>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-[#58a6ff]">@{user.handle}</span>
        <button
          onClick={logout}
          className="rounded border border-[#30363d] px-2 py-1 text-xs text-[#8b949e] hover:text-[#c9d1d9]"
        >
          Sign out
        </button>
      </div>
    );
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="rounded-lg bg-[#1185fe] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#1185fe]/90 transition-colors"
      >
        Sign in with Bluesky
      </button>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const result = await login(identifier, password);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
    } else {
      setShowForm(false);
      setIdentifier("");
      setPassword("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <input
        type="text"
        placeholder="handle.bsky.social"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        className="rounded border border-[#30363d] bg-[#0d1117] px-3 py-1.5 text-sm text-[#c9d1d9] placeholder:text-[#484f58] focus:border-[#58a6ff] focus:outline-none"
      />
      <input
        type="password"
        placeholder="App password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="rounded border border-[#30363d] bg-[#0d1117] px-3 py-1.5 text-sm text-[#c9d1d9] placeholder:text-[#484f58] focus:border-[#58a6ff] focus:outline-none"
      />
      {error && <p className="text-xs text-[#f85149]">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting || !identifier || !password}
          className="rounded bg-[#1185fe] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#1185fe]/90 disabled:opacity-50"
        >
          {submitting ? "Signing in..." : "Sign in"}
        </button>
        <button
          type="button"
          onClick={() => {
            setShowForm(false);
            setError("");
          }}
          className="rounded border border-[#30363d] px-3 py-1.5 text-sm text-[#8b949e] hover:text-[#c9d1d9]"
        >
          Cancel
        </button>
      </div>
      <p className="text-[10px] text-[#484f58]">
        Use a Bluesky app password from Settings &gt; App Passwords
      </p>
    </form>
  );
}
