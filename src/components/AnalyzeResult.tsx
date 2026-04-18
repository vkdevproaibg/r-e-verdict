import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowLeft, Save, Share2, GitCompare, FileDown, AlertTriangle, CheckCircle2, Copy, MessageSquareQuote, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSaveAnalysis, useClients, useCreateAssignment, type Verdict } from "@/hooks/useCloudData";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface AIResult {
  verdict: Verdict;
  score: number;
  confidence: number;
  headline_ru: string;
  headline_en: string;
  reasons: { ru: string; en: string; kind?: string }[];
  red_flags: { ru: string; en: string; severity?: "low" | "medium" | "high" }[];
  next_steps: { ru: string; en: string }[];
  input_kind?: string;
  query?: string;
  error?: string;
}

const verdictMeta: Record<Verdict, { ru: string; en: string; bg: string; text: string; ring: string }> = {
  green:  { ru: "Покупать", en: "Strong buy",     bg: "bg-verdict-green/10", text: "text-verdict-green", ring: "ring-verdict-green/30" },
  yellow: { ru: "Торговаться", en: "Negotiate",   bg: "bg-verdict-yellow/10", text: "text-verdict-yellow", ring: "ring-verdict-yellow/30" },
  red:    { ru: "Пройти мимо", en: "Avoid",        bg: "bg-verdict-red/10",   text: "text-verdict-red",   ring: "ring-verdict-red/30" },
};

