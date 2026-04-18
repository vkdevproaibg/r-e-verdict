import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Sparkles, FolderOpen } from "lucide-react";
import { useAnalyses, type Verdict } from "@/hooks/useCloudData";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ru as ruLocale } from "date-fns/locale";

const verdictDot: Record<Verdict, string> = {
  green: "bg-verdict-green",
  yellow: "bg-verdict-yellow",
  red: "bg-verdict-red",
};

export default function HistoryPage() {
  const { t, i18n } = useTranslation();
  const { data: analyses = [], isLoading } = useAnalyses();
  const [filter, setFilter] = useState<Verdict | "all">("all");

  const filtered = filter === "all" ? analyses : analyses.filter((a) => a.verdict === filter);
  const lang = i18n.language === "ru" ? "ru" : "en";

  return (
    <div className="px-5 lg:px-8 py-8 lg:py-12 max-w-5xl mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{t("history.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("history.sub")}</p>
        </div>
        <div className="inline-flex rounded-full border border-border bg-card p-0.5">
          {(["all", "green", "yellow", "red"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-full transition-colors flex items-center gap-1.5",
                filter === k ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {k !== "all" && <span className={cn("h-1.5 w-1.5 rounded-full", verdictDot[k])} />}
              {t(`history.filter.${k}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 space-y-2">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-12 text-center">
            <FolderOpen className="h-10 w-10 mx-auto text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">{t("history.empty")}</p>
          </div>
        ) : (
          filtered.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Link
                to={`/app/result/${a.id}`}
                className="block rounded-2xl border border-border bg-card p-4 shadow-soft hover:border-accent/40 hover:shadow-elevated transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "h-10 w-10 rounded-xl grid place-items-center shrink-0",
                    a.verdict === "green" ? "bg-verdict-green/15" :
                    a.verdict === "yellow" ? "bg-verdict-yellow/15" :
                    a.verdict === "red" ? "bg-verdict-red/15" : "bg-secondary"
                  )}>
                    <Sparkles className={cn("h-4 w-4",
                      a.verdict === "green" ? "text-verdict-green" :
                      a.verdict === "yellow" ? "text-verdict-yellow" :
                      a.verdict === "red" ? "text-verdict-red" : "text-muted-foreground")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="font-medium truncate">
                        {(a.raw as { headline_ru?: string; headline_en?: string } | null)?.[lang === "ru" ? "headline_ru" : "headline_en"] ?? "Analysis"}
                      </div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground shrink-0">
                        {formatDistanceToNow(new Date(a.created_at), {
                          addSuffix: true,
                          locale: lang === "ru" ? ruLocale : undefined,
                        })}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 capitalize">
                      {a.input_kind} · score {a.score ?? "—"} · confidence {a.confidence ?? "—"}%
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
