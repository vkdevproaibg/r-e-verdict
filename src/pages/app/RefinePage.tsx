import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const TYPE_KEYS = ["apartment", "house", "townhouse", "land", "commercial"] as const;
const PURPOSE_KEYS = ["live", "invest", "rent", "business"] as const;

export default function RefinePage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [type, setType] = useState<(typeof TYPE_KEYS)[number] | null>(null);
  const [area, setArea] = useState("");
  const [purpose, setPurpose] = useState<(typeof PURPOSE_KEYS)[number] | null>(null);
  const [price, setPrice] = useState("");

  const kind = params.get("kind") ?? "text";
  const q = params.get("q") ?? "";

  const proceed = (skip = false) => {
    const refineObj: Record<string, string> = {};
    if (!skip) {
      if (type) refineObj.type = type;
      if (area) refineObj.area = area;
      if (purpose) refineObj.purpose = purpose;
      if (price) refineObj.price = price;
    }
    const url = new URLSearchParams();
    url.set("kind", kind);
    if (q) url.set("q", q);
    if (purpose === "rent") url.set("purpose", "rent");
    if (Object.keys(refineObj).length > 0) {
      url.set("refine", JSON.stringify(refineObj));
    }
    navigate(`/app/analyze/loading?${url.toString()}`);
  };

  return (
    <div className="px-5 lg:px-8 py-6 lg:py-10 max-w-2xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> {t("common.back")}
      </button>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mt-4"
      >
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          {t("refine.title")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("refine.sub")}</p>
      </motion.div>

      <div className="mt-8 space-y-6">
        {/* Type */}
        <Section label={t("refine.type")}>
          <div className="flex flex-wrap gap-2">
            {TYPE_KEYS.map((k) => (
              <Pill key={k} active={type === k} onClick={() => setType(type === k ? null : k)}>
                {t(`refine.types.${k}`)}
              </Pill>
            ))}
          </div>
        </Section>

        {/* Area */}
        <Section label={t("refine.area")}>
          <Input
            value={area}
            onChange={(e) => setArea(e.target.value)}
            inputMode="numeric"
            placeholder="80"
            className="h-12 rounded-xl"
          />
        </Section>

        {/* Purpose */}
        <Section label={t("refine.purpose")}>
          <div className="flex flex-wrap gap-2">
            {PURPOSE_KEYS.map((k) => (
              <Pill key={k} active={purpose === k} onClick={() => setPurpose(purpose === k ? null : k)}>
                {t(`goals.${k}`)}
              </Pill>
            ))}
          </div>
        </Section>

        {/* Price */}
        <Section label={t("refine.price")}>
          <Input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            inputMode="numeric"
            placeholder="450000"
            className="h-12 rounded-xl"
          />
        </Section>
      </div>

      <div className="mt-10 flex flex-col gap-2">
        <Button
          onClick={() => proceed(false)}
          className="w-full h-12 rounded-xl bg-foreground text-background hover:bg-foreground/90"
        >
          {t("refine.submit")} <ArrowRight className="h-4 w-4 ml-1.5" />
        </Button>
        <Button
          onClick={() => proceed(true)}
          variant="ghost"
          className="w-full h-12 rounded-xl text-muted-foreground"
        >
          {t("refine.skip")}
        </Button>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{label}</div>
      {children}
    </div>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full px-4 py-2 text-sm font-medium border transition-colors",
        active
          ? "bg-foreground text-background border-foreground"
          : "bg-card border-border hover:border-accent/40"
      )}
    >
      {children}
    </button>
  );
}
