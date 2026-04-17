import { useMemo, useState } from "react";
import { PropertyMap } from "@/components/PropertyMap";
import { useProperties, type Verdict } from "@/hooks/useCloudData";
import { Sliders } from "lucide-react";

export default function AgentMap() {
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const { data: properties = [] } = useProperties({ verdict });

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

  return (
    <div className="relative h-[calc(100vh-3.5rem-5rem)]">
      <PropertyMap pins={pins} />
      <div className="absolute top-4 left-4 right-4 z-[500] flex items-center justify-between gap-2 pointer-events-none">
        <div className="glass-card rounded-2xl px-4 py-2.5 inline-flex items-center gap-2 pointer-events-auto">
          <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
          <div>
            <div className="text-sm font-semibold leading-tight">Объекты на карте</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Properties · {pins.length} pins
            </div>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-1 pointer-events-auto flex gap-1">
          {(["green", "yellow", "red"] as Verdict[]).map((v) => (
            <button
              key={v}
              onClick={() => setVerdict(verdict === v ? null : v)}
              className={`h-9 w-9 rounded-xl grid place-items-center transition-colors ${
                verdict === v ? "bg-foreground" : ""
              }`}
              aria-label={`Filter ${v}`}
            >
              <span className={`h-2.5 w-2.5 rounded-full ${
                v === "green" ? "bg-verdict-green" :
                v === "yellow" ? "bg-verdict-yellow" : "bg-verdict-red"
              }`} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
