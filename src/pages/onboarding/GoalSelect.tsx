import { useNavigate } from "react-router-dom";
import { OnboardingShell } from "@/components/OnboardingShell";
import { useApp, Goal } from "@/state/AppContext";
import { Home, TrendingUp, Key, Building2 } from "lucide-react";

const goals: { id: Goal; ru: string; en: string; Icon: typeof Home }[] = [
  { id: "live", ru: "Для жизни", en: "Buy to live", Icon: Home },
  { id: "invest", ru: "Инвестиции", en: "Invest", Icon: TrendingUp },
  { id: "rent", ru: "Аренда", en: "Rent", Icon: Key },
  { id: "business", ru: "Коммерция", en: "Business", Icon: Building2 },
];

export default function GoalSelect() {
  const navigate = useNavigate();
  const { setGoal, role } = useApp();

  const pick = (g: Goal) => {
    setGoal(g);
    navigate("/onboarding/permissions");
  };

  return (
    <OnboardingShell step={3} total={5} subtitle="Goal · Ваша цель">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            {role === "agent" ? "Основная специализация" : "Ваша цель"}
          </h1>
          <p className="text-sm uppercase tracking-widest text-muted-foreground/80">
            {role === "agent" ? "Primary focus" : "Your goal"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {goals.map(({ id, ru, en, Icon }) => (
            <button
              key={id}
              onClick={() => pick(id)}
              className="aspect-square rounded-2xl border border-border bg-card p-4 shadow-soft transition-all hover:shadow-elevated hover:border-accent/40 hover:-translate-y-0.5 flex flex-col justify-between text-left"
            >
              <Icon className="h-6 w-6 text-accent" />
              <div>
                <div className="text-base font-semibold tracking-tight leading-tight">{ru}</div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-0.5">
                  {en}
                </div>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={() => navigate("/onboarding/permissions")}
          className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Пропустить · Skip
        </button>
      </div>
    </OnboardingShell>
  );
}