export default function AnalyzeResult({ mode }: { mode: "agent" | "buyer" }) {
  const navigate = useNavigate();
  const [result, setResult] = useState<AIResult | null>(null);
  const [salesOpen, setSalesOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const saveAnalysis = useSaveAnalysis();
  const { data: clients = [] } = useClients();
  const createAssignment = useCreateAssignment();

  useEffect(() => {
    const raw = sessionStorage.getItem("propaai_last_result");
    if (!raw) {
      navigate(`/${mode}`, { replace: true });
      return;
    }
    setResult(JSON.parse(raw));
  }, [mode, navigate]);

  if (!result) return null;
  const v = verdictMeta[result.verdict] ?? verdictMeta.yellow;

  const onSave = async () => {
    await saveAnalysis.mutateAsync({
      input_kind: result.input_kind ?? "text",
      input_payload: { query: result.query ?? "" },
      verdict: result.verdict,
      score: result.score,
      confidence: result.confidence,
      reasons: result.reasons as unknown as never,
      red_flags: result.red_flags as unknown as never,
      next_steps: result.next_steps as unknown as never,
      raw: result as unknown as never,
    });
    toast.success("Анализ сохранён · Saved");
  };

  const pitchText = `${result.headline_ru}. Скор ${result.score}/100, уверенность ${result.confidence}%. ${
    result.reasons[0]?.ru ?? ""
  } ${result.reasons[1]?.ru ?? ""}`;

  return (
    <div className="min-h-screen pb-24 bg-background">
      <TopBar subtitle={mode === "agent" ? "Agent mode" : "Buyer mode"} />

      <div className="px-5 pt-2">
        <button
          onClick={() => navigate(`/${mode}`)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Назад
        </button>
      </div>

      {/* Hero verdict */}
      <div className="px-5 mt-3">
        <div className={cn("rounded-3xl border p-6 ring-1", v.bg, v.ring, "border-transparent")}>
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            <Sparkles className="h-3 w-3" /> AI Verdict
          </div>
          <div className={cn("mt-2 text-[11px] uppercase tracking-widest font-semibold", v.text)}>
            {v.ru} · {v.en}
          </div>
          <h1 className="text-3xl font-semibold tracking-tight mt-1 leading-tight">
            {result.headline_ru}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{result.headline_en}</p>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <Metric label="Скор" en="Score" value={String(result.score)} accent />
            <Metric label="Уверенность" en="Confidence" value={`${result.confidence}%`} />
            <Metric label="Вердикт" en="Verdict" value={v.ru} />
          </div>
        </div>
      </div>

      {/* Reasons */}
      {result.reasons?.length > 0 && (
        <Section ru="Почему так" en="Why this result">
          <div className="space-y-2">
            {result.reasons.map((r, i) => (
              <div key={i} className="rounded-2xl bg-card border border-border p-4 flex gap-3">
                <CheckCircle2 className="h-4 w-4 text-verdict-green mt-0.5 shrink-0" />
                <div>
                  <div className="text-sm font-medium leading-snug">{r.ru}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{r.en}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Red flags */}
      {result.red_flags?.length > 0 && (
        <Section ru="Риски" en="Red flags">
          <div className="space-y-2">
            {result.red_flags.map((r, i) => (
              <div key={i} className="rounded-2xl bg-card border border-border p-4 flex gap-3">
                <AlertTriangle className={cn("h-4 w-4 mt-0.5 shrink-0",
                  r.severity === "high" ? "text-verdict-red" :
                  r.severity === "medium" ? "text-verdict-yellow" : "text-muted-foreground")} />
                <div className="flex-1">
                  <div className="text-sm font-medium leading-snug">{r.ru}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{r.en}</div>
                </div>
                {r.severity && (
                  <span className={cn("text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium self-start",
                    r.severity === "high" ? "bg-verdict-red/15 text-verdict-red" :
                    r.severity === "medium" ? "bg-verdict-yellow/15 text-verdict-yellow" :
                    "bg-secondary text-muted-foreground")}>
                    {r.severity}
                  </span>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Next steps */}
      {result.next_steps?.length > 0 && (
        <Section ru="Следующие шаги" en="Next steps">
          <ol className="space-y-2">
            {result.next_steps.map((s, i) => (
              <li key={i} className="rounded-2xl bg-card border border-border p-4 flex gap-3">
                <div className="h-6 w-6 rounded-full bg-foreground text-background text-xs font-semibold grid place-items-center shrink-0">
                  {i + 1}
                </div>
                <div>
                  <div className="text-sm font-medium leading-snug">{s.ru}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{s.en}</div>
                </div>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {/* Actions */}
      <Section ru="Действия" en="Actions">
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={onSave} variant="secondary" className="h-12 rounded-xl">
            <Save className="h-4 w-4 mr-2" /> Сохранить
          </Button>
          <Button variant="secondary" className="h-12 rounded-xl">
            <Share2 className="h-4 w-4 mr-2" /> Поделиться
          </Button>
          <Button variant="secondary" className="h-12 rounded-xl">
            <GitCompare className="h-4 w-4 mr-2" /> Сравнить
          </Button>
          <Button variant="secondary" className="h-12 rounded-xl">
            <FileDown className="h-4 w-4 mr-2" /> Экспорт
          </Button>
        </div>
      </Section>

      {/* Agent sales tools */}
      {mode === "agent" && (
        <Section ru="Инструменты агента" en="Sales tools">
          <div className="space-y-2">
            <Button
              onClick={() => setAssignOpen(true)}
              className="w-full h-12 rounded-xl bg-foreground text-background hover:bg-foreground/90 justify-start"
            >
              <UserPlus className="h-4 w-4 mr-2" /> Назначить клиенту
            </Button>
            <Button
              onClick={() => setSalesOpen(true)}
              variant="secondary"
              className="w-full h-12 rounded-xl justify-start"
            >
              <MessageSquareQuote className="h-4 w-4 mr-2" /> Скрипты и возражения
            </Button>
          </div>
        </Section>
      )}

      {/* Sales tools sheet */}
      <Sheet open={salesOpen} onOpenChange={setSalesOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Sales Tools · Скрипты</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-3">
            <ToolCard
              title="Питч за 30 секунд" en="One-minute pitch"
              text={pitchText}
            />
            <ToolCard
              title="Рычаги торга" en="Negotiation levers"
              text={(result.red_flags ?? []).map((r) => `• ${r.ru}`).join("\n") || "Сильных рычагов нет — объект ликвиден."}
            />
            <ToolCard
              title="Ответы на возражения" en="Objection killer"
              text={(result.reasons ?? []).map((r) => `Q: «Почему так?»\nA: ${r.ru}`).join("\n\n") || "—"}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Assign to client sheet */}
      <Sheet open={assignOpen} onOpenChange={setAssignOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl max-h-[80vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Назначить клиенту · Assign</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-2">
            {clients.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                Сначала создайте клиента во вкладке «Клиенты».
              </div>
            ) : (
              clients.map((c) => (
                <button
                  key={c.id}
                  onClick={async () => {
                    toast.info("Создание объекта пока недоступно — сохраните анализ.");
                    setAssignOpen(false);
                  }}
                  className="w-full text-left rounded-xl border border-border bg-card p-4 hover:border-accent/40 transition-colors"
                >
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {c.goal ?? "—"} · {c.budget_max ? `до ${c.budget_max}` : ""}
                  </div>
                </button>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Section({ ru, en, children }: { ru: string; en: string; children: React.ReactNode }) {
  return (
    <div className="px-5 mt-6">
      <div className="flex items-baseline gap-2 mb-3">
        <h2 className="text-lg font-semibold tracking-tight">{ru}</h2>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{en}</span>
      </div>
      {children}
    </div>
  );
}

function Metric({ label, en, value, accent }: { label: string; en: string; value: string; accent?: boolean }) {
  return (
    <div className={cn("rounded-2xl border p-3 bg-card/60",
      accent ? "border-accent/30" : "border-border")}>
      <div className={cn("text-2xl font-semibold leading-none tabular-nums",
        accent && "text-accent")}>{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1.5">{label}</div>
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground/70">{en}</div>
    </div>
  );
}

function ToolCard({ title, en, text }: { title: string; en: string; text: string }) {
  const copy = () => {
    navigator.clipboard.writeText(text);
    toast.success("Скопировано");
  };
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{en}</div>
        </div>
        <button onClick={copy} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-secondary">
          <Copy className="h-3.5 w-3.5" />
        </button>
      </div>
      <pre className="text-xs text-foreground/80 whitespace-pre-wrap font-sans leading-relaxed">{text}</pre>
    </div>
  );
}
