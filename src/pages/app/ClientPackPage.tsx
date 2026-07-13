import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Copy, Share2, Sparkles, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import heroExterior from "@/assets/hero-exterior.jpg";
import heroInterior from "@/assets/hero-interior.jpg";
import heroCity from "@/assets/hero-city.jpg";

type Verdict = "green" | "yellow" | "red";

interface AIResult {
  verdict: Verdict;
  score: number;
  confidence: number;
  headline_ru: string;
  headline_en: string;
  reasons: { ru: string; en: string }[];
  red_flags: { ru: string; en: string; severity?: string }[];
  next_steps: { ru: string; en: string }[];
  market?: { currency?: string; estimated_total?: number };
  price_proof?: {
    asking_price?: number | null;
    fair_price_min?: number;
    fair_price_max?: number;
    verdict_label_ru?: string;
    verdict_label_en?: string;
    market_assumption_ru?: string;
    market_assumption_en?: string;
  };
  negotiation?: {
    suggested_first_offer?: number;
    deal_zone_min?: number;
    deal_zone_max?: number;
    upper_limit?: number;
    currency?: string;
    arguments?: { ru: string; en: string; kind?: string }[];
  };
  manual_checks?: { ru: string; en: string }[];
  agent_script?: {
    headline_ru?: string;
    headline_en?: string;
    next_step_ru?: string;
    next_step_en?: string;
    client_message_ru?: string;
    client_message_en?: string;
    tones?: {
      neutral?: { ru?: string; en?: string };
      selling?: { ru?: string; en?: string };
      cautious?: { ru?: string; en?: string };
    };
  };
  geo_address?: string;
}

const verdictSoft: Record<Verdict, { ru: string; en: string; tone: string }> = {
  green: { ru: "Стоит рассмотреть", en: "Worth a closer look", tone: "bg-verdict-green/10 text-verdict-green border-verdict-green/30" },
  yellow: { ru: "Поторговаться", en: "Negotiate", tone: "bg-verdict-yellow/10 text-verdict-yellow border-verdict-yellow/30" },
  red: { ru: "Осторожно", en: "Proceed with caution", tone: "bg-verdict-red/10 text-verdict-red border-verdict-red/30" },
};

