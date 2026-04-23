import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Sparkles, FolderOpen, GitCompare, ArrowRight, Plus } from "lucide-react";
import { useRole } from "@/state/RoleContext";
import { useAnalyses, useClients, type Verdict } from "@/hooks/useCloudData";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ru as ruLocale } from "date-fns/locale";
import heroExterior from "@/assets/hero-exterior.jpg";

const verdictDot: Record<Verdict, string> = {
  green: "bg-verdict-green",
  yellow: "bg-verdict-yellow",
  red: "bg-verdict-red",
};

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const { role } = useRole();
  const { data: analyses = [] } = useAnalyses();
  const { data: clients = [] } = useClients();
  const lang = i18n.language === "ru" ? "ru" : "en";
  const recent = analyses.slice(0, 4);
  const ns = role === "agent" ? "home.agent" : "home.buyer";

  return (
    <div className="px-5 lg:px-8 py-6 lg:py-10 max-w-5xl mx-auto">
      {/* Hero block */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-soft"
      >
        <div className="absolute inset-0">
          <img
            src={heroExterior}
            alt=""
            className="h-full w-full object-cover opacity-[0.18]"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/60 to-background/30" />
        </div>
        <div className="relative p-6 lg:p-10">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/70 backdrop-blur px-3 py-1 text-[10px] uppercase tracking-widest text-muted-foreground">
            <Sparkles className="h-3 w-3 text-accent" />
            {t(`${ns}.eyebrow`)}
          </div>
          <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-[1.05] max-w-2xl">
            {t(`${ns}.headline`)}
          </h1>
          <p className="mt-3 text-base text-muted-foreground max-w-xl">
            {t(`${ns}.sub`)}
          </p>

          <div className="mt-6 flex flex-wrap gap-2.5">
            <Button asChild className="h-12 px-6 rounded-2xl bg-foreground text-background hover:bg-foreground/90 shadow-soft">
              <Link to="/app/analyze">
                <Sparkles className="h-4 w-4 mr-1.5" />
                {t(`${ns}.primaryCta`)}
              </Link>
            </Button>
            {role === "buyer" ? (
              <>
                <Button asChild variant="secondary" className="h-12 px-5 rounded-2xl">
                  <Link to="/app/library">
                    <FolderOpen className="h-4 w-4 mr-1.5" />
                    {t("home.buyer.secondaryCta")}
                  </Link>
                </Button>
                <Button asChild variant="ghost" className="h-12 px-5 rounded-2xl">
                  <Link to="/app/compare">
                    <GitCompare className="h-4 w-4 mr-1.5" />
                    {t("home.buyer.compareCta")}
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="secondary" className="h-12 px-5 rounded-2xl">
                  <Link to="/app/clients">
                    {t("home.agent.secondaryCta")} · {clients.length}
                  </Link>
                </Button>
                <Button asChild variant="ghost" className="h-12 px-5 rounded-2xl">
                  <Link to="/app/library">
                    <FolderOpen className="h-4 w-4 mr-1.5" />
                    {t("home.agent.libraryCta")}
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Recent analyses */}
      <section className="mt-10">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-xl font-semibold tracking-tight">{t(`${ns}.recentTitle`)}</h2>
          {analyses.length > 4 && (
            <Link
              to="/app/library"
              className="text-xs font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              {t("common.show")} <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>

        {recent.length === 0 ? (
          <div className="mt-4 rounded-3xl border border-dashed border-border p-10 text-center">
            <Sparkles className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground max-w-sm mx-auto">
              {t(`${ns}.recentEmpty`)}
            </p>
            <Button asChild className="mt-5 h-11 rounded-xl bg-foreground text-background hover:bg-foreground/90">
              <Link to="/app/analyze">
                <Plus className="h-4 w-4 mr-1.5" />
                {t(`${ns}.primaryCta`)}
              </Link>
            </Button>
          </div>
        ) : (
          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            {recent.map((a, i) => {
              const raw = a.raw as { headline_ru?: string; headline_en?: string } | null;
              const headline =
                (lang === "ru" ? raw?.headline_ru : raw?.headline_en) ??
                raw?.headline_ru ??
                raw?.headline_en ??
                t("agent.library.defaultHeadline");
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
        )}
      </section>
    </div>
  );
}
