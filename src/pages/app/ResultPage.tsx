import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Save,
  Share2,
  GitCompare,
  FileDown,
  MessageCircle,
  UserPlus,
  Phone,
  Copy,
  TrendingUp,
  TrendingDown,
  Minus,
  Home,
  Building2,
  ShieldCheck,
  ExternalLink,
  ThumbsUp,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useRole } from "@/state/RoleContext";
import { useSaveAnalysis, type Verdict } from "@/hooks/useCloudData";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { exportAnalysisPdf } from "@/lib/exportPdf";
import heroExterior from "@/assets/hero-exterior.jpg";
import heroInterior from "@/assets/hero-interior.jpg";
import heroCity from "@/assets/hero-city.jpg";

interface MarketBlock {
  currency?: string;
  unit?: "sqm" | "sqft";
  avg_price_per_unit?: number;
  low_price_per_unit?: number;
  high_price_per_unit?: number;
  estimated_total?: number;
  trend_pct_yoy?: number;
  trend_direction?: "up" | "down" | "flat";
  trend_comment_ru?: string;
  trend_comment_en?: string;
  rent_per_month?: number | null;
  gross_yield_pct?: number | null;
}

interface ScoreSet {
  price?: number;
  location?: number;
  growth?: number;
  liquidity?: number;
  environment?: number;
  risks?: number;
  transport?: number;
  comfort?: number;
  listing_trust?: number;
}

interface SourceLink {
  title?: string;
  url?: string;
  kind?: string;
}

interface PriceProof {
  asking_price?: number | null;
  fair_price_min?: number;
  fair_price_max?: number;
  price_difference_percent?: number | null;
  verdict_label_ru?: string;
  verdict_label_en?: string;
  market_assumption_ru?: string;
  market_assumption_en?: string;
}

interface CompSignal {
  area_ru?: string;
  area_en?: string;
  price_per_unit?: number;
  unit?: "sqm" | "sqft";
  currency?: string;
  similarity_ru?: string;
  similarity_en?: string;
  why_ru?: string;
  why_en?: string;
}

interface Negotiation {
  suggested_first_offer?: number;
  deal_zone_min?: number;
  deal_zone_max?: number;
  upper_limit?: number;
  currency?: string;
  arguments?: { ru: string; en: string; kind?: string }[];
}

interface AIResult {
  verdict: Verdict;
  score: number;
  confidence: number;
  confidence_band?: "low" | "medium" | "high";
  headline_ru: string;
  headline_en: string;
  reasons: { ru: string; en: string; kind?: string }[];
  red_flags: { ru: string; en: string; severity?: "low" | "medium" | "high" }[];
  next_steps: { ru: string; en: string }[];
  good?: { ru: string; en: string }[];
  watch?: { ru: string; en: string }[];
  sources?: SourceLink[];
  scores?: ScoreSet;
  price_deviation_pct?: number | null;
  input_kind?: string;
  query?: string;
  error?: string;
  lat?: number;
  lng?: number;
  geo_address?: string;
  purpose?: "buy" | "rent";
  market?: MarketBlock;
  display_currency?: string;
  local_reference?: {
    currency?: string;
    fx_rate_to_display?: number;
    fx_date?: string;
    asking_price_local?: number | null;
    fair_price_min_local?: number;
    fair_price_max_local?: number;
    note_ru?: string;
    note_en?: string;
  };
  price_proof?: PriceProof;
  comparable_signals?: CompSignal[];
  negotiation?: Negotiation;
  manual_checks?: { ru: string; en: string }[];
  agent_script?: {
    client_message_ru?: string;
    client_message_en?: string;
    headline_ru?: string;
    headline_en?: string;
    next_step_ru?: string;
    next_step_en?: string;
    tones?: {
      neutral?: { ru?: string; en?: string };
      selling?: { ru?: string; en?: string };
      cautious?: { ru?: string; en?: string };
    };
  };
}

const verdictTokens: Record<Verdict, { bg: string; text: string; ring: string; dot: string }> = {
  green: { bg: "bg-verdict-green/10", text: "text-verdict-green", ring: "ring-verdict-green/30", dot: "bg-verdict-green" },
  yellow: { bg: "bg-verdict-yellow/10", text: "text-verdict-yellow", ring: "ring-verdict-yellow/30", dot: "bg-verdict-yellow" },
  red: { bg: "bg-verdict-red/10", text: "text-verdict-red", ring: "ring-verdict-red/30", dot: "bg-verdict-red" },
};

const galleryImages = [heroExterior, heroInterior, heroCity];

