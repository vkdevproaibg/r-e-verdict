import { useMemo, useState } from "react";
import { PropertyMap } from "@/components/PropertyMap";
import { Sliders, Play, X, Heart, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProperties, useToggleSave, useSaved, type Verdict, type Goal } from "@/hooks/useCloudData";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useApp } from "@/state/AppContext";
import { cn } from "@/lib/utils";

const verdictLabel: Record<Verdict, { ru: string; en: string }> = {
  green: { ru: "Покупать", en: "Strong buy" },
  yellow: { ru: "Торговаться", en: "Negotiate" },
  red: { ru: "Пройти мимо", en: "Avoid" },
};

const goalLabel: Record<Goal, string> = {
  live: "Жить", invest: "Инвест", rent: "Аренда", business: "Коммерция",
};

export default function BuyerMap() {
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selId, setSelId] = useState<string | null>(null);
  const { goal: appGoal } = useApp();

  // Default goal from onboarding once
  useMemo(() => {
    if (!goal && appGoal) setGoal(appGoal as Goal);
  }, [appGoal, goal]);

  const { data: properties = [] } = useProperties({ verdict, goal });
  const { data: saved = [] } = useSaved();
  const toggleSave = useToggleSave();

  const fmt = (n: number, ccy = "AED") =>
    new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n) + " " + ccy;

  const pins = useMemo(
    () =>
      properties
        .filter((p) => p.lat && p.lng)
        .map((p) => ({
          id: p.id,
          lat: p.lat,
          lng: p.lng,
          verdict: (p.verdict ?? "yellow") as Verdict,
          price: p.price >= 1_000_000 ? `${(p.price / 1_000_000).toFixed(1)}M` : `${Math.round(p.price / 1000)}k`,
        })),
    [properties]
  );

  const selected = properties.find((p) => p.id === selId);
  const isSaved = !!saved.find((s) => s.property_id === selId);

  return (
    <div className="relative h-[calc(100vh-3.5rem-5rem)]">
      <PropertyMap pins={pins} onPinClick={setSelId} />

      {/* Top bar */}
      <div className="absolute top-4 left-4 right-4 z-[500] flex items-center justify-between gap-2 pointer-events-none">
        <div className="glass-card rounded-2xl px-4 py-2.5 inline-flex items-center gap-2 pointer-events-auto">
          <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
          <div>
            <div className="text-sm font-semibold leading-tight">{pins.length} объектов</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Nearby properties
            </div>
          </div>
        </div>
        <button
          onClick={() => setFiltersOpen(true)}
          className="glass-card h-11 w-11 rounded-2xl grid place-items-center pointer-events-auto hover:border-accent/40 transition-colors"
          aria-label="Filters"
        >
          <Sliders className="h-4 w-4" />
        </button>
      </div>

      {/* Active filter chips */}
      {(verdict || goal) && (
        <div className="absolute top-20 left-4 right-4 z-[500] flex gap-2 pointer-events-none">
          {goal && (
            <Chip onClear={() => setGoal(null)}>{goalLabel[goal]}</Chip>
          )}
          {verdict && (
            <Chip onClear={() => setVerdict(null)}>
              <span className={cn("h-1.5 w-1.5 rounded-full inline-block mr-1.5",
                verdict === "green" ? "bg-verdict-green" :
                verdict === "yellow" ? "bg-verdict-yellow" : "bg-verdict-red")} />
              {verdictLabel[verdict].ru}
            </Chip>
          )}
        </div>
      )}

      {/* Bottom sheet — property detail */}
      {selected && (
        <div className="absolute bottom-0 left-0 right-0 z-[600] animate-slide-up">
          <div className="mx-3 mb-3 rounded-3xl bg-card border border-border shadow-elevated overflow-hidden">
            <div className="flex justify-center pt-2.5 pb-1">
              <div className="h-1 w-10 rounded-full bg-border" />
            </div>
            <div className="px-5 pb-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn("h-2 w-2 rounded-full",
                      selected.verdict === "green" ? "bg-verdict-green" :
                      selected.verdict === "yellow" ? "bg-verdict-yellow" : "bg-verdict-red")} />
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                      {selected.verdict ? verdictLabel[selected.verdict as Verdict].en : "Pending"}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mt-1.5 tracking-tight truncate">{selected.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {selected.address}
                  </p>
                </div>
                <button
                  onClick={() => setSelId(null)}
                  className="h-8 w-8 grid place-items-center rounded-full hover:bg-secondary transition-colors shrink-0"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <Stat label="Цена" en="Price" value={fmt(selected.price, selected.currency)} />
                <Stat label="Скор" en="Score" value={String(selected.score ?? "—")} highlight />
                <Stat
                  label="Доходность"
                  en="Yield"
                  value={selected.yield_pct ? `${selected.yield_pct}%` : "—"}
                />
              </div>

              {selected.description && (
                <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{selected.description}</p>
              )}

              <div className="mt-4 flex gap-2">
                <Button
                  variant={isSaved ? "default" : "secondary"}
                  className={cn("h-11 rounded-xl", isSaved && "bg-accent text-accent-foreground hover:bg-accent/90")}
                  onClick={() =>
                    toggleSave.mutate({ propertyId: selected.id, save: !isSaved })
                  }
                  aria-label={isSaved ? "Remove from saved" : "Save"}
                >
                  <Heart className={cn("h-4 w-4", isSaved && "fill-current")} />
                </Button>
                <Button variant="secondary" className="flex-1 h-11 rounded-xl">
                  <Play className="h-4 w-4 mr-1.5 fill-current" />
                  Видео
                </Button>
                <Button className="flex-1 h-11 rounded-xl bg-foreground text-background hover:bg-foreground/90">
                  <Phone className="h-4 w-4 mr-1.5" />
                  Связаться
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters Sheet */}
      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>Фильтры · Filters</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-5">
            <FilterGroup
              ru="Цель" en="Goal"
              options={[
                { value: null, label: "Все" },
                { value: "live", label: "Жить" },
                { value: "invest", label: "Инвест" },
                { value: "rent", label: "Аренда" },
                { value: "business", label: "Коммерция" },
              ]}
              value={goal}
              onChange={(v) => setGoal(v as Goal | null)}
            />
            <FilterGroup
              ru="Вердикт" en="Verdict"
              options={[
                { value: null, label: "Все" },
                { value: "green", label: "Покупать", dot: "bg-verdict-green" },
                { value: "yellow", label: "Торг", dot: "bg-verdict-yellow" },
                { value: "red", label: "Мимо", dot: "bg-verdict-red" },
              ]}
              value={verdict}
              onChange={(v) => setVerdict(v as Verdict | null)}
            />
            <Button
              className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 rounded-xl"
              onClick={() => setFiltersOpen(false)}
            >
              Показать ({pins.length})
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Chip({ children, onClear }: { children: React.ReactNode; onClear: () => void }) {
  return (
    <div className="glass-card rounded-full pl-3 pr-1 py-1 inline-flex items-center gap-1.5 pointer-events-auto text-xs font-medium">
      {children}
      <button onClick={onClear} className="h-5 w-5 grid place-items-center rounded-full hover:bg-secondary">
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

function Stat({ label, en, value, highlight }: { label: string; en: string; value: string; highlight?: boolean }) {
  return (
    <div className={cn("rounded-xl border border-border p-2.5",
      highlight ? "bg-accent/5 border-accent/30" : "bg-secondary/40")}>
      <div className={cn("text-base font-semibold leading-none truncate", highlight && "text-accent")}>{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">{label}</div>
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground/70">{en}</div>
    </div>
  );
}

function FilterGroup<T extends string | null>({
  ru, en, options, value, onChange,
}: {
  ru: string; en: string;
  options: { value: T; label: string; dot?: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-2">
        <div className="text-sm font-semibold">{ru}</div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{en}</div>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={String(o.value)}
            onClick={() => onChange(o.value)}
            className={cn(
              "rounded-full px-3.5 py-2 text-xs font-medium border transition-colors",
              value === o.value
                ? "bg-foreground text-background border-foreground"
                : "bg-card border-border hover:border-accent/40"
            )}
          >
            {o.dot && <span className={cn("h-1.5 w-1.5 rounded-full inline-block mr-1.5", o.dot)} />}
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
