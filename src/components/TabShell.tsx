import { ReactNode } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { TopBar } from "@/components/TopBar";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface TabDef {
  to: string;
  Icon: LucideIcon;
  ru: string;
  en: string;
  end?: boolean;
  primary?: boolean;
}

export function TabShell({ tabs, mode }: { tabs: TabDef[]; mode: string }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopBar subtitle={mode} />
      <main className="flex-1 pb-20">
        <Outlet />
      </main>
      <BottomTabs tabs={tabs} />
    </div>
  );
}

function BottomTabs({ tabs }: { tabs: TabDef[] }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/90 backdrop-blur-xl">
      <div className="grid max-w-md mx-auto" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
        {tabs.map(({ to, Icon, ru, en, end, primary }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-0.5 py-2.5 transition-colors relative",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-accent" />
                )}
                <div className={cn("relative", primary && "")}>
                  <Icon className={cn("h-5 w-5", primary && isActive && "text-accent")} strokeWidth={isActive ? 2.2 : 1.7} />
                </div>
                <div className="text-[10px] font-medium leading-tight text-center">
                  <div>{ru}</div>
                  <div className="text-[8px] uppercase tracking-wider opacity-60">{en}</div>
                </div>
              </>
            )}
          </NavLink>
        ))}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}

export function ScreenHeader({ ru, en, action }: { ru: string; en: string; action?: ReactNode }) {
  return (
    <div className="px-5 pt-6 pb-4 flex items-end justify-between gap-3">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{ru}</h1>
        <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">{en}</p>
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  Icon,
  ru,
  en,
  hint,
}: {
  Icon: LucideIcon;
  ru: string;
  en: string;
  hint?: string;
}) {
  return (
    <div className="mx-5 my-6 rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
      <div className="mx-auto h-12 w-12 rounded-2xl bg-secondary grid place-items-center mb-4">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="text-base font-semibold">{ru}</div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1">{en}</div>
      {hint && <p className="text-sm text-muted-foreground mt-3 max-w-xs mx-auto">{hint}</p>}
    </div>
  );
}
