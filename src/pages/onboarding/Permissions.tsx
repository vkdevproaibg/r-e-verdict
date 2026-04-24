import { useNavigate } from "react-router-dom";
import { OnboardingShell } from "@/components/OnboardingShell";
import { Button } from "@/components/ui/button";
import { useApp } from "@/state/AppContext";
import { MapPin, Camera, Bell, Check, ArrowRight } from "lucide-react";

export default function Permissions() {
  const navigate = useNavigate();
  const { requestGeo, geoStatus, setOnboarded, role, setRole } = useApp();

  const finish = () => {
    if (!role) setRole("buyer");
    setOnboarded(true);
    navigate("/app", { replace: true });
  };

  const items = [
    {
      Icon: MapPin,
      ru: "Геолокация",
      en: "Location",
      desc: "Покажем объекты вокруг вас на карте.",
      action: requestGeo,
      status: geoStatus,
      required: true,
    },
    {
      Icon: Camera,
      ru: "Камера",
      en: "Camera",
      desc: "Снимайте объект — получайте мгновенный анализ.",
      status: "idle" as const,
      required: false,
    },
    {
      Icon: Bell,
      ru: "Уведомления",
      en: "Notifications",
      desc: "Алерты по цене, новые объекты, ответы клиентов.",
      status: "idle" as const,
      required: false,
    },
  ];

  return (
    <OnboardingShell step={4} total={5} subtitle="Permissions · Разрешения">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Доступы</h1>
          <p className="text-sm uppercase tracking-widest text-muted-foreground/80">
            Grant access
          </p>
          <p className="text-sm text-muted-foreground pt-2">
            Чтобы оценка работала здесь и сейчас, разрешите геолокацию.
          </p>
        </div>

        <div className="space-y-3">
          {items.map(({ Icon, ru, en, desc, action, status, required }) => {
            const granted = status === "granted";
            return (
              <div
                key={en}
                className="rounded-2xl border border-border bg-card p-4 shadow-soft"
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-secondary grid place-items-center shrink-0">
                    <Icon className="h-4 w-4 text-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <div>
                        <div className="text-sm font-semibold">{ru}</div>
                        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                          {en}
                        </div>
                      </div>
                      {required && (
                        <span className="text-[10px] uppercase tracking-wider text-accent font-medium">
                          Нужно
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                      {desc}
                    </p>
                    {action && (
                      <Button
                        size="sm"
                        variant={granted ? "secondary" : "default"}
                        onClick={action}
                        disabled={status === "requesting"}
                        className="mt-3 h-8 text-xs"
                      >
                        {granted ? (
                          <>
                            <Check className="h-3 w-3 mr-1" /> Разрешено
                          </>
                        ) : status === "requesting" ? (
                          "Запрашиваем…"
                        ) : status === "denied" ? (
                          "Повторить"
                        ) : (
                          "Разрешить"
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Button
          size="lg"
          className="w-full h-12 bg-foreground text-background hover:bg-foreground/90"
          onClick={finish}
        >
          Продолжить
          <span className="text-background/60 ml-1.5 text-xs">Continue</span>
          <ArrowRight className="ml-auto h-4 w-4" />
        </Button>
      </div>
    </OnboardingShell>
  );
}
