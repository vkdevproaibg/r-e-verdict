import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Sparkles, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { type Verdict } from "@/hooks/useCloudData";
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
  reasons: { ru: string; en: string }[];
  red_flags: { ru: string; en: string; severity?: string }[];
  next_steps: { ru: string; en: string }[];
}

const verdictMeta: Record<Verdict, { bg: string; text: string; ring: string; dot: string; label: string }> = {
  green: { bg: "bg-verdict-green/10", text: "text-verdict-green", ring: "ring-verdict-green/30", dot: "bg-verdict-green", label: "Strong buy" },
  yellow: { bg: "bg-verdict-yellow/10", text: "text-verdict-yellow", ring: "ring-verdict-yellow/30", dot: "bg-verdict-yellow", label: "Negotiate" },
  red: { bg: "bg-verdict-red/10", text: "text-verdict-red", ring: "ring-verdict-red/30", dot: "bg-verdict-red", label: "Walk away" },
};

export default function SharePage() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const [result, setResult] = useState<AIResult | null>(null);
  const lang = i18n.language === "ru" ? "ru" : "en";

  useEffect(() => {
    const raw = id ? sessionStorage.getItem(`propaai_share_${id}`) ?? sessionStorage.getItem(`propaai_result_${id}`) : null;
    const fallback = sessionStorage.getItem("propaai_last_result");
    const data = raw ?? fallback;
    if (data) setResult(JSON.parse(data));
  }, [id]);

  if (!result) {
    return (
      <div className="min-h-screen grid place-items-center bg-background px-6 text-center">
        <div>
          <h1 className="text-xl font-semibold">Report not available</h1>
          <p className="mt-2 text-sm text-muted-foreground">This share link has expired.</p>
          <Link to="/" className="mt-4 inline-flex items-center gap-1 text-sm text-accent hover:underline">
            Open Propa AI <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  const v = verdictMeta[result.verdict];
  const headline = lang === "ru" ? result.headline_ru : result.headline_en;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-5 lg:px-8 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-gradient-charcoal grid place-items-center">
              <span className="text-[10px] font-bold tracking-widest text-background">P</span>
            </div>
            <span className="text-sm font-semibold tracking-tight">{t("brand.name")}</span>
          </Link>
          <Link
            to="/app/analyze"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Analyze your own →
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 lg:px-8 py-10 lg:py-16">
        {/* Presented by */}
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
          {t("result.presentedBy")} · Propa AI Agent
        </div>

        {/* Hero verdict */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={cn("mt-3 rounded-3xl border ring-1 p-6 lg:p-10", v.bg, v.ring, "border-transparent")}
        >
          <div className={cn("text-[11px] uppercase tracking-widest font-semibold inline-flex items-center gap-1.5", v.text)}>
            <Sparkles className="h-3 w-3" />
            <span className={cn("h-1.5 w-1.5 rounded-full", v.dot)} />
            {v.label}
          </div>
          <h1 className="mt-3 text-3xl lg:text-5xl font-semibold tracking-tight leading-[1.1]">
            {headline}
          </h1>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Metric label="Score" value={`${result.score}`} accent />
            <Metric label="Confidence" value={`${result.confidence}%`} />
            <Metric label="Price vs market" value="−4%" />
            <Metric label="Liquidity" value="High" />
          </div>
        </motion.div>

        {/* Media */}
        <section className="mt-10">
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-3 aspect-[16/9] rounded-2xl overflow-hidden bg-secondary">
              <img src={heroExterior} alt="" loading="lazy" className="h-full w-full object-cover" />
            </div>
            <div className="aspect-square rounded-2xl overflow-hidden bg-secondary">
              <img src={heroInterior} alt="" loading="lazy" className="h-full w-full object-cover" />
            </div>
            <div className="aspect-square rounded-2xl overflow-hidden bg-secondary">
              <img src={heroCity} alt="" loading="lazy" className="h-full w-full object-cover" />
            </div>
            <div className="aspect-square rounded-2xl overflow-hidden bg-secondary">
              <img src={heroExterior} alt="" loading="lazy" className="h-full w-full object-cover" />
            </div>
          </div>
        </section>

        {/* Reasons */}
        {result.reasons?.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-semibold tracking-tight mb-3">{t("result.reasons")}</h2>
            <div className="space-y-2">
              {result.reasons.map((r, i) => (
                <div key={i} className="rounded-2xl border border-border bg-card p-4 flex gap-3">
                  <CheckCircle2 className="h-4 w-4 text-verdict-green mt-0.5 shrink-0" />
                  <div className="text-sm leading-snug">{lang === "ru" ? r.ru : r.en}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Red flags */}
        {result.red_flags?.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xl font-semibold tracking-tight mb-3">{t("result.redFlags")}</h2>
            <div className="grid sm:grid-cols-2 gap-2">
              {result.red_flags.map((r, i) => (
                <div key={i} className="rounded-2xl border border-border bg-card p-4 flex gap-3">
                  <AlertTriangle className="h-4 w-4 text-verdict-yellow mt-0.5 shrink-0" />
                  <div className="text-sm leading-snug">{lang === "ru" ? r.ru : r.en}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="mt-12 rounded-3xl bg-gradient-charcoal text-background p-8 lg:p-10 text-center">
          <div className="text-[10px] uppercase tracking-widest opacity-70">Powered by Propa AI</div>
          <h3 className="mt-2 text-2xl lg:text-3xl font-semibold tracking-tight">
            Want a verdict on your next property?
          </h3>
          <Link
            to="/app/analyze"
            className="mt-5 inline-flex h-11 items-center px-6 rounded-full bg-accent text-accent-foreground font-medium hover:opacity-90 transition-opacity"
          >
            Try Propa free <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </section>
      </main>
    </div>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={cn("rounded-2xl border p-3 bg-card/60", accent ? "border-accent/30" : "border-border")}>
      <div className={cn("text-2xl font-semibold leading-none tabular-nums", accent && "text-accent")}>{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1.5">{label}</div>
    </div>
  );
}
