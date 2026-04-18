import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import { db } from "@/integrations/supabase/db";
import { useApp } from "@/state/AppContext";

export default function AnalyzeLoadingPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { geo } = useApp();
  const { t, i18n } = useTranslation();
  const [stage, setStage] = useState(0);
  const startedRef = useRef(false);

  const stages = [
    { en: "Gathering data", ru: "Сбор данных" },
    { en: "Analyzing comps", ru: "Анализ комплов" },
    { en: "Checking risks", ru: "Проверка рисков" },
    { en: "Composing verdict", ru: "Формирование вердикта" },
  ];

  const kind = params.get("kind") ?? "text";
  const q = params.get("q") ?? "";

  useEffect(() => {
    const t = setInterval(() => setStage((s) => Math.min(s + 1, stages.length - 1)), 900);
    return () => clearInterval(t);
  }, [stages.length]);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    (async () => {
      const id = `analysis_${Date.now()}`;
      try {
        const { data, error } = await db.functions.invoke("analyze", {
          body: { kind, query: q, lat: geo?.lat, lng: geo?.lng },
        });
        if (error) throw error;
        sessionStorage.setItem(
          `propaai_result_${id}`,
          JSON.stringify({ ...data, input_kind: kind, query: q })
        );
        sessionStorage.setItem("propaai_last_result", JSON.stringify({ ...data, input_kind: kind, query: q }));
        navigate(`/app/result/${id}`, { replace: true });
      } catch (e) {
        console.error("analyze error:", e);
        const fallback = {
          error: String(e),
          verdict: "yellow" as const,
          score: 50,
          confidence: 30,
          headline_ru: "Не удалось проанализировать",
          headline_en: "Analysis failed",
          reasons: [],
          red_flags: [],
          next_steps: [],
        };
        sessionStorage.setItem(`propaai_result_${id}`, JSON.stringify(fallback));
        sessionStorage.setItem("propaai_last_result", JSON.stringify(fallback));
        navigate(`/app/result/${id}`, { replace: true });
      }
    })();
  }, [geo, kind, q, navigate]);

  const lang = i18n.language === "ru" ? "ru" : "en";

  return (
    <div className="min-h-[80vh] grid place-items-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="text-center max-w-sm"
      >
        <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-bronze grid place-items-center shadow-bronze mb-6">
          <Sparkles className="h-7 w-7 text-accent-foreground" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {lang === "ru" ? "Анализируем" : "Analyzing"}
        </h1>
        <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
          {t("brand.tagline")}
        </p>
        <div className="mt-8 space-y-3 text-left">
          {stages.map((s, i) => (
            <motion.div
              key={s.en}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3"
            >
              <div
                className={`h-7 w-7 rounded-full grid place-items-center transition-all ${
                  i < stage
                    ? "bg-verdict-green/15 text-verdict-green"
                    : i === stage
                    ? "bg-accent/15 text-accent"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {i === stage ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : i < stage ? (
                  <span className="text-xs">✓</span>
                ) : (
                  <span className="text-xs">·</span>
                )}
              </div>
              <div className={i <= stage ? "text-foreground" : "text-muted-foreground"}>
                <div className="text-sm font-medium leading-tight">{s[lang]}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
