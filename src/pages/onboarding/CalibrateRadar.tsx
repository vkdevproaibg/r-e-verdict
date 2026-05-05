import { ReactNode, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Home as HomeIcon,
  Building2,
  TrendingUp,
  Minimize2,
  ShieldAlert,
  DollarSign,
  Users2,
  Scale,
  Activity,
  Zap,
  Banknote,
  Landmark,
  Repeat,
  Rocket,
  Map as MapIcon,
  Telescope,
  House,
  Building,
  Trees,
  Warehouse,
  Swords,
  Compass,
  UserMinus,
  Check,
  Lock,
  Loader2,
  Radar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  useBuyerProfile,
  derivePsychotype,
  type Motive,
  type Fear,
  type Funding,
  type Timeline,
  type FormatPick,
  type AgentRole,
} from "@/state/BuyerProfileContext";

const TOTAL = 12;

export default function CalibrateRadar() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { profile, update } = useBuyerProfile();
  const [step, setStep] = useState(1);

  // Address (and purpose) carried over from Home
  useEffect(() => {
    const addr = params.get("address");
    const purpose = params.get("purpose");
    if (addr && !profile.address) update({ address: addr });
    void purpose;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const next = () => setStep((s) => Math.min(s + 1, TOTAL));
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  const finish = () => {
    update({
      completedAt: Date.now(),
      psychotype: derivePsychotype(profile),
    });
    // Hand-off to existing analysis pipeline.
    const sp = new URLSearchParams();
    sp.set("kind", "address");
    sp.set("q", profile.address ?? params.get("address") ?? "");
    sp.set("purpose", params.get("purpose") ?? "buy");
    navigate(`/app/analyze/loading?${sp.toString()}`, { replace: true });
  };

  const address = profile.address ?? params.get("address") ?? "your property";

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Top bar — progress + back */}
      <div className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="max-w-md mx-auto px-5 py-3.5 flex items-center gap-3">
          <button
            onClick={step === 1 ? () => navigate(-1) : prev}
            disabled={step === 5 || step === 11}
            className="h-9 w-9 rounded-full grid place-items-center text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-30 transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex-1 flex gap-1">
            {Array.from({ length: TOTAL }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors",
                  i < step ? "bg-accent" : "bg-border"
                )}
              />
            ))}
          </div>
          <div className="text-[10px] tabular-nums uppercase tracking-widest text-muted-foreground w-10 text-right">
            {step}/{TOTAL}
          </div>
        </div>
      </div>

      <main className="max-w-md mx-auto px-5 pt-8 pb-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
          >
            {step === 1 && <Step1 address={address} onNext={next} />}
            {step === 2 && <Step2 onPick={(motive) => { update({ motive }); next(); }} />}
            {step === 3 && (
              <Step3
                value={profile.compromise ?? 50}
                onChange={(v) => update({ compromise: v })}
                onNext={next}
              />
            )}
            {step === 4 && <Step4 onPick={(fear) => { update({ fear }); next(); }} />}
            {step === 5 && (
              <MirrorScreen
                title="Анализируем ваш профиль…"
                lines={[
                  "Слышим, что вам важно.",
                  derivePsychotype({ ...profile }),
                ]}
                onDone={next}
              />
            )}
            {step === 6 && (
              <Step6
                value={profile.budget ?? 500_000}
                onChange={(v) => update({ budget: v, budgetSkipped: false })}
                onSkip={() => { update({ budgetSkipped: true }); next(); }}
                onNext={next}
              />
            )}
            {step === 7 && <Step7 onPick={(funding) => { update({ funding }); next(); }} />}
            {step === 8 && <Step8 onPick={(timeline) => { update({ timeline }); next(); }} />}
            {step === 9 && (
              <Step9
                value={profile.formats ?? []}
                onChange={(formats) => update({ formats })}
                onNext={next}
              />
            )}
            {step === 10 && (
              <Step10 onPick={(agentRole) => { update({ agentRole }); next(); }} />
            )}
            {step === 11 && (
              <MirrorScreen
                title={`Сопоставляем ваш профиль с ${address}…`}
                lines={[
                  "Накладываем риски на ваши приоритеты.",
                  "Формируем инвестиционный вердикт…",
                ]}
                onDone={next}
                duration={3200}
                synthesis
              />
            )}
            {step === 12 && <Step12 address={address} onUnlock={finish} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

/* ======================================================================== */
/*  Reusable atoms                                                          */
/* ======================================================================== */

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/70 backdrop-blur px-3 py-1 text-[10px] uppercase tracking-widest text-muted-foreground">
      <Sparkles className="h-3 w-3 text-accent" />
      {children}
    </div>
  );
}

