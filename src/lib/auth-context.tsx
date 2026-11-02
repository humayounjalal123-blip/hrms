"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getSession, login as doLogin, logout as doLogout, setSession } from "./store";
import { SessionUser } from "./types";

interface AuthContextValue {
  user: SessionUser | null;
  loading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  refresh: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setUser(getSession());
  }, []);

  useEffect(() => {
    refresh();
    setLoading(false);
    const onUpdate = () => refresh();
    window.addEventListener("hrms-session-updated", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("hrms-session-updated", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, [refresh]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      login: async (email, password) => {
        try {
          const session = await doLogin(email, password);
          if (!session) return { ok: false, error: "Invalid email or password." };
          setUser(session);
          return { ok: true };
        } catch (err) {
          return {
            ok: false,
            error:
              err instanceof Error
                ? err.message
                : "Login failed. Check MySQL connection.",
          };
        }
      },
      logout: () => {
        doLogout();
        setUser(null);
      },
      refresh: () => {
        const session = getSession();
        setUser(session);
        if (session) setSession(session);
      },
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
