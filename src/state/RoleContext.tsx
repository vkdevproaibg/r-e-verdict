import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type AppRole = "buyer" | "agent";
const KEY = "propaai_role_v2";
const APP_KEY = "propaai_state_v1";

interface Ctx {
  role: AppRole;
  setRole: (r: AppRole) => void;
}

const RoleCtx = createContext<Ctx | null>(null);

function readRole(): AppRole {
  if (typeof window === "undefined") return "buyer";
  // Prefer the app-context state (set via onboarding) for single source of truth.
  try {
    const raw = localStorage.getItem(APP_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.role === "agent" || parsed?.role === "buyer") return parsed.role;
    }
  } catch {
    /* ignore */
  }
  return (localStorage.getItem(KEY) as AppRole) || "buyer";
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<AppRole>(readRole);

  const setRole = (next: AppRole) => {
    setRoleState(next);
    try {
      localStorage.setItem(KEY, next);
      const raw = localStorage.getItem(APP_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      localStorage.setItem(APP_KEY, JSON.stringify({ ...parsed, role: next }));
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    localStorage.setItem(KEY, role);
  }, [role]);

  // Sync with onboarding writes from AppContext (same tab uses a custom event,
  // other tabs use the native `storage` event).
  useEffect(() => {
    const sync = () => {
      const next = readRole();
      setRoleState((cur) => (cur === next ? cur : next));
    };
    window.addEventListener("storage", sync);
    window.addEventListener("focus", sync);
    const interval = window.setInterval(sync, 500);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("focus", sync);
      window.clearInterval(interval);
    };
  }, []);

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
