import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Sparkles,
  Map,
  Heart,
  Settings,
  Users,
  FolderOpen,
  Bell,
  Menu,
  Check,
  LogOut,
  User,
  History,
} from "lucide-react";
import { useState } from "react";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useRole, type AppRole } from "@/state/RoleContext";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent } from "@/components/ui/sheet";

type NavItem = {
  to: string;
  label: string;
  Icon: typeof Sparkles;
  end?: boolean;
};

export default function AppShell() {
  const { t } = useTranslation();
  const { role, setRole } = useRole();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const buyerNav: NavItem[] = [
    { to: "/app/analyze", label: t("nav.analyze"), Icon: Sparkles, end: true },
    { to: "/app/map", label: t("nav.map"), Icon: Map },
    { to: "/app/saved", label: t("nav.saved"), Icon: Heart },
    { to: "/app/history", label: t("nav.history"), Icon: History },
    { to: "/app/alerts", label: t("nav.alerts"), Icon: Bell },
    { to: "/app/settings", label: t("nav.settings"), Icon: Settings },
  ];

  const agentNav: NavItem[] = [
    { to: "/app/analyze", label: t("nav.analyze"), Icon: Sparkles, end: true },
    { to: "/app/map", label: t("nav.map"), Icon: Map },
    { to: "/app/clients", label: t("nav.clients"), Icon: Users },
    { to: "/app/library", label: t("nav.library"), Icon: FolderOpen },
    { to: "/app/history", label: t("nav.history"), Icon: History },
    { to: "/app/settings", label: t("nav.settings"), Icon: Settings },
  ];

  const items = role === "agent" ? agentNav : buyerNav;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex w-64 shrink-0 border-r border-border bg-background flex-col sticky top-0 h-screen">
        <SidebarBrand />
        <nav className="flex-1 px-3 py-4 space-y-1">
          {items.map((it) => (
            <SidebarLink key={it.to} {...it} />
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          <RoleBadge role={role} />
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-xl">
          <div className="flex h-14 items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-2 min-w-0">
              <button
                onClick={() => setDrawerOpen(true)}
                className="lg:hidden h-9 w-9 grid place-items-center rounded-full hover:bg-secondary"
                aria-label="Menu"
              >
                <Menu className="h-4 w-4" />
              </button>
              <Link to="/" className="lg:hidden flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-gradient-charcoal grid place-items-center">
                  <span className="text-[10px] font-bold tracking-widest text-background">P</span>
                </div>
                <span className="text-sm font-semibold tracking-tight">{t("brand.name")}</span>
              </Link>
              <PageTitle pathname={location.pathname} />
            </div>
            <div className="flex items-center gap-2">
              <LanguageToggle compact />
              <ThemeToggle />
              <UserMenu role={role} setRole={setRole} />
            </div>
          </div>
        </header>

        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>

      {/* Mobile drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="left" className="p-0 w-72">
          <SidebarBrand />
          <nav className="px-3 py-4 space-y-1" onClick={() => setDrawerOpen(false)}>
            {items.map((it) => (
              <SidebarLink key={it.to} {...it} />
            ))}
          </nav>
          <div className="p-3 border-t border-border">
            <RoleBadge role={role} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function SidebarBrand() {
  const { t } = useTranslation();
  return (
    <Link to="/" className="flex items-center gap-2.5 px-5 h-16 border-b border-border">
      <div className="h-8 w-8 rounded-xl bg-gradient-charcoal grid place-items-center shadow-soft">
        <span className="text-xs font-bold tracking-widest text-background">P</span>
      </div>
      <div className="leading-tight">
        <div className="text-sm font-semibold tracking-tight">{t("brand.name")}</div>
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Decision layer
        </div>
      </div>
    </Link>
  );
}

function SidebarLink({ to, label, Icon, end }: NavItem) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
          isActive
            ? "bg-secondary text-foreground"
            : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
        )
      }
    >
      <Icon className="h-4 w-4" />
      {label}
    </NavLink>
  );
}

function RoleBadge({ role }: { role: AppRole }) {
  const { t } = useTranslation();
  return (
    <div className="rounded-xl bg-secondary/50 border border-border px-3 py-2.5 flex items-center gap-2.5">
      <div className="h-7 w-7 rounded-full bg-gradient-bronze grid place-items-center text-accent-foreground text-[11px] font-semibold">
        {role === "agent" ? "A" : "B"}
      </div>
      <div className="text-xs leading-tight">
        <div className="font-medium">{t(`role.${role}`)} mode</div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Guest</div>
      </div>
    </div>
  );
}

function UserMenu({ role, setRole }: { role: AppRole; setRole: (r: AppRole) => void }) {
  const { t } = useTranslation();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="h-9 w-9 rounded-full bg-gradient-bronze grid place-items-center text-accent-foreground text-[11px] font-semibold hover:opacity-90 transition-opacity shadow-bronze">
        {role === "agent" ? "A" : "B"}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground">
          {t("role.switch")}
        </DropdownMenuLabel>
        <DropdownMenuItem onClick={() => setRole("buyer")} className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <User className="h-3.5 w-3.5" />
            {t("role.buyer")}
          </span>
          {role === "buyer" && <Check className="h-3.5 w-3.5 text-accent" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setRole("agent")} className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5" />
            {t("role.agent")}
          </span>
          {role === "agent" && <Check className="h-3.5 w-3.5 text-accent" />}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/app/settings" className="flex items-center gap-2">
            <Settings className="h-3.5 w-3.5" />
            {t("nav.settings")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/" className="flex items-center gap-2 text-muted-foreground">
            <LogOut className="h-3.5 w-3.5" />
            {t("nav.signOut")}
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function PageTitle({ pathname }: { pathname: string }) {
  const { t } = useTranslation();
  const map: Record<string, string> = {
    "/app/analyze": t("nav.analyze"),
    "/app/map": t("nav.map"),
    "/app/saved": t("nav.saved"),
    "/app/history": t("nav.history"),
    "/app/alerts": t("nav.alerts"),
    "/app/settings": t("nav.settings"),
    "/app/clients": t("nav.clients"),
    "/app/library": t("nav.library"),
  };
  const label = map[pathname];
  if (!label) return null;
  return (
    <div className="hidden sm:block ml-3 pl-3 border-l border-border text-sm font-medium text-muted-foreground">
      {label}
    </div>
  );
}
