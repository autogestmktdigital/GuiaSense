"use client";

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import {
  authApi,
  clearToken,
  getToken,
  PublicUser,
  setToken,
} from "./api";

const SESSION_IDLE_MINUTES = 30;
const IDLE_EVENTS = ["pointerdown", "keydown", "wheel", "touchstart", "scroll"] as const;

type AuthContextType = {
  user: PublicUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<PublicUser>;
  register: (name: string, email: string, password: string, consent: boolean) => Promise<PublicUser>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

function useIdleSessionTimeout(active: boolean, onExpire: () => void) {
  useEffect(() => {
    if (!active) return;

    const idleMs = SESSION_IDLE_MINUTES * 60 * 1000;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const reset = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(onExpire, idleMs);
    };

    IDLE_EVENTS.forEach((event) =>
      window.addEventListener(event, reset, { passive: true }),
    );

    reset();

    return () => {
      if (timer) clearTimeout(timer);
      IDLE_EVENTS.forEach((event) =>
        window.removeEventListener(event, reset),
      );
    };
  }, [active, onExpire]);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (!getToken()) return;
    try {
      const { user } = await authApi.me();
      setUser(user);
    } catch {
      clearToken();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await authApi.login({ email, password });
    setToken(result.token);
    setUser(result.user);
    return result.user;
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string, consent: boolean) => {
      const result = await authApi.register({ name, email, password, consent });
      setToken(result.token);
      setUser(result.user);
      return result.user;
    },
    [],
  );

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  useIdleSessionTimeout(Boolean(user), () => {
    logout();
    window.location.href = "/login";
  });

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  }
  return context;
}
