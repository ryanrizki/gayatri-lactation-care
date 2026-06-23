import React, { createContext, useContext, useEffect, useState } from "react";

export interface AuthUser {
  nama: string;
  kontak: string; // WhatsApp / email
}

interface AuthCtx {
  user: AuthUser | null;
  login: (nama: string, kontak: string) => void;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);
const STORAGE_KEY = "gayatri_user";

function readStored(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readStored());

  useEffect(() => {
    try {
      if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore storage errors */
    }
  }, [user]);

  const login = (nama: string, kontak: string) => setUser({ nama, kontak });
  const logout = () => setUser(null);

  return <Ctx.Provider value={{ user, login, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
