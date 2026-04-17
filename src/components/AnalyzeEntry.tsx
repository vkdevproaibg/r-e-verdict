import { ScreenHeader } from "@/components/TabShell";
import { Camera, MapPin, Link2, Mic, Type, Sparkles, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/state/AppContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSaveAnalysis } from "@/hooks/useCloudData";
import { toast } from "sonner";

type Mode = "agent" | "buyer";
type InputKind = "photo" | "location" | "address" | "link" | "text" | "voice" | "document";

const inputs: { kind: InputKind; Icon: typeof Camera; ru: string; en: string; desc: string }[] = [
  { kind: "photo", Icon: Camera, ru: "Сфотографировать", en: "Camera", desc: "Фасад, документы, окрестности" },
  { kind: "location", Icon: MapPin, ru: "Текущая локация", en: "Current location", desc: "Анализ по координатам" },
  { kind: "link", Icon: Link2, ru: "Ссылка на листинг", en: "Listing URL", desc: "Bayut, Property Finder, OLX…" },
  { kind: "address", Icon: Type, ru: "Адрес", en: "Address", desc: "Введите адрес или район" },
  { kind: "voice", Icon: Mic, ru: "Голос", en: "Voice", desc: "Опишите словами что ищете" },
  { kind: "document", Icon: FileText, ru: "Документ", en: "Document", desc: "PDF, контракт, выписка" },
];

export function AnalyzeEntry({ mode }: { mode: Mode }) {
  const { geo, requestGeo } = useApp();
  const navigate = useNavigate();
  const [active, setActive] = useState<InputKind | null>(null);
  const [text, setText] = useState("");
  const saveAnalysis = useSaveAnalysis();

  const goWithLocation = async () => {
    if (!geo) await requestGeo();
    if (!navigator.geolocation) {
      toast.error("Геолокация недоступна");
      return;
    }
    navigate(`/${mode}/analyze/loading?kind=location`);
  };

  const submitText = () => {
    if (!text.trim()) return;
    setActive(null);
    navigate(`/${mode}/analyze/loading?kind=${active}&q=${encodeURIComponent(text)}`);
    setText("");
  };

  const onPick = (kind: InputKind) => {
    if (kind === "location") return goWithLocation();
    setActive(kind);
  };

  const placeholder: Record<InputKind, string> = {
    photo: "", location: "",
    address: "Например: Dubai Marina, Tower 3",
    link: "https://www.bayut.com/property/...",
    text: "Опишите что ищете…",
    voice: "Опишите словами…",
    document: "Вставьте текст из документа…",
  };

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
        {inputs.map(({ kind, Icon, ru, en, desc }) => (
          <button
            key={kind}
            onClick={() => onPick(kind)}
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
          onClick={goWithLocation}
          className="w-full h-12 bg-accent text-accent-foreground hover:bg-accent/90 shadow-bronze"
        >
          {geo ? "Анализ по моей локации" : "Разрешить геолокацию"}
          <span className="ml-1.5 text-xs opacity-70">Analyze here</span>
        </Button>
      </div>

      <Sheet open={!!active && active !== "location" && active !== "photo"} onOpenChange={(o) => !o && setActive(null)}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>
              {inputs.find((i) => i.kind === active)?.ru} ·{" "}
              <span className="text-muted-foreground text-xs uppercase tracking-wider">
                {inputs.find((i) => i.kind === active)?.en}
              </span>
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-3">
            {active === "address" || active === "link" ? (
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={active ? placeholder[active] : ""}
                className="h-12 rounded-xl"
                autoFocus
              />
            ) : (
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={active ? placeholder[active] : ""}
                className="rounded-xl min-h-[120px]"
                autoFocus
              />
            )}
            <Button
              onClick={submitText}
              disabled={!text.trim()}
              className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 rounded-xl"
            >
              Анализировать
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={active === "photo"} onOpenChange={(o) => !o && setActive(null)}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>Камера / Photo</SheetTitle>
          </SheetHeader>
          <div className="mt-6 text-center py-12">
            <Camera className="h-10 w-10 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground mt-3">
              Загрузка фото будет в следующей итерации.<br />
              <span className="text-xs">Photo upload coming soon.</span>
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