export default function ResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { role } = useRole();
  const [result, setResult] = useState<AIResult | null>(null);
  const [salesOpen, setSalesOpen] = useState(false);
  const [tone, setTone] = useState<"neutral" | "selling" | "cautious">("neutral");
  const saveAnalysis = useSaveAnalysis();
  const lang = i18n.language === "ru" ? "ru" : "en";

  useEffect(() => {
    const raw = id ? sessionStorage.getItem(`propaai_result_${id}`) : null;
    const fallback = sessionStorage.getItem("propaai_last_result");
    const data = raw ?? fallback;
    if (!data) {
      navigate("/app/analyze", { replace: true });
      return;
    }
    setResult(JSON.parse(data));
  }, [id, navigate]);

  if (!result) return null;

  const v = verdictTokens[result.verdict] ?? verdictTokens.yellow;
  const headline = lang === "ru" ? result.headline_ru : result.headline_en;
  const verdictLabel = t(`result.verdict.${result.verdict}`);

  const onSave = async () => {
    await saveAnalysis.mutateAsync({
      input_kind: result.input_kind ?? "text",
      input_payload: { query: result.query ?? "" },
      verdict: result.verdict,
      score: result.score,
      confidence: result.confidence,
      reasons: result.reasons as never,
      red_flags: result.red_flags as never,
      next_steps: result.next_steps as never,
      raw: result as never,
    });
    toast.success(lang === "ru" ? "Сохранено в историю" : "Saved to history");
  };

  const onShare = async () => {
    const url = `${window.location.origin}/share/${id}`;
    if (id) sessionStorage.setItem(`propaai_share_${id}`, JSON.stringify(result));
    try {
      await navigator.clipboard.writeText(url);
      toast.success(lang === "ru" ? "Ссылка скопирована" : "Link copied");
    } catch {
      toast.info(url);
    }
  };

  const pitchText =
    lang === "ru"
      ? `${result.headline_ru}. Скор ${result.score}/100, уверенность ${result.confidence}%. ${result.reasons[0]?.ru ?? ""}`
      : `${result.headline_en}. Score ${result.score}/100, confidence ${result.confidence}%. ${result.reasons[0]?.en ?? ""}`;

  return (
    <div className="pb-16">
      <div className="px-5 lg:px-8 pt-5 max-w-5xl mx-auto">
        <button
          onClick={() => navigate("/app/analyze")}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> {t("nav.analyze")}
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-5 lg:px-8 mt-4 grid lg:grid-cols-12 gap-6">
        {/* Hero verdict */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-12"
        >
          <div className={cn("rounded-3xl border ring-1 p-6 lg:p-8", v.bg, v.ring, "border-transparent")}>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
              <Sparkles className="h-3 w-3" /> AI Verdict
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <div className={cn("text-[11px] uppercase tracking-widest font-semibold inline-flex items-center gap-1.5", v.text)}>
                <span className={cn("h-1.5 w-1.5 rounded-full", v.dot)} />
                {verdictLabel}
              </div>
              {result.purpose && (
                <span className="inline-flex items-center gap-1 rounded-full bg-background/70 border border-border px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                  {result.purpose === "rent" ? <Building2 className="h-3 w-3" /> : <Home className="h-3 w-3" />}
                  {t(`analyze.purpose.${result.purpose}`)}
                </span>
              )}
              {result.confidence_band && (
                <span className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-widest",
                  result.confidence_band === "high"
                    ? "bg-verdict-green/10 text-verdict-green border-verdict-green/30"
                    : result.confidence_band === "medium"
                    ? "bg-verdict-yellow/10 text-verdict-yellow border-verdict-yellow/30"
                    : "bg-secondary text-muted-foreground border-border"
                )}>
                  <ShieldCheck className="h-3 w-3" />
                  {t(`result.confidenceBand.${result.confidence_band}`)}
                </span>
              )}
            </div>
            <h1 className="mt-2 text-3xl lg:text-4xl font-semibold tracking-tight leading-tight">
              {headline}
            </h1>

            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Metric label={t("result.score")} value={`${result.score}`} accent />
              <Metric label={t("result.confidence")} value={`${result.confidence}%`} />
              {result.market?.avg_price_per_unit ? (
                <Metric
                  label={t("result.marketBenchmark")}
                  value={`${formatNum(result.market.avg_price_per_unit)} ${result.market.currency ?? ""}`}
                  sub={`/ ${result.market.unit === "sqft" ? "sqft" : "м²"}`}
                />
              ) : (
                <Metric label={t("result.priceVsMarket")} value="—" sub={lang === "ru" ? "нет данных" : "no data"} />
              )}
              {typeof result.price_deviation_pct === "number" ? (
                <Metric
                  label={t("result.priceVsMarket")}
                  value={`${result.price_deviation_pct > 0 ? "+" : ""}${result.price_deviation_pct.toFixed(0)}%`}
                  sub={
                    Math.abs(result.price_deviation_pct) < 5
                      ? t("result.priceDeviation.fair")
                      : result.price_deviation_pct > 0
                      ? t("result.priceDeviation.above")
                      : t("result.priceDeviation.below")
                  }
                  accent
                />
              ) : typeof result.market?.gross_yield_pct === "number" ? (
                <Metric
                  label={lang === "ru" ? "Доходность" : "Yield"}
                  value={`${result.market.gross_yield_pct.toFixed(1)}%`}
                  sub={lang === "ru" ? "годовая" : "annual"}
                />
              ) : (
                <Metric label={t("result.liquidity")} value="—" sub={lang === "ru" ? "оценка" : "estimate"} />
              )}
            </div>
          </div>
        </motion.div>

        {/* Agent: Client-ready briefing — sits above buyer sections */}
        {role === "agent" && (
          <Section className="lg:col-span-12" title={lang === "ru" ? "Готовый разбор для клиента" : "Client-ready briefing"}>
            <ClientReadyCard result={result} lang={lang} tone={tone} setTone={setTone} navigate={navigate} id={id} />
          </Section>
        )}

        {/* Market price benchmark */}
        {result.market?.avg_price_per_unit && (
          <Section className="lg:col-span-12" title={t("result.marketSection")}>
            <MarketCard market={result.market} lang={lang} t={t} />
          </Section>
        )}

        {/* Price proof — asking vs fair range */}
        {result.price_proof && (result.price_proof.fair_price_min || result.price_proof.asking_price) && (
          <Section className="lg:col-span-12" title={t("result.priceProof.title")}>
            <PriceProofCard
              pp={result.price_proof}
              lang={lang}
              t={t}
              ccy={result.market?.currency ?? result.display_currency ?? "USD"}
              local={result.local_reference}
            />
          </Section>
        )}

        {/* Comparable signals */}
        {result.comparable_signals && result.comparable_signals.length > 0 && (
          <Section className="lg:col-span-12" title={t("result.comps.title")}>
            <div className="text-xs text-muted-foreground mb-3">{t("result.comps.sub")}</div>
            <div className="grid md:grid-cols-3 gap-3">
              {result.comparable_signals.slice(0, 3).map((c, i) => (
                <div key={i} className="rounded-2xl border border-border bg-card p-5">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    {lang === "ru" ? c.similarity_ru : c.similarity_en}
                  </div>
                  <div className="mt-1.5 text-base font-semibold leading-snug">
                    {lang === "ru" ? c.area_ru : c.area_en}
                  </div>
                  {typeof c.price_per_unit === "number" && (
                    <div className="mt-3 text-xl font-semibold tabular-nums">
                      {formatNum(c.price_per_unit)}{" "}
                      <span className="text-xs font-normal text-muted-foreground">
                        {c.currency ?? ""}/{c.unit === "sqft" ? "sqft" : "м²"}
                      </span>
                    </div>
                  )}
                  <p className="mt-3 text-xs text-foreground/75 leading-relaxed">
                    {lang === "ru" ? c.why_ru : c.why_en}
                  </p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Negotiation position */}
        {result.negotiation && typeof result.negotiation.suggested_first_offer === "number" && (
          <Section className="lg:col-span-12" title={t("result.negotiation.title")}>
            <NegotiationCard n={result.negotiation} lang={lang} t={t} />
          </Section>
        )}



        {/* Detailed score bars */}
        {result.scores && (
          <Section className="lg:col-span-12" title={t("result.scoresSection")}>
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="text-xs text-muted-foreground mb-4">{t("result.scoresHint")}</div>
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
                {scoreOrder(result.purpose ?? "buy").map((key) => {
                  const v = result.scores?.[key];
                  if (typeof v !== "number") return null;
                  return <ScoreBar key={key} label={t(`result.scoreLabels.${key}`)} value={v} />;
                })}
              </div>
            </div>
          </Section>
        )}

        {/* Good / Watch — trust pair */}
        {(result.good?.length || result.watch?.length) && (
          <Section className="lg:col-span-12" title={lang === "ru" ? "Сильные и слабые стороны" : "Strengths & concerns"}>
            <div className="grid md:grid-cols-2 gap-3">
              {result.good && result.good.length > 0 && (
                <div className="rounded-2xl border border-verdict-green/30 bg-verdict-green/5 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <ThumbsUp className="h-4 w-4 text-verdict-green" />
                    <div className="text-sm font-semibold">{t("result.good")}</div>
                  </div>
                  <ul className="space-y-2">
                    {result.good.map((g, i) => (
                      <li key={i} className="text-sm leading-snug flex gap-2">
                        <span className="text-verdict-green mt-0.5">+</span>
                        <span>{lang === "ru" ? g.ru : g.en}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {result.watch && result.watch.length > 0 && (
                <div className="rounded-2xl border border-verdict-yellow/30 bg-verdict-yellow/5 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Eye className="h-4 w-4 text-verdict-yellow" />
                    <div className="text-sm font-semibold">{t("result.watch")}</div>
                  </div>
                  <ul className="space-y-2">
                    {result.watch.map((w, i) => (
                      <li key={i} className="text-sm leading-snug flex gap-2">
                        <span className="text-verdict-yellow mt-0.5">!</span>
                        <span>{lang === "ru" ? w.ru : w.en}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Sources */}
        {result.sources && result.sources.length > 0 && (
          <Section className="lg:col-span-12" title={t("result.sources")}>
            <div className="text-xs text-muted-foreground mb-3">{t("result.sourcesHint")}</div>
            <div className="grid sm:grid-cols-2 gap-2">
              {result.sources.slice(0, 6).map((s, i) => (
                <a
                  key={i}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl border border-border bg-card p-3 flex items-start gap-3 hover:border-accent/40 transition-colors group"
                >
                  <div className="h-8 w-8 rounded-lg bg-secondary grid place-items-center shrink-0 group-hover:bg-accent/10">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{s.title || s.url}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{s.url}</div>
                  </div>
                </a>
              ))}
            </div>
          </Section>
        )}

        {typeof result.lat === "number" && typeof result.lng === "number" && (
          <Section className="lg:col-span-12" title={lang === "ru" ? "Локация" : "Location"}>
            {result.geo_address && (
              <div className="mb-3 text-sm text-muted-foreground inline-flex items-start gap-1.5">
                <span className="mt-0.5">📍</span>
                <span className="leading-snug">{result.geo_address}</span>
              </div>
            )}
            <div className="grid md:grid-cols-2 gap-3">
              <div className="rounded-2xl overflow-hidden border border-border bg-secondary aspect-[16/10]">
                <iframe
                  title="Map"
                  src={`https://www.google.com/maps?q=${result.lat},${result.lng}&z=17&output=embed`}
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div className="rounded-2xl overflow-hidden border border-border bg-secondary aspect-[16/10] relative">
                <iframe
                  title="3D Satellite view"
                  src={`https://www.google.com/maps?q=${result.lat},${result.lng}&z=18&t=k&output=embed`}
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-background/90 backdrop-blur text-[10px] uppercase tracking-widest font-semibold">
                  3D · Satellite
                </div>
              </div>
            </div>
            <div className="mt-2 text-right">
              <a
                href={`https://www.google.com/maps/@?api=1&map_action=map&center=${result.lat},${result.lng}&zoom=18&basemap=satellite`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
              >
                {lang === "ru" ? "Открыть в Google Maps →" : "Open in Google Maps →"}
              </a>
            </div>
          </Section>
        )}

        {/* Reasons */}
        {result.reasons?.length > 0 && (
          <Section className="lg:col-span-7" title={t("result.reasons")}>
            <div className="space-y-2">
              {result.reasons.map((r, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className="rounded-2xl bg-card border border-border p-4 flex gap-3"
                >
                  <CheckCircle2 className="h-4 w-4 text-verdict-green mt-0.5 shrink-0" />
                  <div className="text-sm leading-snug">{lang === "ru" ? r.ru : r.en}</div>
                </motion.div>
              ))}
            </div>
          </Section>
        )}

        {/* Media gallery */}
        <Section className="lg:col-span-5" title={t("result.media")}>
          <div className="grid grid-cols-3 gap-2">
            {galleryImages.map((img, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-2xl overflow-hidden bg-secondary",
                  i === 0 && "col-span-3 aspect-[16/10]",
                  i > 0 && "aspect-square"
                )}
              >
                <img
                  src={img}
                  alt={`Property ${i + 1}`}
                  loading="lazy"
                  width={800}
                  height={600}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        </Section>

        {/* Red flags */}
        {result.red_flags?.length > 0 && (
          <Section className="lg:col-span-12" title={t("result.redFlags")}>
            <div className="grid sm:grid-cols-2 gap-2">
              {result.red_flags.map((r, i) => (
                <div key={i} className="rounded-2xl bg-card border border-border p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle
                      className={cn(
                        "h-4 w-4 mt-0.5 shrink-0",
                        r.severity === "high"
                          ? "text-verdict-red"
                          : r.severity === "medium"
                          ? "text-verdict-yellow"
                          : "text-muted-foreground"
                      )}
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium leading-snug">{lang === "ru" ? r.ru : r.en}</div>
                      <div className="mt-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                        → {t("result.redFlagsHint")}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Manual checks */}
        {result.manual_checks && result.manual_checks.length > 0 && (
          <Section className="lg:col-span-12" title={t("result.manualChecks.title")}>
            <div className="text-xs text-muted-foreground mb-3">{t("result.manualChecks.sub")}</div>
            <ul className="grid sm:grid-cols-2 gap-2">
              {result.manual_checks.map((m, i) => (
                <li key={i} className="rounded-2xl bg-card border border-border p-4 flex gap-3">
                  <ShieldCheck className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="text-sm leading-snug">{lang === "ru" ? m.ru : m.en}</div>
                </li>
              ))}
            </ul>
          </Section>
        )}


        {/* Next steps */}
        {result.next_steps?.length > 0 && (
          <Section className="lg:col-span-12" title={t("result.nextSteps")}>
            <ol className="grid sm:grid-cols-2 gap-2">
              {result.next_steps.map((s, i) => (
                <li key={i} className="rounded-2xl bg-card border border-border p-4 flex gap-3">
                  <div className="h-6 w-6 rounded-full bg-foreground text-background text-xs font-semibold grid place-items-center shrink-0">
                    {i + 1}
                  </div>
                  <div className="text-sm leading-snug">{lang === "ru" ? s.ru : s.en}</div>
                </li>
              ))}
            </ol>
          </Section>
        )}

        {/* Actions */}
        <Section className="lg:col-span-12" title={lang === "ru" ? "Действия" : "Actions"}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Button onClick={onSave} variant="secondary" className="h-12 rounded-xl">
              <Save className="h-4 w-4 mr-2" /> {t("result.actions.save")}
            </Button>
            <Button asChild variant="secondary" className="h-12 rounded-xl">
              <Link to="/app/saved">
                <GitCompare className="h-4 w-4 mr-2" /> {t("result.actions.compare")}
              </Link>
            </Button>
            <Button onClick={onShare} variant="secondary" className="h-12 rounded-xl">
              <Share2 className="h-4 w-4 mr-2" /> {t("result.actions.share")}
            </Button>
            <Button
              variant="secondary"
              className="h-12 rounded-xl"
              onClick={async () => {
                const id = toast.loading(lang === "ru" ? "Готовим PDF…" : "Building PDF…");
                try {
                  await exportAnalysisPdf(result as never, lang);
                  toast.success(lang === "ru" ? "PDF готов" : "PDF ready", { id });
                } catch (e) {
                  console.error(e);
                  toast.error(lang === "ru" ? "Не удалось создать PDF" : "Failed to generate PDF", { id });
                }
              }}
            >
              <FileDown className="h-4 w-4 mr-2" /> {t("result.actions.export")}
            </Button>
          </div>

          {role === "buyer" ? (
            <Button
              variant="outline"
              className="w-full h-12 rounded-xl mt-3"
              onClick={() => toast.info(lang === "ru" ? "Скоро" : "Soon")}
            >
              <Phone className="h-4 w-4 mr-2" /> {t("result.actions.talk")}
            </Button>
          ) : (
            <>
              <div className="mt-3 grid sm:grid-cols-2 gap-2">
                <Button
                  className="h-12 rounded-xl bg-gradient-bronze text-accent-foreground hover:opacity-90 shadow-bronze justify-start font-semibold"
                  onClick={() => toast.info(lang === "ru" ? "Откройте «Клиенты»" : "Open Clients tab")}
                >
                  <UserPlus className="h-4 w-4 mr-2" /> {t("result.actions.assign")}
                </Button>
                <Button
                  variant="secondary"
                  className="h-12 rounded-xl justify-start"
                  onClick={() => setSalesOpen(true)}
                >
                  <MessageCircle className="h-4 w-4 mr-2" /> {t("result.agentTools")}
                </Button>
              </div>
              <Button
                className="w-full h-12 rounded-xl mt-2 justify-start bg-foreground text-background hover:bg-foreground/90"
                onClick={() => {
                  if (id) sessionStorage.setItem(`propaai_result_${id}`, JSON.stringify(result));
                  navigate(`/app/pack/${id ?? "preview"}`);
                }}
              >
                <FileDown className="h-4 w-4 mr-2" /> {t("result.agent.clientPack")}
              </Button>
            </>
          )}
        </Section>
      </div>

      {/* Sales tools sheet (agent) */}
      <Sheet open={salesOpen} onOpenChange={setSalesOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{t("result.agentTools")}</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-3 max-w-2xl mx-auto">
            {result.agent_script?.client_message_ru && (
              <ToolCard
                title={t("result.agent.clientMessage")}
                text={(lang === "ru" ? result.agent_script.client_message_ru : result.agent_script.client_message_en) || ""}
              />
            )}
            <ToolCard title={lang === "ru" ? "Питч за 30 секунд" : "30-second pitch"} text={pitchText} />
            <ToolCard
              title={t("result.agent.talkingPoints")}
              text={(result.negotiation?.arguments ?? []).map((a) => `• ${lang === "ru" ? a.ru : a.en}`).join("\n") ||
                (result.red_flags ?? []).map((r) => `• ${lang === "ru" ? r.ru : r.en}`).join("\n") ||
                (lang === "ru" ? "Сильных рычагов нет — объект ликвиден." : "No strong levers — property is liquid.")}
            />
            <ToolCard
              title={lang === "ru" ? "Ответы на возражения" : "Objection killer"}
              text={(result.reasons ?? []).map((r) => `Q: "Why?"\nA: ${lang === "ru" ? r.ru : r.en}`).join("\n\n") || "—"}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Section({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <h2 className="text-lg font-semibold tracking-tight mb-3">{title}</h2>
      {children}
    </div>
  );
}

function Metric({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className={cn("rounded-2xl border p-3 bg-card/60", accent ? "border-accent/30" : "border-border")}>
      <div className={cn("text-2xl font-semibold leading-none tabular-nums", accent && "text-accent")}>{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1.5">{label}</div>
      {sub && <div className="text-[10px] text-muted-foreground/70">{sub}</div>}
    </div>
  );
}

function ToolCard({ title, text }: { title: string; text: string }) {
  const copy = () => {
    navigator.clipboard.writeText(text);
    toast.success("Copied");
  };
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-semibold">{title}</div>
        <button onClick={copy} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-secondary">
          <Copy className="h-3.5 w-3.5" />
        </button>
      </div>
      <pre className="text-xs text-foreground/80 whitespace-pre-wrap font-sans leading-relaxed">{text}</pre>
    </div>
  );
}

function formatNum(n: number): string {
  if (!isFinite(n)) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 1 : 2)}M`;
  if (n >= 1_000) return `${Math.round(n).toLocaleString("en-US")}`;
  return `${Math.round(n)}`;
}

function scoreOrder(purpose: "buy" | "rent"): (keyof ScoreSet)[] {
  return purpose === "rent"
    ? ["price", "location", "transport", "comfort", "listing_trust", "risks"]
    : ["price", "location", "growth", "liquidity", "environment", "risks"];
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  const tone =
    v >= 75 ? "bg-verdict-green" : v >= 45 ? "bg-verdict-yellow" : "bg-verdict-red";
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <div className="text-sm text-foreground/85 leading-snug">{label}</div>
        <div className="text-sm font-semibold tabular-nums">{v}</div>
      </div>
      <div className="mt-1.5 h-2 rounded-full bg-secondary overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${v}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className={cn("h-full rounded-full", tone)}
        />
      </div>
    </div>
  );
}

function MarketCard({
  market,
  lang,
  t,
}: {
  market: MarketBlock;
  lang: "ru" | "en";
  t: (k: string) => string;
}) {
  const dir = market.trend_direction ?? (typeof market.trend_pct_yoy === "number"
    ? market.trend_pct_yoy > 0.5 ? "up" : market.trend_pct_yoy < -0.5 ? "down" : "flat"
    : "flat");
  const TrendIcon = dir === "up" ? TrendingUp : dir === "down" ? TrendingDown : Minus;
  const trendColor =
    dir === "up" ? "text-verdict-green" : dir === "down" ? "text-verdict-red" : "text-muted-foreground";
  const trendBg =
    dir === "up" ? "bg-verdict-green/10" : dir === "down" ? "bg-verdict-red/10" : "bg-secondary";
  const unit = market.unit === "sqft" ? "sqft" : "м²";
  const ccy = market.currency ?? "";
  const trendComment = lang === "ru" ? market.trend_comment_ru : market.trend_comment_en;
  const yoy = typeof market.trend_pct_yoy === "number" ? market.trend_pct_yoy : null;

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            {lang === "ru" ? `Средняя цена за ${unit}` : `Average price per ${unit}`}
          </div>
          <div className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">
            {formatNum(market.avg_price_per_unit ?? 0)} <span className="text-base font-normal text-muted-foreground">{ccy}/{unit}</span>
          </div>
          {(market.low_price_per_unit && market.high_price_per_unit) && (
            <div className="mt-1 text-xs text-muted-foreground tabular-nums">
              {lang === "ru" ? "Диапазон: " : "Range: "}
              {formatNum(market.low_price_per_unit)}–{formatNum(market.high_price_per_unit)} {ccy}/{unit}
            </div>
          )}
        </div>
        <div className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold", trendBg, trendColor)}>
          <TrendIcon className="h-4 w-4" />
          {yoy !== null ? `${yoy > 0 ? "+" : ""}${yoy.toFixed(1)}% YoY` : t("result.trendFlat")}
        </div>
      </div>

      {trendComment && (
        <p className="mt-3 text-sm text-foreground/80 leading-relaxed">{trendComment}</p>
      )}

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
        {market.estimated_total ? (
          <Metric
            label={lang === "ru" ? "Ориентир по объекту" : "Estimated fair price"}
            value={`${formatNum(market.estimated_total)} ${ccy}`}
            accent
          />
        ) : null}
        {typeof market.rent_per_month === "number" ? (
          <Metric
            label={lang === "ru" ? "Аренда / мес" : "Rent / mo"}
            value={`${formatNum(market.rent_per_month)} ${ccy}`}
          />
        ) : null}
        {typeof market.gross_yield_pct === "number" ? (
          <Metric
            label={lang === "ru" ? "Валовая доходность" : "Gross yield"}
            value={`${market.gross_yield_pct.toFixed(1)}%`}
          />
        ) : null}
      </div>
    </div>
  );
}

function PriceProofCard({
  pp,
  lang,
  t,
}: {
  pp: PriceProof;
  lang: "ru" | "en";
  t: (k: string) => string;
}) {
  const labelKey = pp.verdict_label_en ?? "No price";
  const labelText = t(`result.priceProof.labels.${labelKey}`);
  const tone =
    labelKey === "Fair"
      ? "bg-verdict-green/10 text-verdict-green border-verdict-green/30"
      : labelKey === "Overpriced"
      ? "bg-verdict-red/10 text-verdict-red border-verdict-red/30"
      : labelKey === "Attractive"
      ? "bg-accent/15 text-accent border-accent/30"
      : "bg-secondary text-muted-foreground border-border";
  const diff = pp.price_difference_percent;
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            {t("result.priceProof.asking")}
          </div>
          <div className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">
            {typeof pp.asking_price === "number" ? formatNum(pp.asking_price) : "—"}
          </div>
        </div>
        <span className={cn("inline-flex items-center rounded-full border px-3 py-1 text-xs uppercase tracking-widest font-semibold", tone)}>
          {labelText}
        </span>
      </div>
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Metric
          label={t("result.priceProof.fairRange")}
          value={
            pp.fair_price_min && pp.fair_price_max
              ? `${formatNum(pp.fair_price_min)}–${formatNum(pp.fair_price_max)}`
              : "—"
          }
          accent
        />
        {typeof diff === "number" && (
          <Metric
            label={t("result.priceProof.diff")}
            value={`${diff > 0 ? "+" : ""}${diff.toFixed(0)}%`}
            sub={
              Math.abs(diff) < 5
                ? t("result.priceDeviation.fair")
                : diff > 0
                ? t("result.priceDeviation.above")
                : t("result.priceDeviation.below")
            }
          />
        )}
      </div>
      {(pp.market_assumption_ru || pp.market_assumption_en) && (
        <div className="mt-4 text-[11px] text-muted-foreground leading-relaxed border-t border-border pt-3">
          <span className="uppercase tracking-widest mr-2">{lang === "ru" ? "На основе" : "Based on"}:</span>
          {lang === "ru" ? pp.market_assumption_ru ?? pp.market_assumption_en : pp.market_assumption_en ?? pp.market_assumption_ru}
        </div>
      )}
    </div>
  );
}

function NegotiationCard({
  n,
  lang,
  t,
}: {
  n: Negotiation;
  lang: "ru" | "en";
  t: (k: string) => string;
}) {
  const ccy = n.currency ?? "";
  const fo = n.suggested_first_offer ?? 0;
  const dmin = n.deal_zone_min ?? fo;
  const dmax = n.deal_zone_max ?? fo;
  const up = n.upper_limit ?? dmax;
  const span = Math.max(1, up - fo);
  const dminPct = ((dmin - fo) / span) * 100;
  const dmaxPct = ((dmax - fo) / span) * 100;
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Metric label={t("result.negotiation.firstOffer")} value={`${formatNum(fo)} ${ccy}`} accent />
        <Metric label={t("result.negotiation.dealZone")} value={`${formatNum(dmin)}–${formatNum(dmax)}`} sub={ccy} />
        <Metric label={t("result.negotiation.upper")} value={`${formatNum(up)} ${ccy}`} />
      </div>

      <div className="mt-5">
        <div className="relative h-2 rounded-full bg-secondary overflow-hidden">
          <div
            className="absolute top-0 bottom-0 bg-verdict-green/40"
            style={{ left: `${Math.max(0, dminPct)}%`, width: `${Math.max(2, dmaxPct - dminPct)}%` }}
          />
          <div className="absolute top-0 bottom-0 w-0.5 bg-accent" style={{ left: "0%" }} />
          <div className="absolute top-0 bottom-0 w-0.5 bg-verdict-red" style={{ left: "100%" }} />
        </div>
        <div className="mt-1.5 flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
          <span>{t("result.negotiation.firstOffer")}</span>
          <span>{t("result.negotiation.upper")}</span>
        </div>
      </div>

      {n.arguments && n.arguments.length > 0 && (
        <div className="mt-5">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
            {t("result.negotiation.arguments")}
          </div>
          <ul className="space-y-2">
            {n.arguments.map((a, i) => (
              <li key={i} className="rounded-xl bg-background/60 border border-border p-3 flex gap-3">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5 shrink-0">
                  {a.kind ?? "·"}
                </span>
                <span className="text-sm leading-snug">{lang === "ru" ? a.ru : a.en}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ClientReadyCard({
  result,
  lang,
  tone,
  setTone,
  navigate,
  id,
}: {
  result: AIResult;
  lang: "ru" | "en";
  tone: "neutral" | "selling" | "cautious";
  setTone: (t: "neutral" | "selling" | "cautious") => void;
  navigate: (to: string) => void;
  id?: string;
}) {
  const tones: { id: "neutral" | "selling" | "cautious"; ru: string; en: string }[] = [
    { id: "neutral", ru: "Нейтрально", en: "Neutral" },
    { id: "selling", ru: "Продающе", en: "Selling" },
    { id: "cautious", ru: "Осторожно", en: "Cautious" },
  ];
  const toneText =
    result.agent_script?.tones?.[tone]?.[lang] ??
    (lang === "ru" ? result.agent_script?.client_message_ru : result.agent_script?.client_message_en) ??
    "";
  const headline =
    (lang === "ru" ? result.agent_script?.headline_ru : result.agent_script?.headline_en) ??
    (lang === "ru" ? result.headline_ru : result.headline_en);
  const nextStep =
    lang === "ru" ? result.agent_script?.next_step_ru : result.agent_script?.next_step_en;
  const top3 = (result.reasons ?? []).slice(0, 3);
  const top2flags = (result.red_flags ?? []).slice(0, 2);
  const top2neg = (result.negotiation?.arguments ?? []).slice(0, 2);
  const pp = result.price_proof;
  const ccy = result.market?.currency ?? "";

  const copyText = async () => {
    const blocks = [
      headline,
      "",
      toneText,
      "",
      lang === "ru" ? "Сильные стороны:" : "Strengths:",
      ...top3.map((r) => `• ${lang === "ru" ? r.ru : r.en}`),
      "",
      top2flags.length ? (lang === "ru" ? "Что честно подсветить:" : "Honest concerns:") : "",
      ...top2flags.map((r) => `• ${lang === "ru" ? r.ru : r.en}`),
      "",
      nextStep ? (lang === "ru" ? `Следующий шаг: ${nextStep}` : `Next step: ${nextStep}`) : "",
    ].filter(Boolean);
    try {
      await navigator.clipboard.writeText(blocks.join("\n"));
      toast.success(lang === "ru" ? "Скопировано" : "Copied");
    } catch {
      toast.info(lang === "ru" ? "Не удалось скопировать" : "Copy failed");
    }
  };

  return (
    <div className="rounded-3xl border border-accent/30 bg-gradient-to-br from-accent/5 to-card p-5 lg:p-6 shadow-soft">
      {/* Tone toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
          {lang === "ru" ? "Тон обращения" : "Tone of voice"}
        </div>
        <div className="inline-flex rounded-full bg-secondary p-1 text-[11px]">
          {tones.map((t) => (
            <button
              key={t.id}
              onClick={() => setTone(t.id)}
              className={cn(
                "px-3 py-1.5 rounded-full font-medium uppercase tracking-wider transition-all",
                tone === t.id ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {lang === "ru" ? t.ru : t.en}
            </button>
          ))}
        </div>
      </div>

      {/* Headline */}
      <h3 className="mt-4 text-xl lg:text-2xl font-semibold tracking-tight leading-snug">
        {headline}
      </h3>

      {/* Tone-aware client message */}
      {toneText && (
        <p className="mt-3 text-[15px] text-foreground/85 leading-relaxed whitespace-pre-wrap">
          {toneText}
        </p>
      )}

      {/* 3-up: strengths / concerns / price */}
      <div className="mt-5 grid md:grid-cols-3 gap-3">
        <div className="rounded-2xl bg-background/60 border border-border p-4">
          <div className="text-[10px] uppercase tracking-widest text-verdict-green mb-2">
            {lang === "ru" ? "Сильные стороны" : "Strengths"}
          </div>
          <ul className="space-y-1.5">
            {top3.map((r, i) => (
              <li key={i} className="text-sm leading-snug flex gap-2">
                <span className="text-verdict-green mt-0.5">+</span>
                <span>{lang === "ru" ? r.ru : r.en}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl bg-background/60 border border-border p-4">
          <div className="text-[10px] uppercase tracking-widest text-verdict-yellow mb-2">
            {lang === "ru" ? "Подсветить честно" : "Honest concerns"}
          </div>
          {top2flags.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              {lang === "ru" ? "Серьёзных рисков нет." : "No major concerns."}
            </div>
          ) : (
            <ul className="space-y-1.5">
              {top2flags.map((r, i) => (
                <li key={i} className="text-sm leading-snug flex gap-2">
                  <span className="text-verdict-yellow mt-0.5">!</span>
                  <span>{lang === "ru" ? r.ru : r.en}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-2xl bg-background/60 border border-border p-4">
          <div className="text-[10px] uppercase tracking-widest text-accent mb-2">
            {lang === "ru" ? "Объяснение цены" : "Price story"}
          </div>
          {pp?.fair_price_min && pp?.fair_price_max ? (
            <div>
              <div className="text-sm font-medium tabular-nums">
                {formatNum(pp.fair_price_min)}–{formatNum(pp.fair_price_max)} {ccy}
              </div>
              <div className="text-[11px] text-muted-foreground mt-1">
                {lang === "ru" ? pp.market_assumption_ru ?? pp.verdict_label_ru : pp.market_assumption_en ?? pp.verdict_label_en}
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              {lang === "ru" ? "Цена не указана" : "No asking price"}
            </div>
          )}
          {top2neg.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {top2neg.map((a, i) => (
                <li key={i} className="text-xs leading-snug text-foreground/75 flex gap-2">
                  <span className="text-accent mt-0.5">→</span>
                  <span>{lang === "ru" ? a.ru : a.en}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Next step + actions */}
      {nextStep && (
        <div className="mt-5 rounded-2xl bg-foreground/95 text-background p-4">
          <div className="text-[10px] uppercase tracking-widest opacity-70 mb-1">
            {lang === "ru" ? "Следующий шаг" : "Next step"}
          </div>
          <div className="text-sm font-medium leading-snug">{nextStep}</div>
        </div>
      )}

      <div className="mt-4 grid sm:grid-cols-2 gap-2">
        <Button
          onClick={() => {
            if (id) sessionStorage.setItem(`propaai_result_${id}`, JSON.stringify(result));
            navigate(`/app/pack/${id ?? "preview"}`);
          }}
          className="h-11 rounded-xl bg-foreground text-background hover:bg-foreground/90 justify-center"
        >
          <FileDown className="h-4 w-4 mr-2" /> {lang === "ru" ? "Открыть Client Pack" : "Open Client Pack"}
        </Button>
        <Button onClick={copyText} variant="secondary" className="h-11 rounded-xl justify-center">
          <Copy className="h-4 w-4 mr-2" /> {lang === "ru" ? "Скопировать текст" : "Copy text"}
        </Button>
      </div>
    </div>
  );
}
