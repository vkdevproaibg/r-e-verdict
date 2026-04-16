import { Link } from "react-router-dom";
import { LanguageToggle } from "./LanguageToggle";

export function TopBar({ subtitle }: { subtitle?: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between px-5">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-gradient-charcoal grid place-items-center shadow-soft">
            <span className="text-[10px] font-bold tracking-widest text-background">P</span>
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight">PropaAI</div>
            {subtitle && <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{subtitle}</div>}
          </div>
        </Link>
        <LanguageToggle />
      </div>
    </header>
  );
}