function StepHeader({ eyebrow, title, sub }: { eyebrow: string; title: ReactNode; sub?: string }) {
  return (
    <header className="space-y-3">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1 className="font-serif-display text-[34px] leading-[1.05] font-medium text-foreground">
        {title}
      </h1>
      {sub && <p className="text-sm text-muted-foreground leading-relaxed">{sub}</p>}
    </header>
  );
}

function ChoiceCard({
  Icon,
  title,
  desc,
  onClick,
  active,
}: {
  Icon: typeof HomeIcon;
  title: string;
  desc?: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group w-full text-left rounded-2xl border bg-card p-4 shadow-soft transition-all hover:shadow-elevated hover:-translate-y-0.5 active:scale-[0.99]",
        active ? "border-accent ring-1 ring-accent/30" : "border-border hover:border-accent/40"
      )}
    >
      <div className="flex items-start gap-3.5">
        <div
          className={cn(
            "h-11 w-11 rounded-xl grid place-items-center shrink-0 transition-colors",
            active ? "bg-gradient-bronze shadow-bronze" : "bg-secondary group-hover:bg-secondary/70"
          )}
        >
          <Icon className={cn("h-5 w-5", active ? "text-accent-foreground" : "text-foreground")} />
        </div>
        <div className="flex-1 pt-0.5">
          <div className="text-[15px] font-semibold tracking-tight leading-tight">{title}</div>
          {desc && (
            <div className="mt-1 text-[12px] text-muted-foreground leading-relaxed">{desc}</div>
          )}
        </div>
        {active && <Check className="h-4 w-4 text-accent mt-1 shrink-0" />}
      </div>
    </button>
  );
}

function PrimaryButton({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className="w-full h-13 rounded-2xl bg-foreground text-background hover:bg-foreground/90 shadow-soft text-base font-medium"
    >
      {children}
    </Button>
  );
}

/* ======================================================================== */
/*  Step 1 — Promise / Enter the simulation                                 */
/* ======================================================================== */

function Step1({ address, onNext }: { address: string; onNext: () => void }) {
  return (
    <div className="space-y-8">
      <div className="relative h-44 rounded-3xl overflow-hidden bg-gradient-charcoal grid place-items-center">
        <RadarPulse />
        <div className="absolute inset-x-0 bottom-3 text-center text-[10px] uppercase tracking-widest text-background/60">
          Property Radar
        </div>
      </div>
      <StepHeader
        eyebrow="Калибровка радара"
        title={
          <>
            Мы собрали данные по{" "}
            <span className="font-serif-italic text-accent">{address}</span>.
          </>
        }
        sub="Чтобы алгоритм Propa показал, подходит ли этот объект именно вам, нам нужно откалибровать ваш Property Radar. Это займёт меньше минуты."
      />
      <div className="rounded-2xl border border-border bg-card/60 backdrop-blur p-4 space-y-2.5">
        {[
          "10 коротких вопросов",
          "Без ввода текста — только выбор",
          "В конце — персональный вердикт по объекту",
        ].map((line) => (
          <div key={line} className="flex items-center gap-2.5 text-[13px]">
            <div className="h-5 w-5 rounded-full bg-accent/15 grid place-items-center shrink-0">
              <Check className="h-3 w-3 text-accent" />
            </div>
            <span className="text-muted-foreground">{line}</span>
          </div>
        ))}
      </div>
      <PrimaryButton onClick={onNext}>
        Начать калибровку
        <ArrowRight className="ml-2 h-4 w-4" />
      </PrimaryButton>
    </div>
  );
}

function RadarPulse() {
  return (
    <div className="relative h-32 w-32">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          initial={{ scale: 0.4, opacity: 0.6 }}
          animate={{ scale: 1.6, opacity: 0 }}
          transition={{ duration: 2.6, repeat: Infinity, delay: i * 0.7, ease: "easeOut" }}
          className="absolute inset-0 rounded-full border border-accent/50"
        />
      ))}
      <div className="absolute inset-0 grid place-items-center">
        <div className="h-3 w-3 rounded-full bg-accent shadow-bronze" />
      </div>
      <Radar className="absolute inset-0 m-auto h-10 w-10 text-accent/30" />
    </div>
  );
}

