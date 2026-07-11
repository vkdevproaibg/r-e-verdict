import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ExternalLink, Check, GitCompare, Sparkles, Globe, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { sourcesForCountry, feedFor, type Listing } from "@/lib/sources";
import { getAgentCountry, COUNTRIES } from "@/lib/countries";

export default function SourcesBrowser() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialPurpose = (params.get("purpose") as "buy" | "rent") || "buy";
  const initialArea = params.get("area") ?? "";

  const [purpose, setPurpose] = useState<"buy" | "rent">(initialPurpose);
  const [area, setArea] = useState<string>(initialArea);
  const country = getAgentCountry();
  const orderedSources = useMemo(() => sourcesForCountry(country), [country]);
  const countryLabel = COUNTRIES.find((c) => c.code === country)?.label ?? "Auto";
  const [sourceId, setSourceId] = useState<string>(orderedSources[0].id);
  const [selected, setSelected] = useState<string[]>([]);
  const [manualUrl, setManualUrl] = useState<string>("");

  const source = useMemo(
    () => orderedSources.find((s) => s.id === sourceId) ?? orderedSources[0],
    [orderedSources, sourceId]
  );
  const listings = useMemo(() => feedFor(source), [source]);

  const toggle = (id: string) => {
    setSelected((cur) => {
      if (cur.includes(id)) return cur.filter((x) => x !== id);
      if (cur.length >= 2) {
        toast.info(t("analyze.sources.limit"));
        return cur;
      }
      return [...cur, id];
    });
  };

  const buildParams = (q: string, compareWith?: string) => {
    const p = new URLSearchParams();
    p.set("kind", "url");
    p.set("q", q);
    p.set("purpose", purpose);
    if (area.trim()) p.set("area", area.trim());
    if (compareWith) p.set("compareWith", compareWith);
    return p;
  };

  const launch = () => {
    if (selected.length === 0) return;
    const picked = selected
      .map((id) => listings.find((l) => l.id === id))
      .filter(Boolean) as Listing[];
    if (picked.length === 1) {
      navigate(`/app/analyze/loading?${buildParams(picked[0].url).toString()}`);
      return;
    }
    sessionStorage.setItem("propaai_compare_queue", JSON.stringify(picked.map((p) => p.url)));
    toast.success(t("analyze.sources.compareTwo") + " · " + picked[0].title + " + " + picked[1].title);
    navigate(`/app/analyze/loading?${buildParams(picked[0].url, picked[1].url).toString()}`);
  };

  return (
    <div className="px-5 lg:px-8 py-6 lg:py-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/app/analyze")}
          className="h-9 w-9 rounded-xl border border-border bg-card grid place-items-center hover:border-accent/40 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1 text-[10px] uppercase tracking-widest text-muted-foreground">
          <Sparkles className="h-3 w-3 text-accent" />
          {purpose === "rent" ? t("analyze.purpose.rent") : t("analyze.purpose.buy")}
        </div>
        <button
          onClick={() => navigate("/app/settings")}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1 text-[10px] uppercase tracking-widest text-muted-foreground hover:border-accent/40 hover:text-foreground transition-colors"
          title={t("analyze.sources.changeCountry") ?? "Change country in Settings"}
        >
          <Globe className="h-3 w-3 text-accent" />
          {countryLabel}
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mt-4">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">{t("analyze.sources.title")}</h1>
        <p className="mt-2 text-base text-muted-foreground max-w-2xl">{t("analyze.sources.sub")}</p>
      </motion.div>

      {/* Purpose + area */}
      <div className="mt-5 flex flex-wrap items-end gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">{t("analyze.purpose.label")}</div>
          <div className="inline-flex rounded-2xl border border-border bg-card p-1">
            {(["buy", "rent"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPurpose(p)}
                className={cn(
                  "px-4 h-10 rounded-xl text-sm font-medium transition-all",
                  purpose === p
                    ? "bg-gradient-bronze text-accent-foreground shadow-bronze"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t(`analyze.purpose.${p}`)}
              </button>
            ))}
          </div>
        </div>
        <div className="min-w-[160px]">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">{t("refine.area")}</div>
          <Input
            value={area}
            onChange={(e) => setArea(e.target.value.replace(/[^\d.,]/g, ""))}
            inputMode="decimal"
            placeholder="80"
            className="h-10 rounded-xl"
          />
        </div>
      </div>

      {/* Direct listing URL — same entry point, no need for a separate card on Analyze hub */}
      <div className="mt-6 rounded-2xl border border-accent/30 ring-1 ring-accent/10 bg-gradient-to-br from-card to-accent/[0.04] p-4">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
          <Link2 className="h-3.5 w-3.5 text-accent" />
          {t("analyze.sources.urlTitle")}
        </div>
        <div className="mt-2 text-sm text-muted-foreground leading-snug">
          {t("analyze.sources.urlSub")}
        </div>
        <div className="mt-3 flex flex-col sm:flex-row gap-2">
          <Input
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            placeholder="https://www.zillow.com/homedetails/..."
            className="h-11 rounded-xl flex-1"
          />
          <Button
            onClick={() => {
              const q = manualUrl.trim();
              if (!q) { toast.info(t("analyze.sources.urlEmpty")); return; }
              const p = new URLSearchParams();
              p.set("kind", "url");
              p.set("q", q);
              p.set("purpose", purpose);
              if (area.trim()) p.set("area", area.trim());
              navigate(`/app/analyze/loading?${p.toString()}`);
            }}
            className="h-11 rounded-xl bg-gradient-bronze text-accent-foreground shadow-bronze hover:opacity-90 font-semibold px-5"
          >
            {t("analyze.sources.analyzeOne")}
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </div>
      </div>

      <div className="mt-6 grid lg:grid-cols-[260px_1fr] gap-6">
        {/* Source picker */}
        <aside>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
            {t("analyze.sources.pickSource")}
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
            {orderedSources.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSourceId(s.id);
                  setSelected([]);
                }}
                className={cn(
                  "group rounded-2xl border p-3 text-left transition-all bg-gradient-to-br",
                  s.brand,
                  sourceId === s.id
                    ? "border-accent/60 ring-1 ring-accent/20 shadow-bronze"
                    : "border-border hover:border-accent/40"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <div className={cn(
                    "h-9 w-9 rounded-xl grid place-items-center shrink-0",
                    sourceId === s.id ? "bg-gradient-bronze text-accent-foreground shadow-bronze" : "bg-secondary"
                  )}>
                    <Globe className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold tracking-tight truncate">{s.name}</div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.region}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Feed panel */}
        <section className="min-w-0">
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            {/* Faux browser bar */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-secondary/40">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
              </div>
              <div className="flex-1 mx-2 h-7 rounded-lg bg-background border border-border flex items-center px-3 text-xs text-muted-foreground truncate">
                {source.url}
              </div>
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-foreground hover:text-accent transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t("analyze.sources.openOriginal")}</span>
              </a>
            </div>

            <div className="p-4 lg:p-5">
              <div className="flex items-baseline justify-between gap-3 flex-wrap">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{t("analyze.sources.feedTitle")}</div>
                  <div className="text-base font-semibold tracking-tight">{source.name} · {source.region}</div>
                </div>
                <div className="text-xs text-muted-foreground">{t("analyze.sources.tapToSelect")}</div>
              </div>

              <div className="mt-4 grid sm:grid-cols-2 gap-3">
                {listings.map((l) => {
                  const isSel = selected.includes(l.id);
                  return (
                    <motion.button
                      key={l.id}
                      whileHover={{ y: -2 }}
                      onClick={() => toggle(l.id)}
                      className={cn(
                        "relative group text-left rounded-2xl border bg-card overflow-hidden transition-all",
                        isSel
                          ? "border-accent ring-2 ring-accent/30 shadow-bronze"
                          : "border-border hover:border-accent/40 hover:shadow-elevated"
                      )}
                    >
                      <div className="relative aspect-[16/10] bg-secondary overflow-hidden">
                        <img
                          src={l.img}
                          alt={l.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform group-hover:scale-[1.03]"
                        />
                        {isSel && (
                          <div className="absolute top-2 right-2 h-7 w-7 rounded-full bg-gradient-bronze grid place-items-center shadow-bronze text-accent-foreground">
                            <Check className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-sm font-semibold tracking-tight leading-tight line-clamp-1">{l.title}</div>
                          <div className="text-sm font-semibold tracking-tight text-accent shrink-0">{l.price}</div>
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground leading-snug line-clamp-1">
                          {l.beds} · {l.area}
                        </div>
                        <div className="mt-0.5 text-[11px] text-muted-foreground/80 line-clamp-1">{l.city}</div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              <p className="mt-4 text-[11px] text-muted-foreground/80 leading-relaxed">
                {t("analyze.sources.comingSoonHint")}
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Sticky action bar */}
      {selected.length > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-20 lg:bottom-6 inset-x-0 z-[1050] px-5"
        >
          <div className="max-w-2xl mx-auto rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-elevated p-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold tracking-tight">
                {selected.length === 1 ? t("analyze.sources.selectedOne") : t("analyze.sources.selectedTwo")}
              </div>
              <div className="text-[11px] text-muted-foreground truncate">
                {selected.map((id) => listings.find((l) => l.id === id)?.title).filter(Boolean).join(" · ")}
              </div>
            </div>
            <Button
              onClick={launch}
              className="h-11 rounded-xl bg-gradient-bronze text-accent-foreground shadow-bronze hover:opacity-90 font-semibold px-4"
            >
              {selected.length === 2 ? (
                <>
                  <GitCompare className="h-4 w-4 mr-1.5" />
                  {t("analyze.sources.compareTwo")}
                </>
              ) : (
                <>
                  {t("analyze.sources.analyzeOne")}
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </>
              )}
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
