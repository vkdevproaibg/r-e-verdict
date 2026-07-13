import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Sparkles, Loader2, Check } from "lucide-react";
import { db } from "@/integrations/supabase/db";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/state/AppContext";
import { useBuyerProfile } from "@/state/BuyerProfileContext";
import { useRole } from "@/state/RoleContext";

const STAGE_KEYS = ["reading", "signals", "comparing", "fairPrice", "risks", "verdict"] as const;

export default function GatherContextPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { geo } = useApp();
  const { profile } = useBuyerProfile();
  const { role } = useRole();
  const { t } = useTranslation();
  const [stage, setStage] = useState(0);
  const startedRef = useRef(false);

  const kind = params.get("kind") ?? "text";
  const q = params.get("q") ?? "";
  const purpose = (params.get("purpose") === "rent" ? "rent" : "buy") as "buy" | "rent";
  const areaParam = params.get("area") ?? "";
  const latParam = params.get("lat");
  const lngParam = params.get("lng");
  const refineParam = params.get("refine");
  let refine: Record<string, string> = {};
  if (refineParam) {
    try { refine = JSON.parse(decodeURIComponent(refineParam)); } catch { /* ignore */ }
  }
  if (areaParam && !refine.area) refine.area = areaParam;

  useEffect(() => {
    const t = setInterval(
      () => setStage((s) => Math.min(s + 1, STAGE_KEYS.length - 1)),
      850
    );
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    (async () => {
      const id = `analysis_${Date.now()}`;
      // Geo is ONLY meaningful when the user explicitly entered via "use my location".
      // For address / text / url / photo / document the AI must rely on the query
      // (or the address baked into refine{}), never on the device coordinates.
      const useGeo = kind === "location";
      const lat = useGeo ? (latParam ? Number(latParam) : geo?.lat) : undefined;
      const lng = useGeo ? (lngParam ? Number(lngParam) : geo?.lng) : undefined;

      // Buyer proximity redirect: if the buyer lands within 50m of a public
      // own_listing, take them straight to that agent's client-pack share view.
      if (role === "buyer" && typeof lat === "number" && typeof lng === "number") {
        try {
          const { data: nearby } = await supabase.rpc("find_own_listing_nearby", {
            _lat: lat,
            _lng: lng,
            _radius_m: 50,
          });
          const hit = Array.isArray(nearby) ? nearby[0] : null;
          if (hit?.property_id) {
            navigate(`/share/${hit.property_id}`, { replace: true });
            return;
          }
        } catch (err) {
          console.warn("nearby lookup failed", err);
        }
      }

      try {
        const { getAgentCountry, COUNTRIES } = await import("@/lib/countries");
        const agentCountry = getAgentCountry();
        const countryMeta = COUNTRIES.find((c) => c.code === agentCountry);
        const { data, error } = await db.functions.invoke("analyze", {
          body: {
            kind,
            query: q,
            lat,
            lng,
            refine,
            purpose,
            agent_country: agentCountry,
            agent_country_label: countryMeta?.label,
            buyer_profile: profile.completedAt ? profile : undefined,
          },
        });
        if (error) throw error;
        const payload = { ...data, input_kind: kind, query: q, purpose };
        sessionStorage.setItem(`propaai_result_${id}`, JSON.stringify(payload));
        sessionStorage.setItem("propaai_last_result", JSON.stringify(payload));

        // Honest insufficient-data branch
        if (data?.insufficient_data) {
          navigate(`/app/insufficient/${id}`, { replace: true });
        } else {
          navigate(`/app/result/${id}`, { replace: true });
        }
      } catch (e) {
        console.error("analyze error:", e);
        const fallback = {
          error: String(e),
          verdict: "yellow" as const,
          score: 50,
          confidence: 30,
          headline_ru: "Не удалось проанализировать",
          headline_en: "Analysis failed",
          reasons: [],
          red_flags: [],
          next_steps: [],
        };
        sessionStorage.setItem(`propaai_result_${id}`, JSON.stringify(fallback));
        sessionStorage.setItem("propaai_last_result", JSON.stringify(fallback));
        navigate(`/app/result/${id}`, { replace: true });
      }
    })();
  }, [geo, kind, q, navigate, refineParam]);

  return (
    <div className="min-h-[80vh] grid place-items-center px-6 py-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="text-center">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-bronze grid place-items-center shadow-bronze mb-5">
            <Sparkles className="h-6 w-6 text-accent-foreground" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight leading-tight">
            {t("gather.title")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            {t("gather.sub")}
          </p>
        </div>

        <div className="mt-8 rounded-3xl border border-border bg-card p-5 shadow-soft">
          <div className="space-y-3">
            {STAGE_KEYS.map((key, i) => {
              const isDone = i < stage;
              const isActive = i === stage;
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <div
                    className={`h-7 w-7 rounded-full grid place-items-center transition-all shrink-0 ${
                      isDone
                        ? "bg-verdict-green/15 text-verdict-green"
                        : isActive
                        ? "bg-accent/15 text-accent"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {isActive ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : isDone ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <span className="text-xs">·</span>
                    )}
                  </div>
                  <div
                    className={`text-sm leading-snug pt-0.5 ${
                      i <= stage ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {t(`gather.steps.${key}`)}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <p className="mt-4 text-[11px] text-muted-foreground/80 leading-relaxed text-center px-2">
          {t("gather.footnote")}
        </p>
      </motion.div>
    </div>
  );
}
