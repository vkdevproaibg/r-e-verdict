import { useNavigate } from "react-router-dom";
import { OnboardingShell } from "@/components/OnboardingShell";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Welcome() {
  const navigate = useNavigate();
  return (
    <OnboardingShell step={1} total={5} subtitle="Welcome">
      <div className="flex flex-col gap-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium uppercase tracking-wider w-fit">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Beta · 2025
          </div>
          <h1 className="text-4xl font-semibold tracking-tight leading-[1.05]">
            Уверенность поверх
            <br />
            <span className="text-accent">хаоса данных</span>
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            Мгновенный вердикт по любому объекту: купить, торговаться или пройти мимо.
          </p>
          <p className="text-xs uppercase tracking-widest text-muted-foreground/70">
            Confidence over data chaos · Instant verdict for any property
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft space-y-4">
          {[
            { ru: "AI-вердикт за секунды", en: "AI verdict in seconds" },
            { ru: "Доказательства, а не догадки", en: "Evidence, not guesses" },
            { ru: "Карта · Видео-пины · CRM", en: "Map · Video pins · CRM" },
          ].map((f) => (
            <div key={f.en} className="flex items-start gap-3">
              <div className="h-8 w-8 shrink-0 rounded-lg bg-secondary grid place-items-center">
                <div className="h-1.5 w-1.5 rounded-full bg-accent" />
              </div>
              <div>
                <div className="text-sm font-medium">{f.ru}</div>
                <div className="text-xs text-muted-foreground">{f.en}</div>
              </div>
            </div>
          ))}
        </div>

        <Button
          size="lg"
          className="w-full h-12 text-base bg-foreground text-background hover:bg-foreground/90"
          onClick={() => navigate("/onboarding/role")}
        >
          Начать <span className="text-background/60 ml-1.5 text-xs">Get started</span>
          <ArrowRight className="ml-auto h-4 w-4" />
        </Button>
      </div>
    </OnboardingShell>
  );
}
