import { useMemo, useState } from "react";
import { PropertyMap } from "@/components/PropertyMap";
import { useApp } from "@/state/AppContext";
import { Sliders, Play, X, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Sample {
  id: string;
  lat: number;
  lng: number;
  verdict: "green" | "yellow" | "red";
  price: string;
  hasVideo?: boolean;
  title: string;
  meta: string;
}

export default function BuyerMap() {
  const { geo } = useApp();
  const [sel, setSel] = useState<string | null>(null);

  const pins: Sample[] = useMemo(() => {
    if (!geo) return [];
    const offsets = [
      { dx: 0.005, dy: 0.003, verdict: "green" as const, price: "$420k", hasVideo: true, title: "Marina View · 2BR", meta: "78 м² · 12 этаж · Yield 7.8%" },
      { dx: -0.004, dy: 0.006, verdict: "yellow" as const, price: "$310k", title: "Studio Downtown", meta: "42 м² · нужен торг" },
      { dx: 0.008, dy: -0.005, verdict: "red" as const, price: "$590k", title: "Old Tower · 3BR", meta: "Перегрев цены +18%" },
      { dx: -0.007, dy: -0.002, verdict: "green" as const, price: "$275k", hasVideo: true, title: "Greens · 1BR", meta: "Сильная ликвидность" },
    ];
    return offsets.map((o, i) => ({
      id: String(i),
      lat: geo.lat + o.dy,
      lng: geo.lng + o.dx,
      verdict: o.verdict,
      price: o.price,
      hasVideo: o.hasVideo,
      title: o.title,
      meta: o.meta,
    }));
  }, [geo]);

  const selected = pins.find((p) => p.id === sel);

  return (
    <div className="relative h-[calc(100vh-3.5rem-5rem)]">
      <PropertyMap pins={pins} onPinClick={setSel} />

      <div className="absolute top-4 left-4 right-4 z-[500] flex items-center justify-between gap-2 pointer-events-none">
        <div className="glass-card rounded-2xl px-4 py-2.5 inline-flex items-center gap-2 pointer-events-auto">
          <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
          <div>
            <div className="text-sm font-semibold leading-tight">Объекты рядом</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Nearby properties
            </div>
          </div>
        </div>
        <button className="glass-card h-11 w-11 rounded-2xl grid place-items-center pointer-events-auto hover:border-accent/40 transition-colors">
          <Sliders className="h-4 w-4" />
        </button>
      </div>

      {/* Bottom sheet */}
      {selected && (
        <div className="absolute bottom-0 left-0 right-0 z-[600] animate-slide-up">
          <div className="mx-3 mb-3 rounded-3xl bg-card border border-border shadow-elevated overflow-hidden">
            <div className="flex justify-center pt-2.5 pb-1">
              <div className="h-1 w-10 rounded-full bg-border" />
            </div>
            <div className="px-5 pb-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${
                      selected.verdict === "green" ? "bg-verdict-green" :
                      selected.verdict === "yellow" ? "bg-verdict-yellow" : "bg-verdict-red"
                    }`} />
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                      {selected.verdict === "green" ? "Strong buy" : selected.verdict === "yellow" ? "Negotiate" : "Avoid"}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mt-1.5 tracking-tight">{selected.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{selected.meta}</p>
                </div>
                <button
                  onClick={() => setSel(null)}
                  className="h-8 w-8 grid place-items-center rounded-full hover:bg-secondary transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <Stat label="Цена" en="Price" value={selected.price} />
                <Stat label="Скор" en="Score" value="84" highlight />
                <Stat label="Уверенность" en="Conf." value="High" />
              </div>

              <div className="mt-4 flex gap-2">
                {selected.hasVideo && (
                  <Button variant="secondary" className="flex-1 h-11 rounded-xl">
                    <Play className="h-4 w-4 mr-1.5 fill-current" />
                    Видео
                  </Button>
                )}
                <Button className="flex-1 h-11 rounded-xl bg-foreground text-background hover:bg-foreground/90">
                  <Phone className="h-4 w-4 mr-1.5" />
                  Связаться
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, en, value, highlight }: { label: string; en: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border border-border p-2.5 ${highlight ? "bg-accent/5 border-accent/30" : "bg-secondary/40"}`}>
      <div className={`text-lg font-semibold leading-none ${highlight ? "text-accent" : ""}`}>{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">{label}</div>
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground/70">{en}</div>
    </div>
  );
}
