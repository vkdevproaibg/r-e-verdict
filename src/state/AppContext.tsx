import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Role = "agent" | "buyer";
export type Goal = "live" | "invest" | "rent" | "business";
export type Lang = "ru" | "en";

interface AppState {
  role: Role | null;
  setRole: (r: Role) => void;
  goal: Goal | null;
  setGoal: (g: Goal) => void;
  lang: Lang;
  setLang: (l: Lang) => void;
  onboarded: boolean;
  setOnboarded: (v: boolean) => void;
  geo: { lat: number; lng: number } | null;
  setGeo: (g: { lat: number; lng: number } | null) => void;
  geoStatus: "idle" | "requesting" | "granted" | "denied";
  requestGeo: () => Promise<void>;
}

const Ctx = createContext<AppState | null>(null);

const KEY = "propaai_state_v1";

export function AppProvider({ children }: { children: ReactNode }) {
  const initial = (() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  })();

  const [role, setRoleS] = useState<Role | null>(initial.role ?? null);
  const [goal, setGoalS] = useState<Goal | null>(initial.goal ?? null);
  const [lang, setLangS] = useState<Lang>(initial.lang ?? "ru");
  const [onboarded, setOnboardedS] = useState<boolean>(initial.onboarded ?? false);
  const [geo, setGeo] = useState<{ lat: number; lng: number } | null>(initial.geo ?? null);
  const [geoStatus, setGeoStatus] = useState<AppState["geoStatus"]>("idle");

  // Keep RoleContext (separate store keyed under propaai_role_v2) in sync.
  const setRole = (r: Role) => {
    setRoleS(r);
    try { localStorage.setItem("propaai_role_v2", r); } catch { /* ignore */ }
  };

  useEffect(() => {
    localStorage.setItem(
      KEY,
      JSON.stringify({ role, goal, lang, onboarded, geo })
    );
  }, [role, goal, lang, onboarded, geo]);

  const requestGeo = () =>
    new Promise<void>((resolve) => {
      if (!("geolocation" in navigator)) {
        setGeoStatus("denied");
        resolve();
        return;
      }
      setGeoStatus("requesting");
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGeo({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setGeoStatus("granted");
          resolve();
        },
        () => {
          setGeoStatus("denied");
          resolve();
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });

  return (
    <Ctx.Provider
      value={{
        role,
        setRole,
        goal,
        setGoal: setGoalS,
        lang,
        setLang: setLangS,
        onboarded,
        setOnboarded: setOnboardedS,
        geo,
        setGeo,
        geoStatus,
        requestGeo,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be used inside AppProvider");
  return v;
}