function formatNum(n: number): string {
  if (!isFinite(n)) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 1 : 2)}M`;
  if (n >= 1_000) return `${Math.round(n).toLocaleString("en-US")}`;
  return `${Math.round(n)}`;
}

export default function ClientPackPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const lang = i18n.language === "ru" ? "ru" : "en";
  const [result, setResult] = useState<AIResult | null>(null);
  const [tone, setTone] = useState<"neutral" | "selling" | "cautious">("neutral");

  useEffect(() => {
    const raw = id ? sessionStorage.getItem(`propaai_result_${id}`) : null;
    const fb = sessionStorage.getItem("propaai_last_result");
    const data = raw ?? fb;
    if (data) {
      setResult(JSON.parse(data));
      return;
    }
    // Hydrate from DB when id is a property UUID (agent Add Object flow).
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!id || !UUID_RE.test(id)) {
      navigate("/app/analyze", { replace: true });
      return;
    }
    (async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: prop } = await supabase
        .from("properties")
        .select("title,address,city,price,currency,area_sqm,bedrooms,bathrooms,description,verdict,score")
        .eq("id", id)
        .maybeSingle();
      if (!prop) {
        navigate("/app/analyze", { replace: true });
        return;
      }
      const { data: an } = await supabase
        .from("analyses")
        .select("verdict,score,confidence,raw,reasons,red_flags,next_steps")
        .eq("property_id", id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      const rawAI = (an?.raw as Partial<AIResult> | null) ?? null;
      setResult({
        verdict: (an?.verdict as Verdict) ?? (prop.verdict as Verdict) ?? "yellow",
        score: an?.score ?? prop.score ?? 70,
        confidence: an?.confidence ?? 60,
        headline_ru: rawAI?.headline_ru ?? prop.title,
        headline_en: rawAI?.headline_en ?? prop.title,
        reasons: (an?.reasons as AIResult["reasons"]) ?? rawAI?.reasons ?? [],
        red_flags: (an?.red_flags as AIResult["red_flags"]) ?? rawAI?.red_flags ?? [],
        next_steps: (an?.next_steps as AIResult["next_steps"]) ?? rawAI?.next_steps ?? [],
        market: { currency: prop.currency },
        price_proof: { asking_price: prop.price ?? undefined },
        geo_address: prop.address ?? undefined,
        ...(rawAI ?? {}),
      } as AIResult);
    })();
  }, [id, navigate]);

  const shareUrl = useMemo(() => `${window.location.origin}/share/${id ?? "preview"}`, [id]);

  if (!result) return null;
  const v = verdictSoft[result.verdict] ?? verdictSoft.yellow;
  const headline =
    (lang === "ru" ? result.agent_script?.headline_ru : result.agent_script?.headline_en) ??
    (lang === "ru" ? result.headline_ru : result.headline_en);
  const message =
    result.agent_script?.tones?.[tone]?.[lang] ??
    (lang === "ru" ? result.agent_script?.client_message_ru : result.agent_script?.client_message_en);
  const nextStep = lang === "ru" ? result.agent_script?.next_step_ru : result.agent_script?.next_step_en;
  const ccy = result.market?.currency ?? result.price_proof?.asking_price ? result.market?.currency ?? "" : "";
  const pp = result.price_proof;

  const onCopy = async () => {
    if (id) sessionStorage.setItem(`propaai_share_${id}`, JSON.stringify(result));
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success(lang === "ru" ? "Ссылка скопирована" : "Link copied");
    } catch {
      toast.info(shareUrl);
    }
  };

  const tones: { id: "neutral" | "selling" | "cautious"; ru: string; en: string }[] = [
    { id: "neutral", ru: "Нейтрально", en: "Neutral" },
    { id: "selling", ru: "Продающе", en: "Selling" },
    { id: "cautious", ru: "Осторожно", en: "Cautious" },
  ];

  return (
    <div className="min-h-screen pb-20 bg-background">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur">
        <div className="max-w-3xl mx-auto px-5 lg:px-8 h-14 flex items-center justify-between gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> {lang === "ru" ? "Назад" : "Back"}
          </button>
          <div className="flex items-center gap-2">
            <div className="hidden sm:inline-flex rounded-full bg-secondary p-1 text-[11px]">
              {tones.map((tn) => (
                <button
                  key={tn.id}
                  onClick={() => setTone(tn.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-full font-medium uppercase tracking-wider transition-all",
                    tone === tn.id ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {lang === "ru" ? tn.ru : tn.en}
                </button>
              ))}
            </div>
            <Button onClick={onCopy} variant="secondary" className="h-9 rounded-xl">
              <Copy className="h-3.5 w-3.5 mr-1.5" /> {lang === "ru" ? "Ссылка" : "Link"}
            </Button>
            <Button
              className="h-9 rounded-xl bg-foreground text-background hover:bg-foreground/90"
              onClick={() => {
                if (id) sessionStorage.setItem(`propaai_share_${id}`, JSON.stringify(result));
                window.open(shareUrl, "_blank");
              }}
            >
              <Share2 className="h-3.5 w-3.5 mr-1.5" /> {lang === "ru" ? "Открыть" : "Public view"}
            </Button>
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-5 lg:px-8 pt-8 pb-12">
        {/* Mobile tone */}
        <div className="sm:hidden -mt-2 mb-4 inline-flex rounded-full bg-secondary p-1 text-[11px]">
          {tones.map((tn) => (
            <button
              key={tn.id}
              onClick={() => setTone(tn.id)}
              className={cn(
                "px-3 py-1.5 rounded-full font-medium uppercase tracking-wider",
                tone === tn.id ? "bg-foreground text-background" : "text-muted-foreground"
              )}
            >
              {lang === "ru" ? tn.ru : tn.en}
            </button>
          ))}
        </div>

        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
          {lang === "ru" ? "Подготовлено вашим агентом · Propa" : "Prepared by your agent · Propa"}
        </div>

        {/* Hero */}
        <div className={cn("mt-3 rounded-3xl border ring-1 p-6 lg:p-8", v.tone, "border-transparent")}>
          <div className={cn("text-[11px] uppercase tracking-widest font-semibold inline-flex items-center gap-1.5")}>
            <Sparkles className="h-3 w-3" /> {lang === "ru" ? v.ru : v.en}
          </div>
          <h1 className="mt-2 text-3xl lg:text-4xl font-semibold tracking-tight leading-tight">{headline}</h1>
          {result.geo_address && (
            <div className="mt-2 text-sm text-muted-foreground">📍 {result.geo_address}</div>
          )}
          {message && (
            <p className="mt-5 text-[15px] leading-relaxed text-foreground/85 whitespace-pre-wrap">{message}</p>
          )}
        </div>

        {/* Gallery */}
        <section className="mt-8 grid grid-cols-3 gap-2">
          <div className="col-span-3 aspect-[16/9] rounded-2xl overflow-hidden bg-secondary">
            <img src={heroExterior} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-secondary">
            <img src={heroInterior} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-secondary">
            <img src={heroCity} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-secondary">
            <img src={heroExterior} alt="" className="h-full w-full object-cover" />
          </div>
        </section>

        {/* What we like */}
        {result.reasons?.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-semibold tracking-tight mb-3">
              {lang === "ru" ? "Что нравится" : "What we like"}
            </h2>
            <div className="space-y-2">
              {result.reasons.slice(0, 4).map((r, i) => (
                <div key={i} className="rounded-2xl border border-border bg-card p-4 flex gap-3">
                  <CheckCircle2 className="h-4 w-4 text-verdict-green mt-0.5 shrink-0" />
                  <div className="text-sm leading-snug">{lang === "ru" ? r.ru : r.en}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* What to verify */}
        {result.red_flags?.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xl font-semibold tracking-tight mb-3">
              {lang === "ru" ? "Что проверить" : "What to verify"}
            </h2>
            <div className="space-y-2">
              {result.red_flags.slice(0, 4).map((r, i) => (
                <div key={i} className="rounded-2xl border border-border bg-card p-4 flex gap-3">
                  <AlertTriangle className="h-4 w-4 text-verdict-yellow mt-0.5 shrink-0" />
                  <div className="text-sm leading-snug">{lang === "ru" ? r.ru : r.en}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Price story */}
        {(pp?.fair_price_min || pp?.asking_price) && (
          <section className="mt-8">
            <h2 className="text-xl font-semibold tracking-tight mb-3">
              {lang === "ru" ? "Цена и торг" : "Price & negotiation"}
            </h2>
            <div className="rounded-3xl border border-border bg-card p-5 lg:p-6">
              <div className="grid sm:grid-cols-3 gap-4">
                {typeof pp?.asking_price === "number" && (
                  <Stat label={lang === "ru" ? "Запрошено" : "Asking"} value={`${formatNum(pp.asking_price)} ${ccy}`} />
                )}
                {pp?.fair_price_min && pp?.fair_price_max && (
                  <Stat
                    label={lang === "ru" ? "Справедливо" : "Fair range"}
                    value={`${formatNum(pp.fair_price_min)}–${formatNum(pp.fair_price_max)} ${ccy}`}
                    accent
                  />
                )}
                {typeof result.negotiation?.suggested_first_offer === "number" && (
                  <Stat
                    label={lang === "ru" ? "Первое предложение" : "First offer"}
                    value={`${formatNum(result.negotiation.suggested_first_offer)} ${result.negotiation.currency ?? ccy}`}
                  />
                )}
              </div>
              {(pp?.market_assumption_ru || pp?.market_assumption_en) && (
                <div className="mt-4 text-[12px] text-muted-foreground leading-relaxed border-t border-border pt-3">
                  <span className="uppercase tracking-widest mr-2">{lang === "ru" ? "На основе" : "Based on"}:</span>
                  {lang === "ru" ? pp.market_assumption_ru ?? pp.market_assumption_en : pp.market_assumption_en ?? pp.market_assumption_ru}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Manual checks */}
        {result.manual_checks && result.manual_checks.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xl font-semibold tracking-tight mb-3">
              {lang === "ru" ? "Что спросить и проверить вживую" : "Ask the agent / verify on-site"}
            </h2>
            <ul className="grid sm:grid-cols-2 gap-2">
              {result.manual_checks.slice(0, 6).map((m, i) => (
                <li key={i} className="rounded-2xl border border-border bg-card p-4 flex gap-3">
                  <ShieldCheck className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="text-sm leading-snug">{lang === "ru" ? m.ru : m.en}</div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Next step */}
        {nextStep && (
          <section className="mt-10 rounded-3xl bg-gradient-charcoal text-background p-6 lg:p-8">
            <div className="text-[10px] uppercase tracking-widest opacity-70">
              {lang === "ru" ? "Что предлагаю дальше" : "Suggested next step"}
            </div>
            <div className="mt-2 text-xl lg:text-2xl font-semibold tracking-tight leading-snug">
              {nextStep}
            </div>
          </section>
        )}

        {/* Footer share */}
        <div className="mt-10 flex flex-wrap gap-2">
          <Button onClick={onCopy} variant="secondary" className="h-11 rounded-xl">
            <Copy className="h-4 w-4 mr-2" /> {lang === "ru" ? "Скопировать ссылку" : "Copy share link"}
          </Button>
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={cn("rounded-2xl border p-4 bg-background/40", accent ? "border-accent/30" : "border-border")}>
      <div className={cn("text-xl font-semibold tabular-nums leading-none", accent && "text-accent")}>{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1.5">{label}</div>
    </div>
  );
}
