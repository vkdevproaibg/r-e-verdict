import { PropertyMap } from "@/components/PropertyMap";
import { useApp } from "@/state/AppContext";
import { useMemo } from "react";

export default function AgentMap() {
  const { geo } = useApp();

  const pins = useMemo(() => {
    if (!geo) return [];
    const offsets = [
      { dx: 0.005, dy: 0.003, verdict: "green" as const, price: "$420k", hasVideo: true },
      { dx: -0.004, dy: 0.006, verdict: "yellow" as const, price: "$310k" },
      { dx: 0.008, dy: -0.005, verdict: "red" as const, price: "$590k" },
      { dx: -0.007, dy: -0.002, verdict: "green" as const, price: "$275k", hasVideo: true },
    ];
    return offsets.map((o, i) => ({
      id: String(i),
      lat: geo.lat + o.dy,
      lng: geo.lng + o.dx,
      verdict: o.verdict,
      price: o.price,
      hasVideo: o.hasVideo,
    }));
  }, [geo]);

  return (
    <div className="relative h-[calc(100vh-3.5rem-5rem)]">
      <PropertyMap pins={pins} />
      <div className="absolute top-4 left-4 right-4 z-[500] pointer-events-none">
        <div className="glass-card rounded-2xl px-4 py-2.5 inline-flex items-center gap-2 pointer-events-auto">
          <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
          <div>
            <div className="text-sm font-semibold leading-tight">Карта объектов</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Properties · {pins.length} pins
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
