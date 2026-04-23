import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Stored {
  insufficient_data?: boolean;
  missing?: string[];
  headline_ru?: string;
  headline_en?: string;
  query?: string;
  input_kind?: string;
}

export default function InsufficientDataPage() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [data, setData] = useState<Stored | null>(null);
  const lang = i18n.language === "ru" ? "ru" : "en";

  useEffect(() => {
    const raw = id ? sessionStorage.getItem(`propaai_result_${id}`) : null;
    const fallback = sessionStorage.getItem("propaai_last_result");
    setData(JSON.parse(raw ?? fallback ?? "null"));
  }, [id]);

  const continueAnyway = () => navigate(`/app/result/${id}`);
  const refineMore = () =>
    navigate(
      `/app/refine?kind=${data?.input_kind ?? "text"}${
        data?.query ? `&q=${encodeURIComponent(data.query)}` : ""
      }`
    );

  return (
    <div className="px-5 lg:px-8 py-6 lg:py-10 max-w-2xl mx-auto">
      <Link
        to="/app/analyze"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> {t("nav.newAnalysis")}
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4"
      >
        <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-[10px] uppercase tracking-widest text-muted-foreground">
          <Sparkles className="h-3 w-3 text-accent" /> {t("result.confidence")}
        </div>
        <h1 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight leading-tight">
          {t("insufficient.title")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("insufficient.sub")}</p>
      </motion.div>

      {data?.missing && data.missing.length > 0 && (
        <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
            {t("insufficient.missingTitle")}
          </div>
          <ul className="space-y-2">
            {data.missing.map((m, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Three actions */}
      <div className="mt-8 space-y-3">
        {/* Deep check upsell */}
        <button
          onClick={() => {
            // MVP placeholder — count interest in console for now.
            console.log("[propa] deep_check_clicked", { id });
            continueAnyway();
          }}
          className="w-full text-left group relative overflow-hidden rounded-3xl border border-accent/30 bg-gradient-to-br from-accent/10 via-card to-card p-5 shadow-soft hover:shadow-elevated transition-all"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-widest text-accent font-semibold">
                {lang === "ru" ? "Рекомендуем" : "Recommended"}
              </div>
              <div className="mt-1 text-lg font-semibold tracking-tight">
                {t("insufficient.actions.deep", { price: 9 })}
              </div>
              <div className="mt-1 text-xs text-muted-foreground leading-relaxed">
                {t("insufficient.actions.deepHint")}
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-accent shrink-0 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        <Button
          onClick={refineMore}
          variant="secondary"
          className="w-full h-14 rounded-2xl justify-between text-base"
        >
          <span className="inline-flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {t("insufficient.actions.add")}
          </span>
          <ArrowRight className="h-4 w-4" />
        </Button>

        <Button
          onClick={continueAnyway}
          variant="ghost"
          className="w-full h-12 rounded-2xl text-muted-foreground"
        >
          {t("insufficient.actions.continue")} →
        </Button>
      </div>
    </div>
  );
}
