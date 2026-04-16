import { ReactNode } from "react";
import { TopBar } from "@/components/TopBar";

export function OnboardingShell({
  step,
  total,
  children,
  subtitle,
}: {
  step: number;
  total: number;
  children: ReactNode;
  subtitle?: string;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-hero">
      <TopBar subtitle={subtitle} />
      <div className="px-5 pt-4">
        <div className="flex gap-1.5">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i < step ? "bg-accent" : "bg-border"
              }`}
            />
          ))}
        </div>
      </div>
      <main className="flex-1 px-5 py-8 max-w-md mx-auto w-full animate-fade-in">
        {children}
      </main>
    </div>
  );
}
