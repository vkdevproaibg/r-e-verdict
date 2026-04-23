import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FolderOpen, Sparkles, MapPin, List, Map as MapIcon } from "lucide-react";
import { useAnalyses, useSaved, type Verdict } from "@/hooks/useCloudData";
import { PropertyMap } from "@/components/PropertyMap";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ru as ruLocale } from "date-fns/locale";

export default function LibraryPage() {
  const { t, i18n } = useTranslation();
  const { data: analyses = [] } = useAnalyses();
  const { data: saved = [] } = useSaved();
  const [view, setView] = useState<"list" | "map">("list");
  const [filter, setFilter] = useState<"all" | "saved" | "analyses">("all");
  const lang = i18n.language === "ru" ? "ru" : "en";

  const pins = useMemo(
    () =>
      saved
        .filter((s) => s.property?.lat && s.property?.lng)
        .map((s) => ({
          id: s.property!.id,
          lat: s.property!.lat,
          lng: s.property!.lng,
          verdict: (s.property!.verdict ?? "yellow") as Verdict,
          price:
            s.property!.price >= 1_000_000
              ? `${(s.property!.price / 1_000_000).toFixed(1)}M`
              : `${Math.round(s.property!.price / 1000)}k`,
        })),
    [saved]
  );

  const isEmpty = saved.length === 0 && analyses.length === 0;

  return (
    <div className="px-5 lg:px-8 py-6 lg:py-10 max-w-5xl mx-auto pb-24">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{t("library.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-md">{t("library.sub")}</p>
        </div>
        {/* List ↔ Map toggle (inside Library, not a separate tab) */}
        <div className="inline-flex rounded-full border border-border bg-card p-0.5">
          <ToggleBtn active={view === "list"} onClick={() => setView("list")}>
            <List className="h-3.5 w-3.5" /> {t("library.tabs.list")}
          </ToggleBtn>
          <ToggleBtn active={view === "map"} onClick={() => setView("map")}>
            <MapIcon className="h-3.5 w-3.5" /> {t("library.tabs.map")}
          </ToggleBtn>
        </div>
      </div>

      {/* Filter tabs (only for list view) */}
      {view === "list" && !isEmpty && (
        <div className="mt-5 inline-flex rounded-full border border-border bg-card p-0.5">
          {(["all", "saved", "analyses"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-full transition-colors",
                filter === f ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t(`library.filters.${f}`)}
            </button>
          ))}
        </div>
      )}

      {isEmpty ? (
        <div className="mt-6 rounded-3xl border border-dashed border-border p-12 text-center">
          <FolderOpen className="h-10 w-10 mx-auto text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">{t("library.empty")}</p>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">{t("library.emptyHint")}</p>
        </div>
      ) : view === "map" ? (
        <div className="mt-5 rounded-3xl overflow-hidden border border-border h-[60vh] min-h-[400px]">
          <PropertyMap pins={pins} />
        </div>
      ) : (
        <div className="mt-5 space-y-2">
          {(filter === "all" || filter === "saved") &&
            saved.map((s) => {
              const p = s.property;
              if (!p) return null;
              return (
                <div key={s.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
                  <div className="flex items-start gap-3">
                    <VerdictDot verdict={p.verdict as Verdict | null} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium leading-tight truncate">{p.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1 truncate">
                        <MapPin className="h-3 w-3" /> {p.address}
                      </div>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground shrink-0">
                      {t("library.filters.saved")}
                    </span>
                  </div>
                </div>
              );
            })}
          {(filter === "all" || filter === "analyses") &&
            analyses.map((a) => {
              const raw = a.raw as { headline_ru?: string; headline_en?: string } | null;
              const headline =
                (lang === "ru" ? raw?.headline_ru : raw?.headline_en) ?? raw?.headline_ru ?? raw?.headline_en ?? t("agent.library.defaultHeadline");
              return (
                <Link
                  key={a.id}
                  to={`/app/result/${a.id}`}
                  className="block rounded-2xl border border-border bg-card p-4 shadow-soft hover:border-accent/40 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl bg-secondary grid place-items-center shrink-0">
                      <Sparkles className="h-4 w-4 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <div className="font-medium truncate">{headline}</div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground shrink-0">
                          {formatDistanceToNow(new Date(a.created_at), {
                            addSuffix: true,
                            locale: lang === "ru" ? ruLocale : undefined,
                          })}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {a.input_kind} · score {a.score ?? "—"} · confidence {a.confidence ?? "—"}%
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
        </div>
      )}
    </div>
  );
}

function ToggleBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 text-xs font-medium rounded-full transition-colors inline-flex items-center gap-1.5",
        active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

function VerdictDot({ verdict }: { verdict: Verdict | null }) {
  return (
    <div
      className={cn(
        "h-10 w-10 rounded-xl grid place-items-center shrink-0",
        verdict === "green"
          ? "bg-verdict-green/15"
          : verdict === "yellow"
          ? "bg-verdict-yellow/15"
          : verdict === "red"
          ? "bg-verdict-red/15"
          : "bg-secondary"
      )}
    >
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          verdict === "green"
            ? "bg-verdict-green"
            : verdict === "yellow"
            ? "bg-verdict-yellow"
            : verdict === "red"
            ? "bg-verdict-red"
            : "bg-muted-foreground"
        )}
      />
    </div>
  );
}