/* ======================================================================== */
/*  Step 2 — True motive                                                    */
/* ======================================================================== */

const motives: { id: Motive; ru: string; desc: string; Icon: typeof HomeIcon }[] = [
  { id: "expansion", ru: "Расширение", desc: "Нужно больше места для жизни", Icon: HomeIcon },
  { id: "first_home", ru: "Первое жильё", desc: "Устал платить за аренду", Icon: Building2 },
  { id: "investment", ru: "Инвестиция", desc: "Сохранение и рост капитала", Icon: TrendingUp },
  { id: "downsize", ru: "Оптимизация", desc: "Снизить расходы / даунсайзинг", Icon: Minimize2 },
];

function Step2({ onPick }: { onPick: (m: Motive) => void }) {
  return (
    <div className="space-y-6">
      <StepHeader
        eyebrow="Истинный мотив"
        title={
          <>
            Какая <span className="font-serif-italic">жизненная задача</span> стоит за этим поиском?
          </>
        }
        sub="Один ответ — самый честный. Это влияет на то, как мы взвешиваем риски."
      />
      <div className="space-y-2.5">
        {motives.map((m) => (
          <ChoiceCard key={m.id} Icon={m.Icon} title={m.ru} desc={m.desc} onClick={() => onPick(m.id)} />
        ))}
      </div>
    </div>
  );
}

/* ======================================================================== */
/*  Step 3 — Compromise slider                                              */
/* ======================================================================== */

function Step3({ value, onChange, onNext }: { value: number; onChange: (v: number) => void; onNext: () => void }) {
  const lean =
    value < 35 ? "Локация важнее" : value > 65 ? "Ремонт важнее" : "Готовы взвешивать";
  return (
    <div className="space-y-7">
      <StepHeader
        eyebrow="Психология компромисса"
        title={
          <>
            В реальном мире <span className="font-serif-italic">приходится выбирать</span>.
          </>
        }
        sub="К чему вы склоняетесь больше? Сдвиньте ползунок."
      />

      <div className="rounded-3xl border border-border bg-card p-6 shadow-soft space-y-6">
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Ваш баланс
          </div>
          <div className="mt-1 font-serif-display text-2xl text-accent">{lean}</div>
        </div>

        <div className="space-y-3">
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full accent-[hsl(var(--accent))] h-2"
          />
          <div className="flex items-start justify-between gap-3 text-[12px]">
            <div className="flex-1">
              <div className="font-semibold">Идеальная локация</div>
              <div className="text-muted-foreground mt-0.5">… но старый ремонт</div>
            </div>
            <div className="flex-1 text-right">
              <div className="font-semibold">Идеальный ремонт</div>
              <div className="text-muted-foreground mt-0.5">… но локация хуже</div>
            </div>
          </div>
        </div>
      </div>

      <PrimaryButton onClick={onNext}>
        Дальше <ArrowRight className="ml-2 h-4 w-4" />
      </PrimaryButton>
    </div>
  );
}

/* ======================================================================== */
/*  Step 4 — Main fear                                                      */
/* ======================================================================== */

const fears: { id: Fear; ru: string; Icon: typeof ShieldAlert }[] = [
  { id: "hidden_defects", ru: "Скрытые технические дефекты", Icon: ShieldAlert },
  { id: "overpay", ru: "Переплатить выше рынка", Icon: DollarSign },
  { id: "bad_neighbors", ru: "Проблемные соседи / район", Icon: Users2 },
  { id: "legal_surprises", ru: "Юридические или налоговые сюрпризы", Icon: Scale },
  { id: "liquidity", ru: "Не смогу быстро продать", Icon: Activity },
  { id: "missed_opportunity", ru: "Упустить лучший вариант", Icon: Zap },
];

function Step4({ onPick }: { onPick: (f: Fear) => void }) {
  return (
    <div className="space-y-6">
      <StepHeader
        eyebrow="Главный страх"
        title={
          <>
            Чего вы <span className="font-serif-italic">больше всего</span> опасаетесь?
          </>
        }
        sub="Только одно — самое острое. Это станет фокусом нашего отчёта по этому объекту."
      />
      <div className="grid grid-cols-1 gap-2.5">
        {fears.map((f) => (
          <ChoiceCard key={f.id} Icon={f.Icon} title={f.ru} onClick={() => onPick(f.id)} />
        ))}
      </div>
    </div>
  );
}

