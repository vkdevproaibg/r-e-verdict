import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  MapPin,
  Camera,
  Link2,
  Type,
  FileText,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/state/AppContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Method = "location" | "photo" | "url" | "manual" | "document";

const methods: {
  key: Method;
  Icon: typeof MapPin;
  size: "lg" | "md";
}[] = [
  { key: "location", Icon: MapPin, size: "lg" },
  { key: "photo", Icon: Camera, size: "lg" },
  { key: "url", Icon: Link2, size: "lg" },
  { key: "manual", Icon: Type, size: "lg" },
  { key: "document", Icon: FileText, size: "md" },
];

export default function AnalyzeHub() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { geo, requestGeo } = useApp();
  const [active, setActive] = useState<Method | null>(null);
  const [text, setText] = useState("");

  const start = (kind: string, q?: string) => {
    const url = `/app/analyze/loading?kind=${kind}${q ? `&q=${encodeURIComponent(q)}` : ""}`;
    setActive(null);
    setText("");
    navigate(url);
  };

  const onPick = async (m: Method) => {
    if (m === "location") {
      if (!geo) await requestGeo();
      if (!navigator.geolocation) {
        toast.error("Geolocation unavailable");
        return;
      }
      start("location");
      return;
    }
    setActive(m);
  };

  const submitText = () => {
    if (!text.trim() || !active) return;
    start(active, text);
  };

  return (
    <div className="px-5 lg:px-8 py-8 lg:py-12 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1 text-[10px] uppercase tracking-widest text-muted-foreground">
          <Sparkles className="h-3 w-3 text-accent" />
          AI Verdict Engine
        </div>
        <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
          {t("analyze.title")}
        </h1>
        <p className="mt-2 text-base text-muted-foreground max-w-2xl">
          {t("analyze.sub")}
        </p>
      </motion.div>

      {/* 2x2 grid */}
      <div className="mt-8 grid sm:grid-cols-2 gap-3 sm:gap-4">
        {methods.slice(0, 4).map((m, i) => (
          <MethodCard key={m.key} method={m} index={i} onClick={() => onPick(m.key)} />
        ))}
      </div>

      {/* 5th — document upload */}
      <div className="mt-3 sm:mt-4">
        <MethodCard method={methods[4]} index={4} onClick={() => onPick("document")} wide />
      </div>

      {/* Input sheets */}
      <Sheet open={!!active && active !== "location"} onOpenChange={(o) => !o && setActive(null)}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>
              {active && t(`analyze.methods.${active}.title`)}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-3 max-w-md mx-auto">
            {active === "url" || active === "manual" ? (
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
            ) : active === "photo" || active === "document" ? (
              <div className="rounded-2xl border-2 border-dashed border-border p-10 text-center">
                <div className="h-12 w-12 rounded-2xl bg-secondary mx-auto grid place-items-center">
                  {active === "photo" ? (
                    <Camera className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="mt-3 text-sm font-medium">Drop file here</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Upload coming next iteration
                </div>
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
                if (active === "photo" || active === "document") {
                  start(active, "Sample property");
                  return;
                }
                submitText();
              }}
              disabled={
                active !== "photo" && active !== "document" && !text.trim()
              }
              className="w-full h-12 rounded-xl bg-foreground text-background hover:bg-foreground/90"
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
}: {
  method: { key: Method; Icon: typeof MapPin; size: "lg" | "md" };
  index: number;
  onClick: () => void;
  wide?: boolean;
}) {
  const { t } = useTranslation();
  const { Icon, key } = method;
  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.05 + index * 0.05 }}
      onClick={onClick}
      className={cn(
        "group text-left rounded-3xl border border-border bg-card p-6 lg:p-7 hover:border-accent/40 hover:shadow-elevated hover:-translate-y-0.5 transition-all",
        wide ? "w-full" : ""
      )}
    >
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-2xl bg-gradient-bronze grid place-items-center shrink-0 shadow-bronze">
          <Icon className="h-5 w-5 text-accent-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-lg font-semibold tracking-tight leading-tight">
            {t(`analyze.methods.${key}.title`)}
          </div>
          <div className="mt-1 text-sm text-muted-foreground leading-relaxed">
            {t(`analyze.methods.${key}.desc`)}
          </div>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all mt-1" />
      </div>
    </motion.button>
  );
}
