import { ScreenHeader, EmptyState } from "@/components/TabShell";
import { FolderOpen, Sparkles } from "lucide-react";
import { useAnalyses } from "@/hooks/useCloudData";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ru as ruLocale, enUS as enLocale } from "date-fns/locale";
import { useTranslation } from "react-i18next";

export default function Library() {
  const { t, i18n } = useTranslation();
  const { data: analyses = [], isLoading } = useAnalyses();
  const dateLocale = i18n.language === "ru" ? ruLocale : enLocale;

  return (
    <div className="animate-fade-in">
      <ScreenHeader ru={t("agent.library.title")} en={t("nav.library", { lng: "en" })} />

      {isLoading ? null : analyses.length === 0 ? (
        <EmptyState
          Icon={FolderOpen}
          ru={t("agent.library.empty")}
          en={t("agent.library.empty", { lng: "en" })}
          hint={t("agent.library.emptyHint")}
        />
      ) : (
        <div className="px-5 space-y-2">
          {analyses.map((a) => {
            const raw = a.raw as { headline_ru?: string; headline_en?: string } | null;
            const headline = (i18n.language === "ru" ? raw?.headline_ru : raw?.headline_en) ?? raw?.headline_ru ?? raw?.headline_en ?? t("agent.library.defaultHeadline");
            return (
              <div key={a.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
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
                      <div className="font-medium truncate">{headline}</div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground shrink-0">
                        {formatDistanceToNow(new Date(a.created_at), { addSuffix: true, locale: dateLocale })}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 capitalize">
                      {t("agent.library.metaLine", {
                        kind: a.input_kind,
                        score: a.score ?? "—",
                        confidence: a.confidence ?? "—",
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
