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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useRole } from "@/state/RoleContext";
import { useSaveAnalysis, type Verdict } from "@/hooks/useCloudData";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import heroExterior from "@/assets/hero-exterior.jpg";
import heroInterior from "@/assets/hero-interior.jpg";
import heroCity from "@/assets/hero-city.jpg";

interface AIResult {
  verdict: Verdict;
  score: number;
  confidence: number;
  headline_ru: string;
  headline_en: string;
  reasons: { ru: string; en: string; kind?: string }[];
  red_flags: { ru: string; en: string; severity?: "low" | "medium" | "high" }[];
  next_steps: { ru: string; en: string }[];
  input_kind?: string;
  query?: string;
  error?: string;
  lat?: number;
  lng?: number;
  geo_address?: string;
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
            <div className={cn("mt-2 text-[11px] uppercase tracking-widest font-semibold inline-flex items-center gap-1.5", v.text)}>
              <span className={cn("h-1.5 w-1.5 rounded-full", v.dot)} />
              {verdictLabel}
            </div>
            <h1 className="mt-2 text-3xl lg:text-4xl font-semibold tracking-tight leading-tight">
              {headline}
            </h1>

            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Metric label={t("result.score")} value={`${result.score}`} accent />
              <Metric label={t("result.confidence")} value={`${result.confidence}%`} />
              <Metric label={t("result.priceVsMarket")} value="−4%" sub={lang === "ru" ? "ниже комплов" : "vs comps"} />
              <Metric label={t("result.liquidity")} value="High" sub="< 60d" />
            </div>
          </div>
        </motion.div>

        {/* Location + 3D view */}
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
              onClick={() => toast.info(lang === "ru" ? "PDF экспорт скоро" : "PDF export coming soon")}
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
            <div className="mt-3 grid sm:grid-cols-2 gap-2">
              <Button
                className="h-12 rounded-xl bg-foreground text-background hover:bg-foreground/90 justify-start"
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
            <ToolCard title={lang === "ru" ? "Питч за 30 секунд" : "30-second pitch"} text={pitchText} />
            <ToolCard
              title={lang === "ru" ? "Рычаги торга" : "Negotiation levers"}
              text={(result.red_flags ?? []).map((r) => `• ${lang === "ru" ? r.ru : r.en}`).join("\n") || (lang === "ru" ? "Сильных рычагов нет — объект ликвиден." : "No strong levers — property is liquid.")}
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
