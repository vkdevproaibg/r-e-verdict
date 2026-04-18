import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type AppRole = "buyer" | "agent";
const KEY = "propaai_role_v2";

interface Ctx {
  role: AppRole;
  setRole: (r: AppRole) => void;
}

const RoleCtx = createContext<Ctx | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<AppRole>(() => {
    if (typeof window === "undefined") return "buyer";
    return (localStorage.getItem(KEY) as AppRole) || "buyer";
  });
  useEffect(() => {
    localStorage.setItem(KEY, role);
  }, [role]);
  return (
    <RoleCtx.Provider value={{ role, setRole: setRoleState }}>
      {children}
    </RoleCtx.Provider>
  );
}

export function useRole() {
  const v = useContext(RoleCtx);
  if (!v) throw new Error("useRole must be used inside RoleProvider");
  return v;
}
