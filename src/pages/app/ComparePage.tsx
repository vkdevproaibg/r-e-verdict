import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { GitCompare, Check, MapPin, ArrowRight } from "lucide-react";
import { useSaved, type Verdict } from "@/hooks/useCloudData";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ComparePage() {
  const { t } = useTranslation();
  const { data: saved = [] } = useSaved();
  const [picked, setPicked] = useState<string[]>([]);

  const toggle = (id: string) => {
    setPicked((p) => {
      if (p.includes(id)) return p.filter((x) => x !== id);
      if (p.length >= 4) return p;
      return [...p, id];
    });
  };

  const items = saved.filter((s) => picked.includes(s.id) && s.property);
  const ready = items.length >= 2;

  // Best-for-goal heuristic: highest score wins.
  const best = ready
    ? [...items].sort((a, b) => (b.property!.score ?? 0) - (a.property!.score ?? 0))[0]
    : null;

  return (
    <div className="px-5 lg:px-8 py-6 lg:py-10 max-w-5xl mx-auto pb-24">
      <div className="flex items-start gap-3">
        <div className="h-11 w-11 rounded-2xl bg-secondary grid place-items-center shrink-0">
          <GitCompare className="h-5 w-5 text-accent" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">{t("compare.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-xl">{t("compare.sub")}</p>
        </div>
      </div>

      {saved.length < 2 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-border p-10 text-center">
          <p className="text-sm text-muted-foreground">{t("compare.empty")}</p>
          <Button asChild variant="secondary" className="mt-4 rounded-xl h-11">
            <Link to="/app/library">{t("nav.library")}</Link>
          </Button>
        </div>
      ) : (
        <>
          {/* Picker */}
          <section className="mt-8">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              {t("compare.pick")} ({picked.length}/4)
            </div>
            <div className="space-y-2">
              {saved.map((s) => {
                if (!s.property) return null;
                const active = picked.includes(s.id);
                const v = s.property.verdict as Verdict | null;
                return (
                  <button
                    key={s.id}
                    onClick={() => toggle(s.id)}
                    className={cn(
                      "w-full text-left rounded-2xl border p-4 shadow-soft transition-all",
                      active ? "border-accent/60 bg-accent/5 ring-1 ring-accent/20" : "border-border bg-card hover:border-accent/30"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "h-9 w-9 rounded-xl grid place-items-center shrink-0",
                          active ? "bg-accent text-accent-foreground" : "bg-secondary"
                        )}
                      >
                        {active ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <span
                            className={cn(
                              "h-2 w-2 rounded-full",
                              v === "green" ? "bg-verdict-green" : v === "yellow" ? "bg-verdict-yellow" : v === "red" ? "bg-verdict-red" : "bg-muted-foreground"
                            )}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium leading-tight truncate">{s.property.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1 truncate">
                          <MapPin className="h-3 w-3" /> {s.property.address}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Comparison table */}
          {ready ? (
            <section className="mt-10">
              <div className="overflow-x-auto rounded-3xl border border-border bg-card shadow-soft">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">
                        {t("compare.metrics.price")}
                      </th>
                      {items.map((s) => (
                        <th key={s.id} className="text-left p-4 font-semibold tracking-tight min-w-[140px]">
                          {s.property!.title}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <Row label={t("compare.metrics.price")} cells={items.map((s) => `${s.property!.price.toLocaleString("en-US")} ${s.property!.currency}`)} />
                    <Row label={t("compare.metrics.score")} cells={items.map((s) => `${s.property!.score ?? "—"}/100`)} highlight />
                    <Row label={t("compare.metrics.yield")} cells={items.map((s) => (s.property!.yield_pct ? `${s.property!.yield_pct}%` : "—"))} />
                    <Row
                      label={t("compare.metrics.verdict")}
                      cells={items.map((s) => {
                        const v = s.property!.verdict as Verdict | null;
                        return v ? t(`verdicts.${v}`) : "—";
                      })}
                    />
                  </tbody>
                </table>
              </div>

              {best && (
                <div className="mt-6 rounded-3xl bg-gradient-to-br from-accent/15 via-card to-card border border-accent/30 p-6 shadow-soft">
                  <div className="text-[10px] uppercase tracking-widest text-accent font-semibold">
                    {t("compare.summary")}
                  </div>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight">{best.property!.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {best.property!.address} · score {best.property!.score ?? "—"}/100
                  </p>
                </div>
              )}
            </section>
          ) : (
            <p className="mt-6 text-sm text-muted-foreground">
              {t("compare.min")} <ArrowRight className="inline h-3 w-3" />
            </p>
          )}
        </>
      )}
    </div>
  );
}

function Row({ label, cells, highlight }: { label: string; cells: string[]; highlight?: boolean }) {
  return (
    <tr className="border-b border-border last:border-0">
      <td className="p-4 text-xs uppercase tracking-wider text-muted-foreground font-medium">{label}</td>
      {cells.map((c, i) => (
        <td key={i} className={cn("p-4 tabular-nums", highlight && "font-semibold text-accent")}>
          {c}
        </td>
      ))}
    </tr>
  );
}
