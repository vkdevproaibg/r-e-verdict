import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Sparkles, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, Mail, Phone, Send } from "lucide-react";
import { type Verdict } from "@/hooks/useCloudData";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AIResult {
  verdict: Verdict;
  score: number;
  confidence: number;
  headline_ru: string;
  headline_en: string;
  reasons: { ru: string; en: string }[];
  red_flags: { ru: string; en: string; severity?: string }[];
  next_steps: { ru: string; en: string }[];
  price_proof?: { display_currency?: string; fair_price_min?: number; fair_price_max?: number };
}

const verdictMeta: Record<Verdict, { bg: string; text: string; ring: string; dot: string; label: string }> = {
  green: { bg: "bg-verdict-green/10", text: "text-verdict-green", ring: "ring-verdict-green/30", dot: "bg-verdict-green", label: "Strong buy" },
  yellow: { bg: "bg-verdict-yellow/10", text: "text-verdict-yellow", ring: "ring-verdict-yellow/30", dot: "bg-verdict-yellow", label: "Negotiate" },
  red: { bg: "bg-verdict-red/10", text: "text-verdict-red", ring: "ring-verdict-red/30", dot: "bg-verdict-red", label: "Walk away" },
};

interface AgentBrand {
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  activeListings?: number;
}

function loadAgent(): AgentBrand {
  try {
    const p = JSON.parse(localStorage.getItem("propaai_profile") ?? "{}");
    return {
      name: p.name || p.fullName,
      company: p.company,
      email: p.email,
      phone: p.phone,
    };
  } catch { return {}; }
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function SharePage() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const [result, setResult] = useState<AIResult | null>(null);
  const [property, setProperty] = useState<{
    title: string;
    address: string | null;
    city: string | null;
    price: number;
    currency: string;
    area_sqm: number | null;
    bedrooms: number | null;
    bathrooms: number | null;
    description: string | null;
  } | null>(null);
  const [dbAgent, setDbAgent] = useState<AgentBrand | null>(null);
  const [form, setForm] = useState({ name: "", contact: "", note: "" });
  const [sent, setSent] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const lang = i18n.language === "ru" ? "ru" : "en";

  useEffect(() => {
    // Prefer sessionStorage payload (agent preview flow)
    const raw = id ? sessionStorage.getItem(`propaai_share_${id}`) ?? sessionStorage.getItem(`propaai_result_${id}`) : null;
    const fallback = sessionStorage.getItem("propaai_last_result");
    const cached = raw ?? fallback;
    if (cached) {
      setResult(JSON.parse(cached));
      return;
    }
    // Otherwise try to hydrate from DB when id is a property UUID
    if (!id || !UUID_RE.test(id)) {
      setNotFound(true);
      return;
    }
    (async () => {
      const { data: prop } = await supabase
        .from("properties")
        .select("id,title,address,city,price,currency,area_sqm,bedrooms,bathrooms,description,agent_id,verdict,score,is_public")
        .eq("id", id)
        .eq("is_public", true)
        .maybeSingle();
      if (!prop) {
        setNotFound(true);
        return;
      }
      setProperty(prop);
      if (prop.agent_id) {
        const { data: a } = await supabase
          .from("agents")
          .select("name,company,contact_email,contact_phone")
          .eq("id", prop.agent_id)
          .maybeSingle();
        if (a) setDbAgent({ name: a.name ?? undefined, company: a.company ?? undefined, email: a.contact_email ?? undefined, phone: a.contact_phone ?? undefined });
      }
      // Try the latest analysis attached to this property
      const { data: an } = await supabase
        .from("analyses")
        .select("verdict,score,confidence,raw,reasons,red_flags,next_steps")
        .eq("property_id", id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      const rawAI = (an?.raw as Partial<AIResult> | null) ?? null;
      setResult({
        verdict: (an?.verdict as Verdict) ?? (prop.verdict as Verdict) ?? "yellow",
        score: an?.score ?? prop.score ?? 70,
        confidence: an?.confidence ?? 60,
        headline_ru: rawAI?.headline_ru ?? prop.title,
        headline_en: rawAI?.headline_en ?? prop.title,
        reasons: (an?.reasons as AIResult["reasons"]) ?? rawAI?.reasons ?? [],
        red_flags: (an?.red_flags as AIResult["red_flags"]) ?? rawAI?.red_flags ?? [],
        next_steps: (an?.next_steps as AIResult["next_steps"]) ?? rawAI?.next_steps ?? [],
        price_proof: rawAI?.price_proof,
      });
    })();
  }, [id]);

  const localAgent = useMemo(loadAgent, []);
  const agent = dbAgent ?? localAgent;
  const activityLabel = (agent.activeListings ?? 0) >= 3 ? "Активно ведёт объекты" : "Верифицированный агент";

  const submitLead = async () => {
    if (!form.name.trim() || !form.contact.trim()) {
      toast.error("Укажите имя и контакт");
      return;
    }
    // TODO: once Client Packs are created for public listings we'll persist to
    // the `leads` table (requires client_pack_id + agent_id). For now, keep it
    // client-side so the agent can pick it up.
    try {
      const leads = JSON.parse(localStorage.getItem("propaai_leads") ?? "[]");
      leads.push({ id, at: Date.now(), ...form });
      localStorage.setItem("propaai_leads", JSON.stringify(leads));
    } catch { /* ignore */ }
    setSent(true);
    toast.success("Заявка отправлена агенту");
  };

  if (notFound) {
    return (
      <div className="min-h-screen grid place-items-center bg-background px-6 text-center">
        <div>
          <h1 className="text-xl font-semibold">Report not available</h1>
          <p className="mt-2 text-sm text-muted-foreground">This share link has expired.</p>
          <Link to="/" className="mt-4 inline-flex items-center gap-1 text-sm text-accent hover:underline">
            Open Propa AI <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen grid place-items-center bg-background px-6 text-center">
        <div className="text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }

  const v = verdictMeta[result.verdict];
  const headline = lang === "ru" ? result.headline_ru : result.headline_en;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-5 lg:px-8 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-gradient-charcoal grid place-items-center">
              <span className="text-[10px] font-bold tracking-widest text-background">P</span>
            </div>
            <span className="text-sm font-semibold tracking-tight">{t("brand.name")}</span>
          </Link>
          <Link
            to="/app/analyze"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Analyze your own →
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 lg:px-8 py-10 lg:py-16">
        {/* Presented by agent */}
        <div className="rounded-3xl border border-border bg-card p-5 lg:p-6 shadow-soft">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            {t("result.presentedBy")}
          </div>
          <div className="mt-2 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="font-serif-display text-2xl lg:text-3xl leading-tight truncate">
                {agent.name || "Propa Agent"}
              </div>
              {agent.company && (
                <div className="text-sm text-muted-foreground mt-0.5 truncate">{agent.company}</div>
              )}
              <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-accent">
                <ShieldCheck className="h-3.5 w-3.5" /> {activityLabel}
              </div>
            </div>
          </div>
        </div>

        {/* Hero verdict */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={cn("mt-6 rounded-3xl border ring-1 p-6 lg:p-10", v.bg, v.ring, "border-transparent")}
        >
          <div className={cn("text-[11px] uppercase tracking-widest font-semibold inline-flex items-center gap-1.5", v.text)}>
            <Sparkles className="h-3 w-3" />
            <span className={cn("h-1.5 w-1.5 rounded-full", v.dot)} />
            {v.label}
          </div>
          <h1 className="mt-3 text-3xl lg:text-5xl font-semibold tracking-tight leading-[1.1]">
            {headline}
          </h1>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Metric label="Score" value={`${result.score}`} accent />
            <Metric label="Confidence" value={`${result.confidence}%`} />
            <Metric label="Verdict" value={v.label} />
          </div>
        </motion.div>

        {/* Reasons */}
        {result.reasons?.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-semibold tracking-tight mb-3">{t("result.reasons")}</h2>
            <div className="space-y-2">
              {result.reasons.map((r, i) => (
                <div key={i} className="rounded-2xl border border-border bg-card p-4 flex gap-3">
                  <CheckCircle2 className="h-4 w-4 text-verdict-green mt-0.5 shrink-0" />
                  <div className="text-sm leading-snug">{lang === "ru" ? r.ru : r.en}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Red flags */}
        {result.red_flags?.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xl font-semibold tracking-tight mb-3">{t("result.redFlags")}</h2>
            <div className="grid sm:grid-cols-2 gap-2">
              {result.red_flags.map((r, i) => (
                <div key={i} className="rounded-2xl border border-border bg-card p-4 flex gap-3">
                  <AlertTriangle className="h-4 w-4 text-verdict-yellow mt-0.5 shrink-0" />
                  <div className="text-sm leading-snug">{lang === "ru" ? r.ru : r.en}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Contact agent — lead form */}
        <section className="mt-12 rounded-3xl border border-border bg-card p-6 lg:p-8 shadow-soft">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-accent">
            <ShieldCheck className="h-3.5 w-3.5" /> Заявка идёт напрямую агенту
          </div>
          <h3 className="mt-2 font-serif-display text-2xl lg:text-3xl">
            Интересно — связаться с агентом
          </h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            Ваш контакт получит только автор этого разбора. Мы не продаём и не перенаправляем лиды.
          </p>

          {sent ? (
            <div className="mt-5 rounded-2xl bg-verdict-green/10 text-verdict-green p-4 text-sm inline-flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Отправлено. Агент свяжется с вами.
            </div>
          ) : (
            <div className="mt-5 grid gap-2 max-w-md">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ваше имя"
                className="h-11 rounded-xl bg-background border border-border px-4 text-sm focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/15"
              />
              <input
                value={form.contact}
                onChange={(e) => setForm({ ...form, contact: e.target.value })}
                placeholder="Телефон или email"
                className="h-11 rounded-xl bg-background border border-border px-4 text-sm focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/15"
              />
              <textarea
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="Комментарий (необязательно)"
                rows={3}
                className="rounded-xl bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/15 resize-none"
              />
              <button
                onClick={submitLead}
                className="mt-1 h-11 rounded-xl bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors inline-flex items-center justify-center gap-2"
              >
                <Send className="h-4 w-4" /> Отправить агенту
              </button>
              {(agent.email || agent.phone) && (
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {agent.email && (
                    <a href={`mailto:${agent.email}`} className="inline-flex items-center gap-1.5 hover:text-foreground">
                      <Mail className="h-3.5 w-3.5" /> {agent.email}
                    </a>
                  )}
                  {agent.phone && (
                    <a href={`tel:${agent.phone}`} className="inline-flex items-center gap-1.5 hover:text-foreground">
                      <Phone className="h-3.5 w-3.5" /> {agent.phone}
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        {/* CTA */}
        <section className="mt-12 rounded-3xl bg-gradient-charcoal text-background p-8 lg:p-10 text-center">
          <div className="text-[10px] uppercase tracking-widest opacity-70">Powered by Propa AI</div>
          <h3 className="mt-2 text-2xl lg:text-3xl font-semibold tracking-tight">
            Want a verdict on your next property?
          </h3>
          <Link
            to="/app/analyze"
            className="mt-5 inline-flex h-11 items-center px-6 rounded-full bg-accent text-accent-foreground font-medium hover:opacity-90 transition-opacity"
          >
            Try Propa free <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </section>
      </main>
    </div>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={cn("rounded-2xl border p-3 bg-card/60", accent ? "border-accent/30" : "border-border")}>
      <div className={cn("text-2xl font-semibold leading-none tabular-nums", accent && "text-accent")}>{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1.5">{label}</div>
    </div>
  );
}
