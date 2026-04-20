import { ScreenHeader, EmptyState } from "@/components/TabShell";
import { Button } from "@/components/ui/button";
import { Plus, UserPlus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useClients, useCreateClient, type Goal } from "@/hooks/useCloudData";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const goalValues: Goal[] = ["live", "invest", "rent", "business"];

export default function ClientsList() {
  const { t, i18n } = useTranslation();
  const { data: clients = [] } = useClients();
  const create = useCreateClient();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [goal, setGoal] = useState<Goal | null>(null);
  const [budget, setBudget] = useState("");

  const filtered = clients.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()));

  const submit = async () => {
    if (!name.trim()) return;
    await create.mutateAsync({
      name: name.trim(),
      phone: phone.trim() || null,
      goal: goal ?? null,
      budget_max: budget ? Number(budget) : null,
    });
    setName(""); setPhone(""); setGoal(null); setBudget("");
    setOpen(false);
  };

  const dateLocale = i18n.language === "ru" ? "ru-RU" : "en-US";

  return (
    <div className="animate-fade-in">
      <ScreenHeader
        ru={t("agent.clients.title")}
        en={t("nav.clients", { lng: "en" })}
        action={
          <Button
            size="sm"
            onClick={() => setOpen(true)}
            className="rounded-full bg-foreground text-background hover:bg-foreground/90 h-9"
          >
            <Plus className="h-4 w-4 mr-1" /> {t("agent.clients.newBtn")}
          </Button>
        }
      />

      <div className="px-5 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("agent.clients.searchPlaceholder")}
            className="pl-9 h-11 rounded-xl bg-card"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          Icon={UserPlus}
          ru={t("agent.clients.emptyTitle")}
          en={t("agent.clients.emptyTitle", { lng: "en" })}
          hint={t("agent.clients.emptyHint")}
        />
      ) : (
        <div className="px-5 space-y-2">
          {filtered.map((c) => (
            <Link
              key={c.id}
              to={`/app/clients/${c.id}`}
              className="block rounded-2xl border border-border bg-card p-4 shadow-soft hover:shadow-elevated hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-bronze grid place-items-center text-accent-foreground text-sm font-semibold shadow-bronze">
                  {c.name[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="font-medium truncate">{c.name}</div>
                    <div className="text-xs text-muted-foreground shrink-0">
                      {new Date(c.created_at).toLocaleDateString(dateLocale, { day: "numeric", month: "short" })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {c.goal && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-secondary text-muted-foreground">
                        {t(`goals.${c.goal}`)}
                      </span>
                    )}
                    {c.budget_max && (
                      <span className="text-xs text-muted-foreground">
                        {t("agent.clients.budgetUpTo", { value: Number(c.budget_max).toLocaleString("en-US") })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>{t("agent.clients.form.title")}</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-3">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("agent.clients.form.name")} className="h-12 rounded-xl" autoFocus />
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t("agent.clients.form.phone")} className="h-12 rounded-xl" />
            <Input value={budget} onChange={(e) => setBudget(e.target.value)} placeholder={t("agent.clients.form.budget")} type="number" className="h-12 rounded-xl" />
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                {t("agent.clients.form.goal")}
              </div>
              <div className="flex flex-wrap gap-2">
                {goalValues.map((g) => (
                  <button
                    key={g}
                    onClick={() => setGoal(g === goal ? null : g)}
                    className={cn(
                      "rounded-full px-3.5 py-2 text-xs font-medium border transition-colors",
                      goal === g
                        ? "bg-foreground text-background border-foreground"
                        : "bg-card border-border hover:border-accent/40"
                    )}
                  >
                    {t(`goals.${g}`)}
                  </button>
                ))}
              </div>
            </div>
            <Button
              onClick={submit}
              disabled={!name.trim() || create.isPending}
              className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 rounded-xl"
            >
              {t("agent.clients.form.submit")}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
