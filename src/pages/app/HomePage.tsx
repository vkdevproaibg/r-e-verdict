import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Sparkles,
  FolderOpen,
  ArrowRight,
  Search,
  MapPin,
  Link2,
  Home as HomeIcon,
  Loader2,
  Building2,
} from "lucide-react";
import { useRole } from "@/state/RoleContext";
import { useApp } from "@/state/AppContext";
import { useAnalyses, type Verdict } from "@/hooks/useCloudData";
import { useSession } from "@/state/SessionContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ru as ruLocale } from "date-fns/locale";
import heroVilla from "@/assets/hero-villa.jpg";
import libraryEmpty from "@/assets/library-empty.jpg";
import { toast } from "sonner";
import { FreshnessNudge } from "@/components/FreshnessNudge";

interface AgentListing {
  id: string;
  title: string;
  address: string | null;
  city: string | null;
  price: number;
  currency: string;
  object_status: string;
  verdict: Verdict | null;
  updated_at: string;
}

const statusMeta: Record<string, { ru: string; en: string; tone: string }> = {
  active: { ru: "Активен", en: "Active", tone: "bg-verdict-green/15 text-verdict-green" },
  reserved: { ru: "Резерв", en: "Reserved", tone: "bg-verdict-yellow/15 text-verdict-yellow" },
  sold: { ru: "Продан", en: "Sold", tone: "bg-muted text-muted-foreground" },
  archived: { ru: "Архив", en: "Archived", tone: "bg-muted text-muted-foreground" },
};

type Tab = "address" | "link" | "location";

