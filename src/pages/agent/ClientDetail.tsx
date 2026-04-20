import { useNavigate, useParams } from "react-router-dom";
import { TopBar } from "@/components/TopBar";
import { ArrowLeft, Phone, MessageCircle, MapPin } from "lucide-react";
import { useClient, useAssignments, useUpdateAssignmentStatus, type AssignmentStatus } from "@/hooks/useCloudData";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const statusOrder: { value: AssignmentStatus; color: string }[] = [
  { value: "new", color: "bg-secondary text-muted-foreground" },
  { value: "sent", color: "bg-accent/15 text-accent" },
  { value: "viewed", color: "bg-verdict-yellow/15 text-verdict-yellow" },
  { value: "interested", color: "bg-verdict-green/15 text-verdict-green" },
  { value: "rejected", color: "bg-verdict-red/15 text-verdict-red" },
  { value: "offer", color: "bg-accent/20 text-accent" },
  { value: "closed", color: "bg-foreground/15 text-foreground" },
];

export default function ClientDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: client, isLoading } = useClient(id);
  const { data: assignments = [] } = useAssignments(id);
  const updateStatus = useUpdateAssignmentStatus();

  if (isLoading || !client) {
    return (
      <div className="min-h-screen">
        <TopBar subtitle="Agent mode" />
        <div className="px-5 pt-4 text-sm text-muted-foreground">{t("agent.client.loading")}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <TopBar subtitle="Agent mode" />

      <div className="px-5 pt-2">
        <button
          onClick={() => navigate("/app/clients")}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> {t("agent.client.back")}
        </button>
      </div>

      <div className="px-5 mt-3">
        <div className="rounded-3xl bg-card border border-border p-5 shadow-soft">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-gradient-bronze grid place-items-center text-accent-foreground text-xl font-semibold shadow-bronze">
              {client.name[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-semibold tracking-tight truncate">{client.name}</h1>
              {client.phone && (
                <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                  <Phone className="h-3 w-3" /> {client.phone}
                </div>
              )}
            </div>
          </div>

          {(client.goal || client.budget_max) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {client.goal && (
                <span className="text-[11px] px-2.5 py-1 rounded-full bg-secondary text-foreground font-medium">
                  {t(`goals.${client.goal}`)}
                </span>
              )}
              {client.budget_max && (
                <span className="text-[11px] px-2.5 py-1 rounded-full bg-secondary text-foreground font-medium">
                  {t("agent.client.budgetUpTo", { value: Number(client.budget_max).toLocaleString("en-US") })}
                </span>
              )}
            </div>
          )}

          <div className="mt-4 grid grid-cols-2 gap-2">
            {client.phone && (
              <Button asChild variant="secondary" className="h-11 rounded-xl">
                <a href={`tel:${client.phone}`}>
                  <Phone className="h-4 w-4 mr-2" /> {t("agent.client.call")}
                </a>
              </Button>
            )}
            {client.phone && (
              <Button asChild className="h-11 rounded-xl bg-foreground text-background hover:bg-foreground/90">
                <a href={`https://wa.me/${client.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4 mr-2" /> {t("agent.client.whatsapp")}
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Assignments */}
      <div className="px-5 mt-6">
        <div className="flex items-baseline gap-2 mb-3">
          <h2 className="text-lg font-semibold tracking-tight">{t("agent.client.assignmentsTitle")}</h2>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Assignments</span>
        </div>
        {assignments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 p-6 text-center text-sm text-muted-foreground">
            {t("agent.client.noAssignments")}<br />
            <span className="text-xs">{t("agent.client.noAssignmentsHint")}</span>
          </div>
        ) : (
          <div className="space-y-2">
            {assignments.map((a) => {
              const p = a.property;
              const meta = statusOrder.find((s) => s.value === a.status)!;
              return (
                <div key={a.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "h-10 w-10 rounded-xl grid place-items-center shrink-0",
                      p?.verdict === "green" ? "bg-verdict-green/15" :
                      p?.verdict === "yellow" ? "bg-verdict-yellow/15" :
                      p?.verdict === "red" ? "bg-verdict-red/15" : "bg-secondary"
                    )}>
                      <span className={cn("h-2 w-2 rounded-full",
                        p?.verdict === "green" ? "bg-verdict-green" :
                        p?.verdict === "yellow" ? "bg-verdict-yellow" :
                        p?.verdict === "red" ? "bg-verdict-red" : "bg-muted-foreground")} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium leading-tight truncate">{p?.title ?? "—"}</div>
                      {p?.address && (
                        <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1 truncate">
                          <MapPin className="h-3 w-3 shrink-0" /> {p.address}
                        </div>
                      )}
                    </div>
                    <span className={cn("text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium", meta.color)}>
                      {t(`agent.client.statuses.${a.status}`)}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {statusOrder.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => updateStatus.mutate({ id: a.id, status: s.value })}
                        className={cn(
                          "text-[10px] uppercase tracking-wider px-2 py-1 rounded-full font-medium border transition-colors",
                          a.status === s.value
                            ? "bg-foreground text-background border-foreground"
                            : "bg-card border-border hover:border-accent/40 text-muted-foreground"
                        )}
                      >
                        {t(`agent.client.statuses.${s.value}`)}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
