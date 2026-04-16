import { ScreenHeader } from "@/components/TabShell";
import { Camera, MapPin, Link2, Mic, Type, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/state/AppContext";

const inputs = [
  { Icon: Camera, ru: "Сфотографировать", en: "Camera", desc: "Фасад, документы, окрестности" },
  { Icon: MapPin, ru: "Текущая локация", en: "Current location", desc: "Анализ по координатам" },
  { Icon: Link2, ru: "Ссылка на листинг", en: "Listing URL", desc: "Bayut, Property Finder, OLX…" },
  { Icon: Type, ru: "Адрес", en: "Address", desc: "Введите адрес или район" },
  { Icon: Mic, ru: "Голос", en: "Voice", desc: "Опишите словами что ищете" },
];

export default function Analyze() {
  const { geo } = useApp();
  return (
    <div className="animate-fade-in">
      <ScreenHeader ru="Анализ" en="Analyze" />

      <div className="px-5">
        <div className="rounded-2xl bg-gradient-charcoal p-5 text-background shadow-elevated">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-background/60">
            <Sparkles className="h-3 w-3" />
            AI Verdict Engine
          </div>
          <h2 className="text-2xl font-semibold mt-2 leading-tight">
            Купить, торговаться,
            <br />
            <span className="text-accent">или пройти мимо?</span>
          </h2>
          <p className="text-sm text-background/70 mt-2">
            Выберите способ ввода — получите вердикт за 30 секунд.
          </p>
        </div>
      </div>

      <div className="px-5 mt-4 space-y-2">
        {inputs.map(({ Icon, ru, en, desc }) => (
          <button
            key={en}
            className="w-full text-left rounded-2xl border border-border bg-card p-4 hover:border-accent/40 hover:shadow-soft hover:-translate-y-0.5 transition-all flex items-center gap-3"
          >
            <div className="h-11 w-11 rounded-xl bg-secondary grid place-items-center shrink-0">
              <Icon className="h-5 w-5 text-foreground" />
            </div>
            <div className="flex-1">
              <div className="font-medium leading-tight">{ru}</div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-0.5">
                {en} · {desc}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="px-5 mt-6">
        <Button
          size="lg"
          disabled={!geo}
          className="w-full h-12 bg-accent text-accent-foreground hover:bg-accent/90 shadow-bronze"
        >
          {geo ? "Анализ по моей локации" : "Нет геолокации — разрешите доступ"}
          <span className="ml-1.5 text-xs opacity-70">Analyze here</span>
        </Button>
      </div>
    </div>
  );
}