const verdictDot: Record<Verdict, string> = {
  green: "bg-verdict-green",
  yellow: "bg-verdict-yellow",
  red: "bg-verdict-red",
};

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const { role } = useRole();
  const { geo, requestGeo, geoStatus } = useApp();
  const { data: analyses = [] } = useAnalyses();
  const navigate = useNavigate();
  const lang = i18n.language === "ru" ? "ru" : "en";
  const recent = analyses.slice(0, 4);

  const [tab, setTab] = useState<Tab>("address");
  const [value, setValue] = useState("");

  const startAnalysis = async () => {
    if (tab === "location") {
      if (!geo) await requestGeo();
      if (!navigator.geolocation) {
        toast.error("Геолокация недоступна");
        return;
      }
      // Skip the calibration for location-mode (premium UX: address-driven flow).
      navigate(`/app/analyze/loading?kind=location&purpose=buy`);
      return;
    }
    if (!value.trim()) {
      toast.error(
        tab === "address" ? "Введите адрес объекта" : "Вставьте ссылку на листинг"
      );
      return;
    }
    if (role === "buyer") {
      // Buyers go through Calibrate Radar onboarding before seeing the verdict.
      const sp = new URLSearchParams();
      sp.set("address", value.trim());
      sp.set("purpose", "buy");
      sp.set("source", tab);
      navigate(`/onboarding/calibrate?${sp.toString()}`);
      return;
    }
    // Agents: straight to analysis.
    const sp = new URLSearchParams();
    sp.set("kind", tab === "link" ? "url" : "address");
    sp.set("q", value.trim());
    sp.set("purpose", "buy");
    navigate(`/app/analyze/loading?${sp.toString()}`);
  };

  const tabs: { id: Tab; ru: string; Icon: typeof HomeIcon }[] = [
    { id: "address", ru: "Адрес", Icon: HomeIcon },
    { id: "link", ru: "Ссылка", Icon: Link2 },
    { id: "location", ru: "Локация", Icon: MapPin },
  ];

  return (
    <div className="max-w-md lg:max-w-5xl mx-auto px-5 lg:px-8 pt-2 lg:pt-8 pb-10 lg:pb-16">
      {/* HERO — image right, serif headline left */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
        className="relative overflow-hidden rounded-[28px] lg:rounded-[32px]"
      >
        <div className="grid lg:grid-cols-12 gap-0 lg:gap-6 items-stretch">
          {/* Copy */}
          <div className="relative lg:col-span-6 z-10 px-1 lg:px-2 pt-4 pb-6 lg:pt-12 lg:pb-12">
            <div className="text-[10px] uppercase tracking-[0.2em] text-accent font-medium">
              {role === "agent" ? "Sell smarter" : "Buy smarter"}
            </div>
            <h1 className="mt-3 font-serif-display text-[44px] sm:text-[56px] lg:text-[68px] leading-[0.98] font-medium text-foreground">
              Understand
              <br />
              any property
              <br />
              <span className="font-serif-italic font-normal">before you decide.</span>
            </h1>
            <div className="mt-4 h-px w-12 bg-accent" />
            <p className="mt-4 text-[15px] text-muted-foreground leading-relaxed max-w-sm">
              Get price, rent, growth, and risk insights — in under{" "}
              <span className="text-foreground font-medium">30 seconds.</span>
            </p>
          </div>

          {/* Image */}
          <div className="lg:col-span-6 -mx-5 lg:mx-0 relative aspect-[4/5] sm:aspect-[3/4] lg:aspect-auto lg:h-[520px] overflow-hidden lg:rounded-[32px]">
            <img
              src={heroVilla}
              alt="Premium villa exterior at golden hour"
              className="absolute inset-0 h-full w-full object-cover"
              width={1080}
              height={1920}
            />
            {/* soft fade into background on mobile so the input card sits cleanly */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-background/0 to-background lg:hidden" />
          </div>
        </div>

        {/* Floating input card — overlaps hero on mobile, sits in column on desktop */}
        <div className="relative -mt-16 lg:mt-0 lg:absolute lg:bottom-8 lg:left-8 lg:right-8 z-20">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="rounded-3xl bg-card/95 backdrop-blur-xl border border-border shadow-elevated p-4 lg:p-5 lg:max-w-xl"
          >
            {/* Tabs */}
            <div className="flex items-center gap-1 rounded-2xl bg-secondary/60 p-1">
              {tabs.map(({ id, ru, Icon }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={cn(
                    "flex-1 inline-flex items-center justify-center gap-1.5 h-10 rounded-xl text-[13px] font-medium transition-all",
                    tab === id
                      ? "bg-card text-accent shadow-soft"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {ru}
                </button>
              ))}
            </div>

            {/* Input row */}
            <div className="mt-3">
              {tab === "location" ? (
                <button
                  onClick={startAnalysis}
                  className="w-full h-12 rounded-2xl border border-border bg-background/60 px-4 inline-flex items-center gap-2.5 text-left text-[14px] hover:border-accent/40 transition-colors"
                >
                  <MapPin className="h-4 w-4 text-accent" />
                  {geo ? (
                    <span className="text-foreground">Использовать мою геолокацию</span>
                  ) : geoStatus === "requesting" ? (
                    <span className="text-muted-foreground inline-flex items-center gap-1.5">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Запрашиваем доступ…
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Разрешить геолокацию</span>
                  )}
                </button>
              ) : (
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && startAnalysis()}
                    placeholder={
                      tab === "address"
                        ? "Enter a property address"
                        : "Paste listing URL (Bayut, Zillow…)"
                    }
                    className="w-full h-12 rounded-2xl bg-background/60 border border-border pl-10 pr-4 text-[14px] placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/15 transition-all"
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-3 space-y-2">
              <Button
                onClick={startAnalysis}
                className="w-full h-12 rounded-2xl bg-foreground text-background hover:bg-foreground/90 shadow-soft text-[15px] font-medium"
              >
                <Sparkles className="h-4 w-4 mr-2 text-accent" />
                Start analysis
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full h-11 rounded-2xl border-border bg-background/40 text-[14px] font-medium"
              >
                <Link to={role === "agent" ? "/app/add-object" : "/app/library"}>
                  <FolderOpen className="h-4 w-4 mr-2" />
                  {role === "agent" ? "Add object" : "Open library"}
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
        {/* spacer to compensate desktop absolute card */}
        <div className="hidden lg:block lg:h-24" />
      </motion.section>

      {/* Freshness nudge for agents */}
      {role === "agent" && <FreshnessNudge />}

      {/* Library section */}
      <section className="mt-6 lg:mt-12">
        {recent.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-soft"
          >
            <div className="grid grid-cols-12 items-stretch">
              <div className="col-span-7 lg:col-span-7 p-5 lg:p-8 flex flex-col gap-4">
                <div className="h-10 w-10 rounded-xl bg-accent/10 grid place-items-center">
                  <FolderOpen className="h-4.5 w-4.5 text-accent" />
                </div>
                <div>
                  <h2 className="font-serif-display text-[26px] sm:text-[32px] leading-[1.05] text-foreground">
                    Your property
                    <br />
                    library is empty
                  </h2>
                  <p className="mt-3 text-[13px] text-muted-foreground leading-relaxed max-w-xs">
                    Run your first analysis to unlock powerful insights. Your saved properties will appear here.
                  </p>
                </div>
              </div>
              <div className="col-span-5 lg:col-span-5 relative">
                <img
                  src={libraryEmpty}
                  alt=""
                  loading="lazy"
                  width={1024}
                  height={1024}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-card to-transparent" />
              </div>
            </div>
          </motion.div>
        ) : (
          <>
            <div className="flex items-baseline justify-between gap-2 mb-4">
              <h2 className="font-serif-display text-2xl tracking-tight">Recent analyses</h2>
              {analyses.length > 4 && (
                <Link
                  to="/app/library"
                  className="text-xs font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                >
                  {t("common.show")} <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {recent.map((a, i) => {
                const raw = a.raw as { headline_ru?: string; headline_en?: string } | null;
                const headline =
                  (lang === "ru" ? raw?.headline_ru : raw?.headline_en) ??
                  raw?.headline_ru ??
                  raw?.headline_en ??
                  "Анализ";
                return (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      to={`/app/result/${a.id}`}
                      className="group block rounded-2xl border border-border bg-card p-4 shadow-soft hover:border-accent/40 hover:shadow-elevated transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "h-10 w-10 rounded-xl grid place-items-center shrink-0",
                            a.verdict === "green"
                              ? "bg-verdict-green/15"
                              : a.verdict === "yellow"
                              ? "bg-verdict-yellow/15"
                              : a.verdict === "red"
                              ? "bg-verdict-red/15"
                              : "bg-secondary"
                          )}
                        >
                          <span
                            className={cn(
                              "h-2 w-2 rounded-full",
                              a.verdict ? verdictDot[a.verdict as Verdict] : "bg-muted-foreground"
                            )}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium leading-tight truncate">{headline}</div>
                          <div className="mt-0.5 text-[11px] uppercase tracking-wider text-muted-foreground">
                            {a.input_kind} · {a.score ?? "—"}/100 ·{" "}
                            {formatDistanceToNow(new Date(a.created_at), {
                              addSuffix: true,
                              locale: lang === "ru" ? ruLocale : undefined,
                            })}
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
