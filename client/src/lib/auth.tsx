import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type Role = "admin" | "student" | "teacher" | null;

type AuthContextValue = {
  role: Role;
  username: string | null;
  setRole: (r: Role) => void;
  setSession: (r: { role: Exclude<Role, null>; username: string }) => void;
  clear: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<Role>(() => {
    const saved = localStorage.getItem("app.role");
    return (saved as Role) || null;
  });
  const [username, setUsername] = useState<string | null>(() => {
    const u = localStorage.getItem("app.username");
    return u || null;
  });

  const setRole = (r: Role) => {
    setRoleState(r);
    if (r) localStorage.setItem("app.role", r);
    else localStorage.removeItem("app.role");
  };

  const setSession = (r: { role: Exclude<Role, null>; username: string }) => {
    setRoleState(r.role);
    setUsername(r.username);
    localStorage.setItem("app.role", r.role);
    localStorage.setItem("app.username", r.username);
  };

  const clear = () => {
    setRole(null);
    setUsername(null);
  localStorage.removeItem("app.role");
    localStorage.removeItem("app.username");
  };

  const value = useMemo(() => ({ role, username, setRole, setSession, clear }), [role, username]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
