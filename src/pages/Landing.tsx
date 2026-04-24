import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Eye,
  Layers3,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import heroInterior from "@/assets/hero-interior.jpg";
import heroExterior from "@/assets/hero-exterior.jpg";
import heroCity from "@/assets/hero-city.jpg";

export default function Landing() {
  const { t } = useTranslation();

  const pillars = [
    { Icon: Eye, key: "vision" as const },
    { Icon: Layers3, key: "context" as const },
    { Icon: ShieldCheck, key: "evidence" as const },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-5 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-charcoal grid place-items-center shadow-soft">
              <span className="text-xs font-bold tracking-widest text-background">P</span>
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">{t("brand.name")}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {t("brand.tagline")}
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
            <Link
              to="/login"
              className="hidden sm:inline-flex h-9 items-center px-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("nav.signIn")}
            </Link>
            <Button asChild size="sm" className="rounded-full bg-gradient-bronze text-accent-foreground hover:opacity-90 shadow-bronze h-9 px-4 font-semibold">
              <Link to="/splash">{t("nav.signUp")}</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 pt-12 lg:pt-24 pb-20 lg:pb-28 grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
            className="lg:col-span-6"
          >
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 backdrop-blur px-3 py-1 text-[10px] uppercase tracking-widest text-muted-foreground">
              <Sparkles className="h-3 w-3 text-accent" />
              {t("landing.eyebrow")}
            </div>
            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-[64px] font-semibold leading-[1.05] tracking-tight">
              {t("landing.headline")}
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-xl leading-relaxed">
              {t("landing.sub")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-13 px-7 rounded-full bg-gradient-bronze text-accent-foreground hover:opacity-90 shadow-bronze font-semibold">
                <Link to="/splash">
                  {t("landing.ctaPrimary")} <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-6 rounded-full">
                <a href="#sample">{t("landing.ctaSecondary")}</a>
              </Button>
            </div>
            <div className="mt-10 text-[11px] uppercase tracking-widest text-muted-foreground">
              {t("landing.trustedBy")}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.32, 0.72, 0, 1] }}
            className="lg:col-span-6 relative"
          >
            <div className="relative aspect-[4/5] sm:aspect-[16/12] rounded-3xl overflow-hidden shadow-elevated ring-1 ring-border">
              <img
                src={heroInterior}
                alt="Premium apartment interior at sunset"
                width={1920}
                height={1280}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/0 to-background/0" />
              {/* Floating verdict card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="absolute bottom-5 left-5 right-5 sm:left-auto sm:right-5 sm:w-72 rounded-2xl bg-card/95 backdrop-blur-xl border border-border p-4 shadow-elevated"
              >
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-verdict-green font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-verdict-green" />
                  Strong buy · 87/100
                </div>
                <div className="mt-1.5 text-sm font-semibold leading-tight">
                  Priced 4% under comps. Liquid micro-market.
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Confidence 92%</span>
                  <span>3 reasons · 1 flag</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pillars */}
      <section className="border-t border-border bg-secondary/30">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-20 lg:py-28">
          <div className="max-w-2xl">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {t("landing.pillars.title")}
            </div>
            <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight">
              {t("landing.pillars.title")}
            </h2>
          </div>
          <div className="mt-12 grid md:grid-cols-3 gap-5">
            {pillars.map(({ Icon, key }, i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="rounded-3xl bg-card border border-border p-6 lg:p-8 shadow-soft"
              >
                <div className="h-11 w-11 rounded-xl bg-gradient-bronze grid place-items-center shadow-bronze">
                  <Icon className="h-5 w-5 text-accent-foreground" />
                </div>
                <h3 className="mt-5 text-xl font-semibold tracking-tight">
                  {t(`landing.pillars.${key}.title`)}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {t(`landing.pillars.${key}.body`)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample report */}
      <section id="sample" className="border-t border-border">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-20 lg:py-28 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {t("landing.sample.eyebrow")}
            </div>
            <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
              {t("landing.sample.title")}
            </h2>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed">
              {t("landing.sample.body")}
            </p>
            <Button asChild size="lg" className="mt-7 h-13 px-7 rounded-full bg-gradient-bronze text-accent-foreground hover:opacity-90 shadow-bronze font-semibold">
              <Link to="/splash">
                {t("landing.ctaPrimary")} <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7"
          >
            <SampleReportCard />
          </motion.div>
        </div>
      </section>

      {/* Trust */}
      <section className="border-t border-border bg-secondary/30">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-16 lg:py-20">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            {t("landing.trust.title")}
          </div>
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {(t("landing.trust.items", { returnObjects: true }) as string[]).map((item) => (
              <div
                key={item}
                className="rounded-2xl bg-card border border-border p-5 text-sm font-medium"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA footer */}
      <section className="border-t border-border relative overflow-hidden">
        <img
          src={heroCity}
          alt=""
          aria-hidden="true"
          loading="lazy"
          width={1600}
          height={1000}
          className="absolute inset-0 h-full w-full object-cover opacity-25 dark:opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/95 to-background" />
        <div className="relative max-w-4xl mx-auto px-5 lg:px-8 py-20 lg:py-28 text-center">
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight leading-tight">
            {t("landing.ctaFooter.title")}
          </h2>
          <p className="mt-4 text-muted-foreground">{t("landing.ctaFooter.body")}</p>
          <Button asChild size="lg" className="mt-8 h-13 px-8 rounded-full bg-gradient-bronze text-accent-foreground hover:opacity-90 shadow-bronze font-semibold">
            <Link to="/splash">
              {t("landing.ctaFooter.cta")} <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-8 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <div>© {new Date().getFullYear()} Propa AI</div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hover:text-foreground">{t("nav.signIn")}</Link>
            <Link to="/signup" className="hover:text-foreground">{t("nav.signUp")}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SampleReportCard() {
  return (
    <div className="rounded-3xl bg-card border border-border shadow-elevated overflow-hidden">
      <div className="relative h-44 sm:h-52">
        <img
          src={heroExterior}
          alt="Sample property exterior"
          loading="lazy"
          width={1600}
          height={1200}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-card/95 backdrop-blur px-3 py-1 text-[10px] uppercase tracking-widest font-semibold text-verdict-green">
          <span className="h-1.5 w-1.5 rounded-full bg-verdict-green" />
          Strong buy
        </div>
      </div>
      <div className="p-6 space-y-5">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            127 Marina Heights · Dubai
          </div>
          <h3 className="mt-1 text-2xl font-semibold tracking-tight">
            Priced 4% under comps. High liquidity.
          </h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Metric label="Score" value="87" accent />
          <Metric label="Confidence" value="92%" />
          <Metric label="Yield" value="6.2%" />
        </div>
        <div className="space-y-2 pt-2 border-t border-border">
          {[
            { Icon: CheckCircle2, color: "text-verdict-green", text: "Comps support 4% upside in 12 months" },
            { Icon: CheckCircle2, color: "text-verdict-green", text: "Sub-market absorption < 60 days" },
            { Icon: AlertTriangle, color: "text-verdict-yellow", text: "Verify service-charge increase 2025" },
          ].map((r, i) => (
            <div key={i} className="flex items-start gap-2.5 text-sm">
              <r.Icon className={`h-4 w-4 mt-0.5 shrink-0 ${r.color}`} />
              <span>{r.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-3 ${accent ? "border-accent/30 bg-accent/5" : "border-border bg-secondary/40"}`}>
      <div className={`text-2xl font-semibold leading-none tabular-nums ${accent ? "text-accent" : ""}`}>
        {value}
      </div>
      <div className="mt-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
    </div>
  );
}
