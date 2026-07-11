import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Globe, Moon, Sun, Monitor, Shield, Plug, MapPin } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { SUPPORTED_LANGS, FULLY_LOCALIZED } from "@/i18n";
import { cn } from "@/lib/utils";
import { COUNTRIES, getAgentCountry, setAgentCountry, type CountryCode } from "@/lib/countries";

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [country, setCountry] = useState<CountryCode>(getAgentCountry());

  return (
    <div className="px-5 lg:px-8 py-8 lg:py-12 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{t("settings.title")}</h1>
      </div>

      <Section title={t("settings.theme")} Icon={Sun}>
        <div className="grid grid-cols-3 gap-2">
          {([
            { key: "light", Icon: Sun, label: t("theme.light") },
            { key: "dark", Icon: Moon, label: t("theme.dark") },
            { key: "system", Icon: Monitor, label: t("theme.system") },
          ] as const).map(({ key, Icon, label }) => (
            <button
              key={key}
              onClick={() => setTheme(key)}
              className={cn(
                "rounded-2xl border p-4 text-left transition-colors",
                theme === key
                  ? "border-accent bg-accent/5"
                  : "border-border bg-card hover:border-accent/40"
              )}
            >
              <Icon className={cn("h-4 w-4", theme === key ? "text-accent" : "text-muted-foreground")} />
              <div className="mt-3 text-sm font-medium">{label}</div>
            </button>
          ))}
        </div>
      </Section>

      <Section title={t("settings.language")} Icon={Globe}>
        <div className="grid sm:grid-cols-2 gap-2">
          {SUPPORTED_LANGS.map((l) => {
            const active = l.code === i18n.language;
            const full = FULLY_LOCALIZED.has(l.code);
            return (
              <button
                key={l.code}
                onClick={() => i18n.changeLanguage(l.code)}
                className={cn(
                  "rounded-xl border p-3 flex items-center justify-between transition-colors",
                  active ? "border-accent bg-accent/5" : "border-border bg-card hover:border-accent/40"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground w-6">{l.code}</span>
                  <span className="text-sm">{l.native}</span>
                  {!full && <span className="text-[9px] uppercase tracking-wider text-muted-foreground/60">soon</span>}
                </div>
                {active && <Check className="h-4 w-4 text-accent" />}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title={t("settings.country") ?? "Country · Страна"} Icon={MapPin}>
        <div className="rounded-2xl border border-border bg-card p-2 grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {COUNTRIES.map((c) => {
            const active = c.code === country;
            return (
              <button
                key={c.code}
                onClick={() => { setCountry(c.code); setAgentCountry(c.code); }}
                className={cn(
                  "rounded-xl px-3 py-2.5 text-left transition-all flex items-center gap-2",
                  active ? "bg-gradient-bronze text-accent-foreground shadow-bronze" : "hover:bg-secondary"
                )}
              >
                <span className="text-lg leading-none">{c.flag}</span>
                <span className="text-xs font-medium tracking-tight truncate">{c.label}</span>
                {active && <Check className="h-3.5 w-3.5 ml-auto shrink-0" />}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground/80 leading-relaxed px-1">
          {t("settings.countryHint") ?? "Определяет, какие площадки (Zillow, Bayut, myhome.ge и т.д.) и локальные листинги ИИ будет использовать по умолчанию."}
        </p>
      </Section>

      <Section title={t("settings.privacy")} Icon={Shield}>
        <div className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
          Your data stays on your device by default. Sign in to sync across devices and enable alerts.
        </div>
      </Section>

      <Section title={t("settings.integrations")} Icon={Plug}>
        <div className="grid sm:grid-cols-3 gap-2">
          {["Zillow", "Redfin", "Bayut"].map((name) => (
            <div key={name} className="rounded-2xl border border-border bg-card p-4">
              <div className="text-sm font-semibold">{name}</div>
              <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">Coming soon</div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Section({ title, Icon, children }: { title: string; Icon: typeof Globe; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      </div>
      {children}
    </section>
  );
}
