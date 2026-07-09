import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, RefreshCw, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAnalyses } from "@/hooks/useCloudData";
import { motion, AnimatePresence } from "framer-motion";

type Status = "active" | "sold" | "removed";
type Store = Record<string, { status: Status; at: number }>;

const KEY = "propaai_freshness";
const STALE_DAYS = 14;

function load(): Store {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "{}"); } catch { return {}; }
}
function save(s: Store) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function FreshnessNudge() {
  const { data: analyses = [] } = useAnalyses();
  const [store, setStore] = useState<Store>(() => load());
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => { save(store); }, [store]);

  const stale = useMemo(() => {
    const now = Date.now();
    return analyses.filter((a) => {
      if (dismissed.includes(a.id)) return false;
      const rec = store[a.id];
      const anchor = rec?.at ?? new Date(a.created_at).getTime();
      const ageDays = (now - anchor) / (1000 * 60 * 60 * 24);
      return ageDays >= STALE_DAYS && (!rec || rec.status === "active");
    }).slice(0, 2);
  }, [analyses, store, dismissed]);

  if (stale.length === 0) return null;

  return (
    <section className="mt-6 lg:mt-10">
      <div className="flex items-baseline gap-2 mb-3">
        <h2 className="font-serif-display text-xl tracking-tight">Проверить актуальность</h2>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Freshness</span>
      </div>
      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {stale.map((a) => {
            const raw = a.raw as { headline_ru?: string; headline_en?: string } | null;
            const title = raw?.headline_ru ?? raw?.headline_en ?? "Объект";
            const set = (status: Status) =>
              setStore((s) => ({ ...s, [a.id]: { status, at: Date.now() } }));
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3 shadow-soft"
              >
                <div className="h-9 w-9 rounded-xl bg-accent/10 grid place-items-center shrink-0">
                  <RefreshCw className="h-4 w-4 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{title}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Объект в базе больше {STALE_DAYS} дней. Всё ещё в продаже?
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => set("active")}
                    className="h-8 px-3 rounded-lg text-xs font-medium bg-verdict-green/15 text-verdict-green hover:bg-verdict-green/20 transition-colors inline-flex items-center gap-1"
                  >
                    <CheckCircle2 className="h-3 w-3" /> В продаже
                  </button>
                  <button
                    onClick={() => set("sold")}
                    className="h-8 px-3 rounded-lg text-xs font-medium bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Продан
                  </button>
                  <button
                    onClick={() => set("removed")}
                    className="h-8 px-3 rounded-lg text-xs font-medium bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Снят
                  </button>
                  <button
                    onClick={() => setDismissed((d) => [...d, a.id])}
                    className={cn("h-8 w-8 grid place-items-center rounded-lg text-muted-foreground hover:text-foreground")}
                    aria-label="Позже"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </section>
  );
}
