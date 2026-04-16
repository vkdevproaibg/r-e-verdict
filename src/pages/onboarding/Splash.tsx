import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/state/AppContext";

export default function Splash() {
  const navigate = useNavigate();
  const { onboarded, role } = useApp();

  useEffect(() => {
    const t = setTimeout(() => {
      if (onboarded && role) {
        navigate(role === "agent" ? "/agent" : "/buyer", { replace: true });
      } else {
        navigate("/onboarding/welcome", { replace: true });
      }
    }, 1100);
    return () => clearTimeout(t);
  }, [navigate, onboarded, role]);

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-hero">
      <div className="flex flex-col items-center gap-5 animate-scale-in">
        <div className="h-16 w-16 rounded-2xl bg-gradient-charcoal grid place-items-center shadow-elevated">
          <span className="text-2xl font-bold text-background tracking-tight">P</span>
        </div>
        <div className="text-center">
          <div className="text-2xl font-semibold tracking-tight">PropaAI</div>
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mt-1">
            Decision layer for real estate
          </div>
        </div>
      </div>
    </div>
  );
}
