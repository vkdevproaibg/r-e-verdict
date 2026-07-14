import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, MapPin, Home, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/state/SessionContext";
import { cn } from "@/lib/utils";

type Step = 1 | 2;

interface Draft {
  title: string;
  address: string;
  city: string;
  country: string;
  lat: string;
  lng: string;
  price: string;
  currency: string;
  area_sqm: string;
  bedrooms: string;
  bathrooms: string;
  description: string;
  deal_type: "sale" | "rent";
  property_type: "apartment" | "house" | "villa" | "townhouse" | "commercial" | "land";
}

const empty: Draft = {
  title: "",
  address: "",
  city: "",
  country: "",
  lat: "",
  lng: "",
  price: "",
  currency: "USD",
  area_sqm: "",
  bedrooms: "",
  bathrooms: "",
  description: "",
  deal_type: "sale",
  property_type: "apartment",
};

export default function AddObjectPage() {
  const { i18n } = useTranslation();
  const lang = i18n.language === "ru" ? "ru" : "en";
  const navigate = useNavigate();
  const { user, ensureAgent } = useSession();
  const [step, setStep] = useState<Step>(1);
  const [busy, setBusy] = useState(false);
  const [d, setD] = useState<Draft>(empty);

  if (!user) {
    return (
      <div className="min-h-screen grid place-items-center bg-background px-6 text-center">
        <div className="max-w-xs">
          <div className="text-[10px] uppercase tracking-widest text-accent font-semibold">
            {lang === "ru" ? "Только для агентов" : "Agents only"}
          </div>
          <h1 className="mt-3 font-serif-display text-3xl leading-tight">
            {lang === "ru" ? "Войдите, чтобы добавить объект" : "Sign in to add an object"}
          </h1>
          <Button onClick={() => navigate("/login")} className="mt-6 h-11 rounded-xl w-full bg-foreground text-background hover:bg-foreground/90">
            {lang === "ru" ? "Войти" : "Sign in"}
          </Button>
        </div>
      </div>
    );
  }

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((p) => ({ ...p, [k]: v }));

  const canContinue =
    d.title.trim().length > 2 &&
    d.address.trim().length > 3 &&
    !!parseFloat(d.lat) &&
    !!parseFloat(d.lng);

  const canSubmit = canContinue && parseFloat(d.price) > 0;

  const useMyLocation = () => {
    if (!("geolocation" in navigator)) {
      toast.error(lang === "ru" ? "Геолокация недоступна" : "Geolocation unavailable");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        set("lat", p.coords.latitude.toFixed(6));
        set("lng", p.coords.longitude.toFixed(6));
        toast.success(lang === "ru" ? "Координаты добавлены" : "Coordinates captured");
      },
      () => toast.error(lang === "ru" ? "Доступ отклонён" : "Permission denied"),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 8000 }
    );
  };

  const submit = async () => {
    if (!canSubmit || busy) return;
    setBusy(true);
    try {
      const agentId = await ensureAgent();
      if (!agentId) throw new Error("Could not initialise agent profile");
      const slug =
        (d.city.trim().toLowerCase().replace(/\s+/g, "-") || "unknown") +
        "-" +
        Math.random().toString(36).slice(2, 7);
      const lat = parseFloat(d.lat);
      const lng = parseFloat(d.lng);
      const price = parseFloat(d.price);
      const area = d.area_sqm ? parseFloat(d.area_sqm) : null;
      const { data, error } = await supabase
        .from("properties")
        .insert([{
          agent_id: agentId,
          title: d.title.trim(),
          address: d.address.trim(),
          city: d.city.trim() || null,
          city_slug: slug,
          lat,
          lng,
          price,
          currency: d.currency,
          area_sqm: area,
          bedrooms: d.bedrooms ? parseInt(d.bedrooms) : null,
          bathrooms: d.bathrooms ? parseInt(d.bathrooms) : null,
          description: d.description.trim() || null,
          deal_type: d.deal_type,
          property_type:
            d.property_type === "land"
              ? "land"
              : d.property_type === "commercial"
              ? "micro_commercial"
              : "residential",
          side: "own_listing",
          is_public: true,
          object_status: "active",
          source_type: "manual",
        }])
        .select("id")
        .single();
      if (error) throw error;
      const propertyId = data.id;
      toast.success(lang === "ru" ? "Объект добавлен" : "Object added");

      // Fire-and-forget: auto-analyze and create a shareable client pack.
      // We navigate immediately; the pack page hydrates from DB once ready.
      (async () => {
        try {
          const purpose = d.deal_type === "rent" ? "rent" : "buy";
          const { data: ai, error: aiErr } = await supabase.functions.invoke("analyze", {
            body: {
              kind: "address",
              query: [d.address.trim(), d.city.trim(), d.country.trim()].filter(Boolean).join(", "),
              lat,
              lng,
              purpose,
              agent_country: d.country.trim() || undefined,
              refine: {
                type: d.property_type,
                area: area ?? undefined,
                purpose,
                price: price || undefined,
              },
            },
          });
          if (aiErr || !ai) return;
          const raw = ai as Record<string, unknown>;
          const rawVerdict = raw.verdict as string | undefined;
          const verdict: "green" | "yellow" | "red" =
            rawVerdict === "green" || rawVerdict === "red" ? rawVerdict : "yellow";
          const score = (raw.score as number) ?? null;
          const confidence = (raw.confidence as number) ?? null;

          type Json = import("@/integrations/supabase/types").Database["public"]["Tables"]["analyses"]["Insert"]["raw"];
          const asJson = (v: unknown): Json => (v ?? []) as Json;

          await supabase.from("analyses").insert([{
            device_id: agentId,
            property_id: propertyId,
            input_kind: "address",
            input_payload: {
              address: d.address,
              city: d.city,
              country: d.country,
              deal_type: d.deal_type,
            },
            verdict,
            score,
            confidence,
            reasons: asJson(raw.reasons),
            red_flags: asJson(raw.red_flags),
            next_steps: asJson(raw.next_steps),
            raw: raw as Json,
          }]);

          await supabase.from("properties").update({
            verdict,
            score,
          }).eq("id", propertyId);

          const pack_slug = propertyId.replace(/-/g, "").slice(0, 12);
          await supabase.from("client_packs").insert([{
            object_id: propertyId,
            agent_id: agentId,
            share_slug: pack_slug,
            is_public: true,
            verdict_text: (raw.headline_ru as string) ?? (raw.headline_en as string) ?? null,
            client_explanation: asJson(raw.reasons),
            risks: asJson(raw.red_flags),
            price_argument:
              typeof raw.price_proof === "object" && raw.price_proof !== null
                ? JSON.stringify(raw.price_proof)
                : null,
            next_step: Array.isArray(raw.next_steps) && raw.next_steps.length > 0
              ? JSON.stringify(raw.next_steps[0])
              : null,
          }]);
        } catch (e) {
          console.warn("auto-analyze failed", e);
        }
      })();

      navigate(`/app/pack/${propertyId}`, { replace: true });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur">
        <div className="max-w-2xl mx-auto px-5 lg:px-8 h-14 flex items-center justify-between">
          <button
            onClick={() => (step === 1 ? navigate(-1) : setStep(1))}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> {lang === "ru" ? "Назад" : "Back"}
          </button>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            {lang === "ru" ? `Шаг ${step} из 2` : `Step ${step} of 2`}
          </div>
        </div>
        <div className="h-0.5 bg-border">
          <motion.div
            initial={false}
            animate={{ width: step === 1 ? "50%" : "100%" }}
            className="h-full bg-accent"
          />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 lg:px-8 pt-8">
        {step === 1 ? (
          <motion.section
            key="s1"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-[10px] uppercase tracking-widest text-accent font-semibold">
              {lang === "ru" ? "Основное" : "Basics"}
            </div>
            <h1 className="mt-2 font-serif-display text-3xl lg:text-4xl leading-tight">
              {lang === "ru" ? "Что за объект?" : "About the property"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-md">
              {lang === "ru"
                ? "Название клиенту не показываем — оно только для вас."
                : "The title stays internal; clients see the analysis."}
            </p>

            <div className="mt-8 space-y-5">
              <Field label={lang === "ru" ? "Название" : "Title"}>
                <Input value={d.title} onChange={(e) => set("title", e.target.value)} placeholder={lang === "ru" ? "Пентхаус в Пальме" : "Palm penthouse"} className="h-11 rounded-xl" />
              </Field>
              <Field label={lang === "ru" ? "Адрес" : "Address"} icon={<Home className="h-3.5 w-3.5" />}>
                <Input value={d.address} onChange={(e) => set("address", e.target.value)} placeholder="Marina View, Dubai" className="h-11 rounded-xl" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label={lang === "ru" ? "Город" : "City"}>
                  <Input value={d.city} onChange={(e) => set("city", e.target.value)} className="h-11 rounded-xl" />
                </Field>
                <Field label={lang === "ru" ? "Страна" : "Country"}>
                  <Input value={d.country} onChange={(e) => set("country", e.target.value)} className="h-11 rounded-xl" />
                </Field>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> {lang === "ru" ? "Координаты" : "Coordinates"}
                  </Label>
                  <button onClick={useMyLocation} type="button" className="text-[11px] font-medium text-accent hover:underline">
                    {lang === "ru" ? "Взять с текущего места" : "Use my location"}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input value={d.lat} onChange={(e) => set("lat", e.target.value)} inputMode="decimal" placeholder="lat" className="h-11 rounded-xl" />
                  <Input value={d.lng} onChange={(e) => set("lng", e.target.value)} inputMode="decimal" placeholder="lng" className="h-11 rounded-xl" />
                </div>
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  {lang === "ru"
                    ? "Нужны, чтобы покупатели рядом видели именно ваш листинг."
                    : "Used so buyers nearby land on your listing."}
                </p>
              </div>

              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  {lang === "ru" ? "Сделка" : "Deal"}
                </Label>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  {(["sale", "rent"] as const).map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => set("deal_type", k)}
                      className={cn(
                        "h-11 rounded-xl border text-sm font-medium transition-all",
                        d.deal_type === k
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-border text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {k === "sale"
                        ? lang === "ru" ? "Продажа" : "Sale"
                        : lang === "ru" ? "Аренда" : "Rent"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-10">
              <Button
                onClick={() => setStep(2)}
                disabled={!canContinue}
                className="w-full h-12 rounded-2xl bg-foreground text-background hover:bg-foreground/90"
              >
                {lang === "ru" ? "Далее" : "Next"} <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </motion.section>
        ) : (
          <motion.section
            key="s2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-[10px] uppercase tracking-widest text-accent font-semibold">
              {lang === "ru" ? "Цена и детали" : "Price & details"}
            </div>
            <h1 className="mt-2 font-serif-display text-3xl lg:text-4xl leading-tight">
              {lang === "ru" ? "Финальные штрихи" : "Final details"}
            </h1>

            <div className="mt-8 space-y-5">
              <div className="grid grid-cols-3 gap-3">
                <Field label={lang === "ru" ? "Цена" : "Price"} icon={<DollarSign className="h-3.5 w-3.5" />} className="col-span-2">
                  <Input value={d.price} onChange={(e) => set("price", e.target.value)} inputMode="decimal" placeholder="1200000" className="h-11 rounded-xl" />
                </Field>
                <Field label={lang === "ru" ? "Валюта" : "Ccy"}>
                  <select
                    value={d.currency}
                    onChange={(e) => set("currency", e.target.value)}
                    className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
                  >
                    {["USD", "EUR", "AED", "GBP", "GEL", "RUB"].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Field label={lang === "ru" ? "Площадь м²" : "Area m²"}>
                  <Input value={d.area_sqm} onChange={(e) => set("area_sqm", e.target.value)} inputMode="decimal" className="h-11 rounded-xl" />
                </Field>
                <Field label={lang === "ru" ? "Спальни" : "Beds"}>
                  <Input value={d.bedrooms} onChange={(e) => set("bedrooms", e.target.value)} inputMode="numeric" className="h-11 rounded-xl" />
                </Field>
                <Field label={lang === "ru" ? "Санузлы" : "Baths"}>
                  <Input value={d.bathrooms} onChange={(e) => set("bathrooms", e.target.value)} inputMode="numeric" className="h-11 rounded-xl" />
                </Field>
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  {lang === "ru" ? "Тип" : "Type"}
                </Label>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {(["apartment", "house", "villa", "townhouse", "commercial", "land"] as const).map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => set("property_type", k)}
                      className={cn(
                        "h-9 px-3.5 rounded-full border text-[13px] font-medium transition-all",
                        d.property_type === k
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-border text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {k}
                    </button>
                  ))}
                </div>
              </div>
              <Field label={lang === "ru" ? "Описание" : "Description"}>
                <Textarea
                  value={d.description}
                  onChange={(e) => set("description", e.target.value)}
                  rows={4}
                  placeholder={lang === "ru" ? "Что важно знать клиенту…" : "What clients should know…"}
                  className="rounded-xl"
                />
              </Field>
            </div>

            <div className="mt-10">
              <Button
                onClick={submit}
                disabled={!canSubmit || busy}
                className="w-full h-12 rounded-2xl bg-foreground text-background hover:bg-foreground/90"
              >
                {busy
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : (lang === "ru" ? "Сохранить и создать Client Pack" : "Save & create Client Pack")}
              </Button>
              <p className="mt-2 text-[11px] text-muted-foreground text-center">
                {lang === "ru"
                  ? "Объект станет виден покупателям, оказавшимся рядом."
                  : "Buyers nearby will land on this listing."}
              </p>
            </div>
          </motion.section>
        )}
      </main>
    </div>
  );
}

function Field({
  label,
  icon,
  children,
  className,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1.5">
        {icon}
        {label}
      </Label>
      {children}
    </div>
  );
}
