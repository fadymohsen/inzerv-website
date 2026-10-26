"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { auth } from "@/lib/api-client";
import type { AuthUser } from "@/lib/types";

type Status = "loading" | "authenticated" | "anonymous";

type Ctx = {
  status: Status;
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<Ctx>({
  status: "loading",
  user: null,
  setUser: () => {},
  signOut: async () => {},
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let cancelled = false;
    auth
      .session()
      .then(({ user }) => {
        if (cancelled) return;
        setUserState(user);
        setStatus(user ? "authenticated" : "anonymous");
      })
      .catch(() => {
        if (!cancelled) setStatus("anonymous");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setUser = useCallback((next: AuthUser | null) => {
    setUserState(next);
    setStatus(next ? "authenticated" : "anonymous");
  }, []);

  const signOut = useCallback(async () => {
    try {
      await auth.logout();
    } finally {
      setUser(null);
    }
  }, [setUser]);

  const value = useMemo(() => ({ status, user, setUser, signOut }), [status, user, setUser, signOut]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  return useContext(SessionContext);
}
