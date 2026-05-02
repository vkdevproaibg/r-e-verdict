import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Motive = "expansion" | "first_home" | "investment" | "downsize";
export type Fear =
  | "hidden_defects"
  | "overpay"
  | "bad_neighbors"
  | "legal_surprises"
  | "liquidity"
  | "missed_opportunity";
export type Funding = "cash" | "mortgage" | "sell_first";
export type Timeline = "sprint" | "marathon" | "scout";
export type FormatPick = "house" | "townhouse" | "condo" | "land";
export type AgentRole = "negotiator" | "guide" | "none";

export interface BuyerProfile {
  /** Address typed on Home that triggered onboarding */
  address?: string;
  motive?: Motive;
  /** 0 = perfect location / dated reno, 100 = perfect reno / worse location */
  compromise?: number;
  fear?: Fear;
  /** Hard cap budget in USD */
  budget?: number;
  budgetSkipped?: boolean;
  funding?: Funding;
  timeline?: Timeline;
  formats?: FormatPick[];
  agentRole?: AgentRole;
  completedAt?: number;
  /** Lightweight psychotype derived after screen 4 */
  psychotype?: string;
}

interface Ctx {
  profile: BuyerProfile;
  update: (patch: Partial<BuyerProfile>) => void;
  reset: () => void;
  isComplete: boolean;
}

const KEY = "propaai_buyer_profile_v1";
const Profile = createContext<Ctx | null>(null);

function read(): BuyerProfile {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function BuyerProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<BuyerProfile>(read);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(profile));
    } catch { /* ignore */ }
  }, [profile]);

  const update = (patch: Partial<BuyerProfile>) =>
    setProfile((p) => ({ ...p, ...patch }));

  const reset = () => setProfile({});

  return (
    <Profile.Provider value={{ profile, update, reset, isComplete: !!profile.completedAt }}>
      {children}
    </Profile.Provider>
  );
}

export function useBuyerProfile() {
  const v = useContext(Profile);
  if (!v) throw new Error("useBuyerProfile must be used inside BuyerProfileProvider");
  return v;
}

/** Lightweight psychotype derived from fear + compromise lean. */
export function derivePsychotype(p: BuyerProfile): string {
  const fear = p.fear;
  const lean =
    p.compromise === undefined
      ? "balanced"
      : p.compromise < 40
      ? "location-first"
      : p.compromise > 60
      ? "comfort-first"
      : "balanced";

  if (fear === "overpay") return `Осторожный рационалист · ${lean}`;
  if (fear === "hidden_defects") return `Технический скептик · ${lean}`;
  if (fear === "bad_neighbors") return `Контекст-ориентированный · ${lean}`;
  if (fear === "legal_surprises") return `Правовой стратег · ${lean}`;
  if (fear === "liquidity") return `Инвестор-прагматик · ${lean}`;
  if (fear === "missed_opportunity") return `Активный искатель · ${lean}`;
  return `Сбалансированный покупатель · ${lean}`;
}