/* ======================================================================== */
/*  Mirror screen — auto-advance reward                                     */
/* ======================================================================== */

function MirrorScreen({
  title,
  lines,
  onDone,
  duration = 2800,
  synthesis,
}: {
  title: string;
  lines: string[];
  onDone: () => void;
  duration?: number;
  synthesis?: boolean;
}) {
  useEffect(() => {
    const t = setTimeout(onDone, duration);
    return () => clearTimeout(t);
  }, [onDone, duration]);

  return (
    <div className="min-h-[70vh] grid place-items-center text-center">
      <div className="space-y-7 w-full">
        <div className="relative h-44 grid place-items-center">
          {synthesis ? <SynthesisAnimation /> : <RadarPulse />}
        </div>
        <div className="space-y-3 px-2">
          <div className="text-[10px] uppercase tracking-widest text-accent font-medium inline-flex items-center gap-1.5">
            <Loader2 className="h-3 w-3 animate-spin" />
            Зеркало
          </div>
          <h2 className="font-serif-display text-2xl text-foreground leading-tight">
            {title}
          </h2>
          <div className="space-y-1.5 pt-1">
            {lines.map((l, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.4 }}
                className="text-sm text-muted-foreground"
              >
                {l}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SynthesisAnimation() {
  return (
    <div className="relative h-32 w-56">
      <motion.div
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: -8, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="absolute left-0 top-1/2 -translate-y-1/2 h-20 w-20 rounded-full bg-gradient-bronze shadow-bronze grid place-items-center"
      >
        <Users2 className="h-7 w-7 text-accent-foreground" />
      </motion.div>
      <motion.div
        initial={{ x: 40, opacity: 0 }}
        animate={{ x: 8, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="absolute right-0 top-1/2 -translate-y-1/2 h-20 w-20 rounded-full bg-gradient-charcoal shadow-elevated grid place-items-center"
      >
        <HomeIcon className="h-7 w-7 text-background" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="absolute inset-0 grid place-items-center"
      >
        <div className="h-3 w-3 rounded-full bg-accent shadow-bronze" />
      </motion.div>
    </div>
  );
}

/* ======================================================================== */
/*  Step 6 — Budget slider (log-ish)                                        */
/* ======================================================================== */

const BUDGET_STOPS = [
  50_000, 100_000, 200_000, 350_000, 500_000, 750_000, 1_000_000, 1_500_000,
  2_000_000, 3_000_000, 5_000_000,
];

function fmt(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(v % 1_000_000 === 0 ? 0 : 1)}M`;
  if (v >= 1_000) return `$${Math.round(v / 1_000)}k`;
  return `$${v}`;
}

function Step6({
  value,
  onChange,
  onSkip,
  onNext,
}: {
  value: number;
  onChange: (v: number) => void;
  onSkip: () => void;
  onNext: () => void;
}) {
  // Map slider (0..stops-1) to stops
  const idx = Math.max(0, BUDGET_STOPS.findIndex((s) => s >= value));
  return (
    <div className="space-y-7">
      <StepHeader
        eyebrow="Деньги в лоб"
        title={
          <>
            Какой ваш <span className="font-serif-italic">жёсткий потолок</span> бюджета?
          </>
        }
        sub="Выше которого вы точно не пойдёте. Это поможет отсеять нерелевантные риски."
      />

      <div className="rounded-3xl border border-border bg-card p-6 shadow-soft space-y-6">
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Потолок
          </div>
          <div className="mt-1 font-serif-display text-4xl text-foreground tabular-nums">
            {fmt(BUDGET_STOPS[idx] ?? value)}
          </div>
        </div>
        <input
          type="range"
          min={0}
          max={BUDGET_STOPS.length - 1}
          step={1}
          value={idx < 0 ? 0 : idx}
          onChange={(e) => onChange(BUDGET_STOPS[Number(e.target.value)])}
          className="w-full accent-[hsl(var(--accent))] h-2"
        />
        <div className="flex justify-between text-[11px] text-muted-foreground tabular-nums">
          <span>$50k</span>
          <span>$5M+</span>
        </div>
      </div>

      <div className="space-y-2.5">
        <PrimaryButton onClick={onNext}>
          Дальше <ArrowRight className="ml-2 h-4 w-4" />
        </PrimaryButton>
        <button
          onClick={onSkip}
          className="w-full text-center text-[13px] text-muted-foreground hover:text-foreground transition-colors py-2"
        >
          Пока нет точной цифры — просто изучаю
        </button>
      </div>
    </div>
  );
}

/* ======================================================================== */
/*  Step 7 — Funding                                                        */
/* ======================================================================== */

const fundings: { id: Funding; ru: string; desc: string; Icon: typeof Banknote }[] = [
  { id: "cash", ru: "Наличные средства", desc: "Готов покупать сразу", Icon: Banknote },
  { id: "mortgage", ru: "Ипотека", desc: "Нужен pre-approval", Icon: Landmark },
  { id: "sell_first", ru: "Сначала продать своё", desc: "Двойная сделка", Icon: Repeat },
];

function Step7({ onPick }: { onPick: (f: Funding) => void }) {
  return (
    <div className="space-y-6">
      <StepHeader
        eyebrow="Топливо сделки"
        title={
          <>
            Как планируете <span className="font-serif-italic">финансировать</span> сделку?
          </>
        }
      />
      <div className="space-y-2.5">
        {fundings.map((f) => (
          <ChoiceCard key={f.id} Icon={f.Icon} title={f.ru} desc={f.desc} onClick={() => onPick(f.id)} />
        ))}
      </div>
    </div>
  );
}

/* ======================================================================== */
/*  Step 8 — Timeline                                                       */
/* ======================================================================== */

const timelines: { id: Timeline; ru: string; desc: string; Icon: typeof Rocket }[] = [
  { id: "sprint", ru: "Спринт", desc: "Хоть завтра, если объект подходит", Icon: Rocket },
  { id: "marathon", ru: "Марафон", desc: "В течение 3–6 месяцев", Icon: MapIcon },
  { id: "scout", ru: "Разведка", desc: "Не спешу, смотрю на будущий год", Icon: Telescope },
];

function Step8({ onPick }: { onPick: (t: Timeline) => void }) {
  return (
    <div className="space-y-6">
      <StepHeader
        eyebrow="Таймлайн"
        title={
          <>
            Если объект <span className="font-serif-italic">окажется идеальным</span> — как быстро готовы действовать?
          </>
        }
      />
      <div className="space-y-2.5">
        {timelines.map((t) => (
          <ChoiceCard key={t.id} Icon={t.Icon} title={t.ru} desc={t.desc} onClick={() => onPick(t.id)} />
        ))}
      </div>
    </div>
  );
}

/* ======================================================================== */
/*  Step 9 — Format multi-select                                            */
/* ======================================================================== */

const formats: { id: FormatPick; ru: string; Icon: typeof House }[] = [
  { id: "house", ru: "Отдельный дом", Icon: House },
  { id: "townhouse", ru: "Таунхаус", Icon: Building },
  { id: "condo", ru: "Кондоминиум", Icon: Warehouse },
  { id: "land", ru: "Участок", Icon: Trees },
];

function Step9({
  value,
  onChange,
  onNext,
}: {
  value: FormatPick[];
  onChange: (v: FormatPick[]) => void;
  onNext: () => void;
}) {
  const toggle = (id: FormatPick) =>
    onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);

  return (
    <div className="space-y-6">
      <StepHeader
        eyebrow="Формат объекта"
        title={
          <>
            Помимо этого объекта — <span className="font-serif-italic">какой формат</span> вам подходит?
          </>
        }
        sub="Можно выбрать несколько."
      />
      <div className="grid grid-cols-2 gap-2.5">
        {formats.map((f) => (
          <button
            key={f.id}
            onClick={() => toggle(f.id)}
            className={cn(
              "aspect-square rounded-2xl border bg-card p-4 shadow-soft transition-all flex flex-col justify-between text-left",
              value.includes(f.id)
                ? "border-accent ring-1 ring-accent/30"
                : "border-border hover:border-accent/40"
            )}
          >
            <div
              className={cn(
                "h-10 w-10 rounded-xl grid place-items-center",
                value.includes(f.id) ? "bg-gradient-bronze shadow-bronze" : "bg-secondary"
              )}
            >
              <f.Icon
                className={cn(
                  "h-5 w-5",
                  value.includes(f.id) ? "text-accent-foreground" : "text-foreground"
                )}
              />
            </div>
            <div className="text-[14px] font-semibold tracking-tight">{f.ru}</div>
          </button>
        ))}
      </div>
      <PrimaryButton onClick={onNext} disabled={value.length === 0}>
        Дальше <ArrowRight className="ml-2 h-4 w-4" />
      </PrimaryButton>
    </div>
  );
}

/* ======================================================================== */
/*  Step 10 — Defender                                                      */
/* ======================================================================== */

const agents: { id: AgentRole; ru: string; desc: string; Icon: typeof Swords }[] = [
  { id: "negotiator", ru: "Жёсткий переговорщик", desc: "Сбить цену на основе рисков", Icon: Swords },
  { id: "guide", ru: "Локальный гид", desc: "Покажет районы и убережёт от ошибок", Icon: Compass },
  { id: "none", ru: "Никто, я сам", desc: "Только сухие данные от Propa", Icon: UserMinus },
];

function Step10({ onPick }: { onPick: (a: AgentRole) => void }) {
  return (
    <div className="space-y-6">
      <StepHeader
        eyebrow="Защитник"
        title={
          <>
            Кто <span className="font-serif-italic">нужен на вашей стороне</span> в этой сделке?
          </>
        }
      />
      <div className="space-y-2.5">
        {agents.map((a) => (
          <ChoiceCard key={a.id} Icon={a.Icon} title={a.ru} desc={a.desc} onClick={() => onPick(a.id)} />
        ))}
      </div>
    </div>
  );
}

/* ======================================================================== */
/*  Step 12 — Premium reveal (no paywall, simulation only)                  */
/* ======================================================================== */

function Step12({ address, onUnlock }: { address: string; onUnlock: () => void }) {
  return (
    <div className="space-y-7">
      {/* Premium hero plate */}
      <div className="relative h-52 rounded-3xl overflow-hidden bg-gradient-charcoal">
        {/* subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--accent)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--accent)) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        {/* radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--accent)/0.25),transparent_60%)]" />
        {/* concentric rings */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            initial={{ scale: 0.4, opacity: 0.5 }}
            animate={{ scale: 1.4, opacity: 0 }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 0.9, ease: "easeOut" }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-24 w-24 rounded-full border border-accent/40"
          />
        ))}
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
          className="absolute inset-0 grid place-items-center"
        >
          <div className="text-center">
            <div className="relative mx-auto h-16 w-16">
              <div className="absolute inset-0 rounded-2xl bg-gradient-bronze shadow-bronze" />
              <div className="absolute inset-0 grid place-items-center">
                <Check className="h-8 w-8 text-accent-foreground" strokeWidth={2.5} />
              </div>
            </div>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-background/10 backdrop-blur px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-background/80 border border-background/15">
              <Sparkles className="h-3 w-3 text-accent" />
              Premium analysis ready
            </div>
          </div>
        </motion.div>
      </div>

      <StepHeader
        eyebrow="Профиль откалиброван"
        title={
          <>
            Радар настроен{" "}
            <span className="font-serif-italic text-accent">именно под вас</span> и готов к{" "}
            <span className="font-serif-italic">{address}</span>.
          </>
        }
        sub="Мы взвесили ваши приоритеты, бюджет и страхи — и сложили их в персональный вердикт по объекту."
      />

      {/* Trust grid */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { k: "12", label: "сигналов проанализировано" },
          { k: "6", label: "источников рынка" },
          { k: "100%", label: "под ваш профиль" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-border bg-card/70 backdrop-blur p-3 text-center"
          >
            <div className="font-serif-display text-2xl text-foreground tabular-nums">
              {s.k}
            </div>
            <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground leading-tight">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* What's inside */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-3 shadow-soft">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Что внутри отчёта
        </div>
        {[
          "Персональный вердикт под ваш сценарий",
          "Сравнение с рынком и комплами в районе",
          "Карта рисков, отсортированная по вашему страху",
        ].map((line) => (
          <div key={line} className="flex items-start gap-2.5 text-[13px]">
            <div className="mt-0.5 h-4 w-4 rounded-full bg-accent/15 grid place-items-center shrink-0">
              <Check className="h-2.5 w-2.5 text-accent" />
            </div>
            <span className="text-foreground/85 leading-relaxed">{line}</span>
          </div>
        ))}
      </div>

      <Button
        onClick={onUnlock}
        className="w-full h-14 rounded-2xl bg-gradient-bronze text-accent-foreground shadow-bronze hover:opacity-95 text-base font-semibold tracking-tight"
      >
        Открыть мой отчёт
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
      <p className="text-center text-[11px] text-muted-foreground">
        Полный доступ · без оплаты · ранний премиум-режим
      </p>
    </div>
  );
}
