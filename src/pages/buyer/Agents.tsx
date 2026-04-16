import { ScreenHeader } from "@/components/TabShell";
import { Phone, MessageCircle } from "lucide-react";

const agents = [
  { name: "Дмитрий Власов", agency: "Aurum Realty", count: 12, rating: 4.9 },
  { name: "Sarah Chen", agency: "Marina Estates", count: 8, rating: 4.8 },
];

export default function Agents() {
  return (
    <div className="animate-fade-in">
      <ScreenHeader ru="Агенты" en="Agents" />
      <div className="px-5 space-y-3">
        {agents.map((a) => (
          <div key={a.name} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-bronze grid place-items-center text-accent-foreground font-semibold">
                {a.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold tracking-tight truncate">{a.name}</div>
                <div className="text-xs text-muted-foreground">{a.agency} · ★ {a.rating}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold leading-none text-accent">{a.count}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">Объектов</div>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button className="flex-1 h-9 rounded-lg bg-secondary text-foreground text-sm font-medium hover:bg-secondary/70 transition-colors inline-flex items-center justify-center gap-1.5">
                <MessageCircle className="h-3.5 w-3.5" /> Написать
              </button>
              <button className="flex-1 h-9 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors inline-flex items-center justify-center gap-1.5">
                <Phone className="h-3.5 w-3.5" /> Позвонить
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
