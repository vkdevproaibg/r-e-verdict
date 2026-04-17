import { ScreenHeader, EmptyState } from "@/components/TabShell";
import { FolderOpen, Sparkles } from "lucide-react";
import { useAnalyses } from "@/hooks/useCloudData";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ru as ruLocale } from "date-fns/locale";

export default function Library() {
  const { data: analyses = [], isLoading } = useAnalyses();

  return (
    <div className="animate-fade-in">
      <ScreenHeader ru="Архив" en="Library" />

      {isLoading ? null : analyses.length === 0 ? (
        <EmptyState
          Icon={FolderOpen}
          ru="Архив пуст"
          en="No saved analyses"
          hint="Сохранённые анализы и портфолио объектов будут здесь."
        />
      ) : (
        <div className="px-5 space-y-2">
          {analyses.map((a) => (
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
                    <div className="font-medium truncate">
                      {(a.raw as { headline_ru?: string } | null)?.headline_ru ?? "Анализ"}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground shrink-0">
                      {formatDistanceToNow(new Date(a.created_at), { addSuffix: true, locale: ruLocale })}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 capitalize">
                    {a.input_kind} · скор {a.score ?? "—"} · уверенность {a.confidence ?? "—"}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
