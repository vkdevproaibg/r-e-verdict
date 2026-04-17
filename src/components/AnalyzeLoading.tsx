import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { db } from "@/integrations/supabase/db";
import { useApp } from "@/state/AppContext";
import { Sparkles, Loader2 } from "lucide-react";
import { TopBar } from "@/components/TopBar";

const STAGES = [
  { ru: "Сбор данных", en: "Gathering data" },
  { ru: "Анализ комплов", en: "Analyzing comps" },
  { ru: "Проверка рисков", en: "Checking risks" },
  { ru: "Формирование вердикта", en: "Composing verdict" },
];

export default function AnalyzeLoading({ mode }: { mode: "agent" | "buyer" }) {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { geo } = useApp();
  const [stage, setStage] = useState(0);
  const startedRef = useRef(false);

  const kind = params.get("kind") ?? "text";
  const q = params.get("q") ?? "";

  useEffect(() => {
    const t = setInterval(() => setStage((s) => Math.min(s + 1, STAGES.length - 1)), 900);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    (async () => {
      try {
        const { data, error } = await db.functions.invoke("analyze", {
          body: {
            kind,
            query: q,
            lat: geo?.lat,
            lng: geo?.lng,
          },
        });
        if (error) throw error;

        sessionStorage.setItem("propaai_last_result", JSON.stringify({
          ...data,
          input_kind: kind,
          query: q,
          lat: geo?.lat,
          lng: geo?.lng,
        }));
        navigate(`/${mode}/analyze/result`, { replace: true });
      } catch (e) {
        console.error("analyze error:", e);
        sessionStorage.setItem("propaai_last_result", JSON.stringify({
          error: String(e),
          verdict: "yellow",
          score: 50,
          confidence: 30,
          headline_ru: "Не удалось проанализировать",
          headline_en: "Analysis failed",
          reasons: [],
          red_flags: [],
          next_steps: [],
        }));
        navigate(`/${mode}/analyze/result`, { replace: true });
      }
    })();
  }, [geo, kind, q, mode, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar subtitle={mode === "agent" ? "Agent mode" : "Buyer mode"} />
      <div className="flex-1 grid place-items-center px-6">
        <div className="text-center max-w-sm">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-bronze grid place-items-center shadow-bronze mb-6">
            <Sparkles className="h-7 w-7 text-accent-foreground" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Анализируем</h1>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">Analyzing…</p>
          <div className="mt-8 space-y-3 text-left">
            {STAGES.map((s, i) => (
              <div key={s.en} className="flex items-center gap-3">
                <div className={`h-7 w-7 rounded-full grid place-items-center transition-all
                  ${i < stage ? "bg-verdict-green/15 text-verdict-green" :
                    i === stage ? "bg-accent/15 text-accent" : "bg-secondary text-muted-foreground"}`}>
                  {i === stage ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> :
                    i < stage ? <span className="text-xs">✓</span> : <span className="text-xs">·</span>}
                </div>
                <div className={i <= stage ? "text-foreground" : "text-muted-foreground"}>
                  <div className="text-sm font-medium leading-tight">{s.ru}</div>
                  <div className="text-[10px] uppercase tracking-wider opacity-60">{s.en}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
