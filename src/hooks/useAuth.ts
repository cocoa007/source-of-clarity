"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import React from "react";

interface AuthUser {
  did: string;
  handle: string;
  displayName?: string;
  avatar?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  login: async () => ({}),
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/atproto/session")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.did) setUser(data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(
    async (identifier: string, password: string) => {
      const res = await fetch("/api/auth/atproto/authorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return { error: data.error || "Login failed" };
      }
      const data = await res.json();
      setUser({ did: data.did, handle: data.handle });
      return {};
    },
    []
  );

  const logout = useCallback(async () => {
    await fetch("/api/auth/atproto/logout", { method: "POST" });
    setUser(null);
  }, []);

  return React.createElement(
    AuthContext.Provider,
    { value: { user, isLoading, login, logout } },
    children
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
