// Agent country profile — used to tailor sources & feed to local portals.

export type CountryCode =
  | "AUTO" | "US" | "AE" | "GB" | "ES" | "PT" | "IT" | "DE" | "FR"
  | "GE" | "TR" | "RU" | "CY" | "TH" | "ME" | "RS" | "PL" | "NL" | "GR";

export const COUNTRIES: { code: CountryCode; label: string; flag: string }[] = [
  { code: "AUTO", label: "Auto · Авто", flag: "🌍" },
  { code: "US", label: "United States", flag: "🇺🇸" },
  { code: "AE", label: "UAE · Dubai", flag: "🇦🇪" },
  { code: "GB", label: "United Kingdom", flag: "🇬🇧" },
  { code: "ES", label: "España", flag: "🇪🇸" },
  { code: "PT", label: "Portugal", flag: "🇵🇹" },
  { code: "IT", label: "Italia", flag: "🇮🇹" },
  { code: "DE", label: "Deutschland", flag: "🇩🇪" },
  { code: "FR", label: "France", flag: "🇫🇷" },
  { code: "NL", label: "Nederland", flag: "🇳🇱" },
  { code: "GR", label: "Ελλάδα", flag: "🇬🇷" },
  { code: "CY", label: "Cyprus", flag: "🇨🇾" },
  { code: "TR", label: "Türkiye", flag: "🇹🇷" },
  { code: "GE", label: "საქართველო · Georgia", flag: "🇬🇪" },
  { code: "RU", label: "Россия", flag: "🇷🇺" },
  { code: "ME", label: "Crna Gora", flag: "🇲🇪" },
  { code: "RS", label: "Srbija", flag: "🇷🇸" },
  { code: "PL", label: "Polska", flag: "🇵🇱" },
  { code: "TH", label: "Thailand", flag: "🇹🇭" },
];

const KEY = "propaai_agent_country_v1";

export function getAgentCountry(): CountryCode {
  try {
    const v = localStorage.getItem(KEY) as CountryCode | null;
    if (v && COUNTRIES.some((c) => c.code === v)) return v;
  } catch { /* ignore */ }
  return "AUTO";
}

export function setAgentCountry(code: CountryCode) {
  try { localStorage.setItem(KEY, code); } catch { /* ignore */ }
}

// Best-effort auto detection when user chose AUTO.
export function detectCountryFromLocale(): CountryCode {
  try {
    const parts = (navigator.language || "en-US").split("-");
    const region = (parts[1] || parts[0] || "").toUpperCase();
    const map: Record<string, CountryCode> = {
      US: "US", CA: "US", AE: "AE", GB: "GB", UK: "GB",
      ES: "ES", PT: "PT", IT: "IT", DE: "DE", AT: "DE", CH: "DE",
      FR: "FR", NL: "NL", GR: "GR", CY: "CY", TR: "TR", GE: "GE",
      RU: "RU", ME: "ME", RS: "RS", PL: "PL", TH: "TH",
    };
    return map[region] ?? "US";
  } catch {
    return "US";
  }
}
