import { ScreenHeader, EmptyState } from "@/components/TabShell";
import { Bell, BellRing, Eye } from "lucide-react";
import { useAlerts, useMarkAlertRead, useSaved } from "@/hooks/useCloudData";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ru as ruLocale, enUS as enLocale } from "date-fns/locale";
import { useTranslation } from "react-i18next";

const kindColors: Record<string, string> = {
  price_drop: "bg-verdict-green/15 text-verdict-green",
  new_listing: "bg-accent/15 text-accent",
  verdict_change: "bg-verdict-yellow/15 text-verdict-yellow",
  weekly: "bg-secondary text-muted-foreground",
};

export default function Alerts() {
  const { t, i18n } = useTranslation();
  const { data: alerts = [], isLoading } = useAlerts();
  const { data: saved = [] } = useSaved();
  const markRead = useMarkAlertRead();

  const dateLocale = i18n.language === "ru" ? ruLocale : enLocale;

  return (
    <div className="animate-fade-in">
      <ScreenHeader ru={t("buyer.alerts.title")} en={t("nav.alerts", { lng: "en" })} />

      {/* Watchlist summary */}
      {saved.length > 0 && (
        <div className="px-5 mb-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-soft flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-bronze grid place-items-center shadow-bronze">
              <Eye className="h-5 w-5 text-accent-foreground" />
            </div>
            <div className="flex-1">
              <div className="font-semibold leading-tight">{t("buyer.alerts.watchlist")}</div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-0.5">
                {t("buyer.alerts.watchlistSub", { count: saved.length })}
              </div>
            </div>
            <div className="text-2xl font-semibold tabular-nums">{saved.length}</div>
          </div>
        </div>
      )}

      {isLoading ? null : alerts.length === 0 ? (
        <EmptyState
          Icon={Bell}
          ru={t("buyer.alerts.empty")}
          en={t("buyer.alerts.empty", { lng: "en" })}
          hint={t("buyer.alerts.emptyHint")}
        />
      ) : (
        <div className="px-5 space-y-2">
          {alerts.map((a) => {
            const color = kindColors[a.kind] ?? kindColors.weekly;
            const kindLabel = t(`buyer.alerts.kinds.${a.kind}`, { defaultValue: a.kind });
            const kindLabelEn = t(`buyer.alerts.kinds.${a.kind}`, { lng: "en", defaultValue: a.kind });
            return (
              <button
                key={a.id}
                onClick={() => !a.read && markRead.mutate(a.id)}
                className={cn(
                  "w-full text-left rounded-2xl border p-4 shadow-soft transition-all hover:-translate-y-0.5",
                  a.read ? "border-border bg-card" : "border-accent/30 bg-accent/5"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn("h-9 w-9 rounded-xl grid place-items-center shrink-0", color)}>
                    {a.read ? <Bell className="h-4 w-4" /> : <BellRing className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="font-medium truncate">{a.title}</div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground shrink-0">
                        {formatDistanceToNow(new Date(a.created_at), { addSuffix: true, locale: dateLocale })}
                      </div>
                    </div>
                    <div className={cn("text-[10px] uppercase tracking-wider mt-0.5", color.split(" ")[1])}>
                      {kindLabel} · {kindLabelEn}
                    </div>
                    {a.body && <p className="text-sm text-muted-foreground mt-1.5">{a.body}</p>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
