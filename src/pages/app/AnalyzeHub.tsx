import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Link2, Mic, FileText, Type, Sparkles, Globe } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/state/AppContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Method = "address" | "location" | "url" | "voice" | "manual" | "document" | "sources";

const methods: { key: Method; Icon: typeof MapPin; primary?: boolean }[] = [
  { key: "address", Icon: MapPin, primary: true },
  { key: "location", Icon: MapPin },
  { key: "url", Icon: Link2 },
  { key: "voice", Icon: Mic },
  { key: "manual", Icon: Type },
];

export default function AnalyzeHub() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { geo, requestGeo } = useApp();
  const [active, setActive] = useState<Method | null>(null);
  const [text, setText] = useState("");
  const [purpose, setPurpose] = useState<"buy" | "rent">("buy");
  const [area, setArea] = useState("");

  const start = (kind: string, q?: string) => {
    setActive(null);
    setText("");
    const params = new URLSearchParams();
    params.set("kind", kind);
    if (q) params.set("q", q);
    params.set("purpose", purpose);
    if (area.trim()) params.set("area", area.trim());
    navigate(`/app/analyze/loading?${params.toString()}`);
  };

  const onPick = async (m: Method) => {
    if (m === "sources") {
      const sp = new URLSearchParams();
      sp.set("purpose", purpose);
      if (area.trim()) sp.set("area", area.trim());
      navigate(`/app/analyze/sources?${sp.toString()}`);
      return;
    }
    if (m === "location") {
      if (!("geolocation" in navigator)) {
        toast.error("Geolocation unavailable");
        return;
      }
      toast.loading("Locating…", { id: "geo" });
      const fresh = await requestGeo();
      toast.dismiss("geo");
      if (!fresh) {
        toast.error("Couldn't get current location. Check browser permissions.");
        return;
      }
      const params = new URLSearchParams();
      params.set("kind", "location");
      params.set("purpose", purpose);
      if (area.trim()) params.set("area", area.trim());
      params.set("lat", String(fresh.lat));
      params.set("lng", String(fresh.lng));
      navigate(`/app/analyze/loading?${params.toString()}`);
      return;
    }
    if (m === "voice") {
      toast.info("Voice input — coming next iteration");
      return;
    }
    setActive(m);
  };

  const submitText = () => {
    if (!text.trim() || !active) return;
    start(active, text);
  };

  return (
    <div className="px-5 lg:px-8 py-6 lg:py-10 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1 text-[10px] uppercase tracking-widest text-muted-foreground">
          <Sparkles className="h-3 w-3 text-accent" />
          AI Decision Layer
        </div>
        <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">{t("analyze.title")}</h1>
        <p className="mt-2 text-base text-muted-foreground max-w-2xl">{t("analyze.sub")}</p>
      </motion.div>

      {/* Purpose + area selector */}
      <div className="mt-6 flex flex-wrap items-end gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">{t("analyze.purpose.label")}</div>
          <div className="inline-flex rounded-2xl border border-border bg-card p-1">
            {(["buy", "rent"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPurpose(p)}
                className={cn(
                  "px-4 h-10 rounded-xl text-sm font-medium transition-all",
                  purpose === p
                    ? "bg-gradient-bronze text-accent-foreground shadow-bronze"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t(`analyze.purpose.${p}`)}
              </button>
            ))}
          </div>
        </div>
        <div className="min-w-[160px]">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">{t("refine.area")}</div>
          <Input
            value={area}
            onChange={(e) => setArea(e.target.value.replace(/[^\d.,]/g, ""))}
            inputMode="decimal"
            placeholder="80"
            className="h-10 rounded-xl"
          />
        </div>
      </div>

      {/* Hero — Address */}
      <div className="mt-6">
        <MethodCard method={methods[0]} index={0} onClick={() => onPick("address")} large />
      </div>

      {/* Sources — featured second-tier hero, works for buy + rent */}
      <div className="mt-3">
        <MethodCard
          method={{ key: "sources", Icon: Globe, primary: true }}
          index={1}
          onClick={() => onPick("sources")}
          wide
          accent
        />
      </div>

      {/* Other methods grid */}
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {methods.slice(1).map((m, i) => (
          <MethodCard key={m.key} method={m} index={i + 2} onClick={() => onPick(m.key)} />
        ))}
      </div>

      <div className="mt-3">
        <MethodCard
          method={{ key: "document", Icon: FileText }}
          index={6}
          onClick={() => onPick("document")}
          wide
        />
      </div>

      <Sheet open={!!active && active !== "location" && active !== "voice" && active !== "sources"} onOpenChange={(o) => !o && setActive(null)}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>{active && t(`analyze.methods.${active}.title`)}</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-3 max-w-md mx-auto">
            {active === "url" || active === "address" ? (
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={
                  active === "url"
                    ? "https://www.zillow.com/homedetails/..."
                    : "123 Main St, Brooklyn NY 11201"
                }
                className="h-12 rounded-xl"
                autoFocus
              />
            ) : active === "document" ? (
              <div className="rounded-2xl border-2 border-dashed border-border p-10 text-center">
                <div className="h-12 w-12 rounded-2xl bg-secondary mx-auto grid place-items-center">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="mt-3 text-sm font-medium">Drop file here</div>
                <div className="mt-1 text-xs text-muted-foreground">Upload coming next iteration</div>
              </div>
            ) : (
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Describe the property…"
                className="rounded-xl min-h-[120px]"
                autoFocus
              />
            )}
            <Button
              onClick={() => {
                if (active === "document") {
                  start(active, "Sample property");
                  return;
                }
                submitText();
              }}
              disabled={active !== "document" && !text.trim()}
              className="w-full h-12 rounded-xl bg-gradient-bronze text-accent-foreground shadow-bronze hover:opacity-90 font-semibold"
            >
              {t("analyze.start")} <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function MethodCard({
  method,
  index,
  onClick,
  wide,
  large,
  accent,
}: {
  method: { key: Method; Icon: typeof MapPin; primary?: boolean };
  index: number;
  onClick: () => void;
  wide?: boolean;
  large?: boolean;
  accent?: boolean;
}) {
  const { t } = useTranslation();
  const { Icon, key, primary } = method;
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.05 + index * 0.04 }}
      onClick={onClick}
      className={cn(
        "group text-left rounded-3xl border bg-card hover:shadow-elevated hover:-translate-y-0.5 transition-all",
        large
          ? "p-6 lg:p-7 border-accent/30 ring-1 ring-accent/10 hover:border-accent/50"
          : accent
          ? "p-5 border-accent/40 ring-1 ring-accent/10 bg-gradient-to-br from-card to-accent/[0.04] hover:border-accent/60"
          : "p-5 border-border hover:border-accent/40",
        wide && "w-full"
      )}
    >
      <div className={cn(
        "gap-3",
        large || wide
          ? "flex items-start gap-4"
          : "flex flex-col items-start sm:flex-row sm:items-start sm:gap-4"
      )}>
        <div
          className={cn(
            "rounded-2xl grid place-items-center shrink-0",
            large ? "h-12 w-12 bg-gradient-bronze shadow-bronze" : primary ? "h-11 w-11 bg-gradient-bronze shadow-bronze" : "h-11 w-11 bg-secondary"
          )}
        >
          <Icon className={cn(large || primary ? "h-5 w-5 text-accent-foreground" : "h-5 w-5 text-foreground")} />
        </div>
        <div className="flex-1 min-w-0 w-full">
          <div className={cn("font-semibold tracking-tight leading-tight break-words", large ? "text-lg" : "text-[15px]")}>
            {t(`analyze.methods.${key}.title`)}
          </div>
          <div className="mt-1 text-xs text-muted-foreground leading-relaxed break-words">
            {t(`analyze.methods.${key}.desc`)}
          </div>
        </div>
        {(large || wide) && (
          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all mt-1" />
        )}
      </div>
    </motion.button>
  );
}
