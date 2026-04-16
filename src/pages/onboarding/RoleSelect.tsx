import { useNavigate } from "react-router-dom";
import { OnboardingShell } from "@/components/OnboardingShell";
import { useApp, Role } from "@/state/AppContext";
import { Briefcase, Home, ChevronRight } from "lucide-react";

const options: {
  role: Role;
  ru: string;
  en: string;
  desc: string;
  Icon: typeof Briefcase;
}[] = [
  {
    role: "agent",
    ru: "Я агент",
    en: "I'm an agent",
    desc: "CRM, клиенты, продающие отчёты, инструменты переговоров.",
    Icon: Briefcase,
  },
  {
    role: "buyer",
    ru: "Я покупатель",
    en: "I'm a buyer",
    desc: "Карта, видео-пины, AI-оценка, избранное и связь с агентами.",
    Icon: Home,
  },
];

export default function RoleSelect() {
  const navigate = useNavigate();
  const { setRole } = useApp();

  const select = (r: Role) => {
    setRole(r);
    navigate("/onboarding/goal");
  };

  return (
    <OnboardingShell step={2} total={5} subtitle="Role · Кто вы">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Кто вы?
          </h1>
          <p className="text-sm uppercase tracking-widest text-muted-foreground/80">
            Who are you?
          </p>
        </div>

        <div className="space-y-3">
          {options.map(({ role, ru, en, desc, Icon }) => (
            <button
              key={role}
              onClick={() => select(role)}
              className="group w-full text-left rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:shadow-elevated hover:border-accent/40 hover:-translate-y-0.5 active:scale-[0.99]"
            >
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-bronze grid place-items-center shadow-bronze shrink-0">
                  <Icon className="h-5 w-5 text-accent-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="text-lg font-semibold tracking-tight">{ru}</div>
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">
                        {en}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </OnboardingShell>
  );
}
