"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export default function AuthButton({ compact }: { compact?: boolean }) {
  const { user, isLoading, login, logout } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isLoading) {
    return (
      <span className="text-sm text-muted-foreground">...</span>
    );
  }

  if (user) {
    if (compact) {
      return (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-accent">@{user.handle}</span>
          <Button variant="ghost" size="sm" onClick={logout} className="text-xs text-muted-foreground h-auto px-1 py-0">
            Sign out
          </Button>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-accent">@{user.handle}</span>
        <Button variant="outline" size="sm" onClick={logout} className="text-xs">
          Sign out
        </Button>
      </div>
    );
  }

  if (!showForm) {
    return (
      <Button
        onClick={() => setShowForm(true)}
        className="bg-[#1185fe] text-white hover:bg-[#1185fe]/90"
        size="sm"
      >
        Sign in with Bluesky
      </Button>
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
      <Input
        type="text"
        placeholder="handle.bsky.social"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        className="h-8 text-sm"
      />
      <Input
        type="password"
        placeholder="App password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="h-8 text-sm"
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={submitting || !identifier || !password}
          size="sm"
          className="bg-[#1185fe] text-white hover:bg-[#1185fe]/90"
        >
          {submitting ? "Signing in..." : "Sign in"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setShowForm(false);
            setError("");
          }}
        >
          Cancel
        </Button>
      </div>
      <p className="text-[10px] text-muted-foreground">
        Use a Bluesky app password from Settings &gt; App Passwords
      </p>
    </form>
  );
}
