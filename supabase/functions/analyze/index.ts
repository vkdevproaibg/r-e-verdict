// Lovable AI Gateway: PropaAI Verdict Engine v2
// Honest, calibrated scoring tailored to purpose (buy / rent).
// Uses Firecrawl web search to ground prices/rents in real listings when available.
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-device-id",
};

const SYSTEM_PROMPT = `You are PropaAI Verdict Engine v2 — a senior, calibrated real-estate analyst working in 2026.

You always commit to a verdict (Strong / Decent / Weak) and never refuse with "not enough data". When inputs are sparse, lean on geographic and market priors, lower the confidence band, and clearly mark which sub-scores are estimated.

You will receive:
- input kind, purpose ("buy" or "rent"), free-text query
- optional reverse-geocoded address (only meaningful when explicitly attached)
- optional refine fields: type, area_m2, price (in local currency), purpose
- WEB_FINDINGS: short snippets we scraped from public listings/portals about the local market. Treat them as soft evidence; cross-check, don't quote verbatim.

ALWAYS respond with valid JSON ONLY (no markdown), matching this schema EXACTLY:

{
  "verdict": "green" | "yellow" | "red",
  "purpose": "buy" | "rent",
  "score": <integer 0..100>,
  "confidence_band": "low" | "medium" | "high",
  "confidence": <integer 40..95>,
  "insufficient_data": <boolean>,
  "missing": ["<≤6 word bilingual hint>", ...0-4 items],
  "headline_ru": "<≤8 word verdict in Russian>",
  "headline_en": "<≤8 word verdict in English>",

  "scores": {
    "price":      <0..100 — 100 = price looks great vs market; if no price provided, this reflects local price-attractiveness for this type/area>,
    "location":   <0..100 — overall strength of the place>,
    "growth":     <0..100 — capital-appreciation potential (BUY) or rental-demand momentum (RENT)>,
    "liquidity":  <0..100 — resale ease (BUY) or convenience-of-living signal (RENT)>,
    "environment":<0..100 — surroundings, noise, ecology, walkability>,
    "risks":      <0..100 — 100 = few risks, 0 = many risks>,
    "transport":  <0..100 — only meaningful for RENT, but always return a value>,
    "comfort":    <0..100 — only meaningful for RENT, but always return a value>,
    "listing_trust": <0..100 — only meaningful for RENT (listing reliability), always return a value>
  },

  "price_deviation_pct": <number or null — only when user provided a price; positive = above market, negative = below>,

  "market": {
    "currency": "<ISO 4217: USD, EUR, AED, RUB, etc., matching the location>",
    "unit": "sqm" | "sqft",
    "avg_price_per_unit": <number — typical 2026 price for this type in this micro-area>,
    "low_price_per_unit": <number>,
    "high_price_per_unit": <number>,
    "estimated_total": <number — avg × area when area known, else best fair-value guess>,
    "trend_pct_yoy": <number — can be negative>,
    "trend_direction": "up" | "down" | "flat",
    "trend_comment_ru": "<one sentence, plain Russian, explains the driver>",
    "trend_comment_en": "<same in English>",
    "rent_per_month": <number or null>,
    "rent_low": <number or null>,
    "rent_high": <number or null>,
    "gross_yield_pct": <number or null>
  },

  "good": [{"ru":"...","en":"..."}, ...2-4 items — what is genuinely strong about this option],
  "watch": [{"ru":"...","en":"..."}, ...2-4 items — what is concerning but not deal-breaking],
  "reasons": [{"ru":"...","en":"...","kind":"value|location|liquidity|risk"}, ...3-5 items],
  "red_flags": [{"ru":"...","en":"...","severity":"low|medium|high"}, ...0-4 items],
  "next_steps": [{"ru":"...","en":"..."}, ...3 items — concrete buyer/renter actions, never "give me more data">],

  "price_proof": {
    "asking_price": <number or null — echo the user-stated price if any>,
    "fair_price_min": <number — bottom of the fair total-price range for this exact object>,
    "fair_price_max": <number — top of the fair total-price range>,
    "price_difference_percent": <number — asking vs midpoint of fair range; positive = above, negative = below; null if no asking>,
    "verdict_label_ru": "Справедливо" | "Завышено" | "Привлекательно" | "Нет цены",
    "verdict_label_en": "Fair" | "Overpriced" | "Attractive" | "No price",
    "market_assumption_ru": "<одно предложение: на какие сегмент/район/год/валюту опирались>",
    "market_assumption_en": "<one sentence: what segment/area/year/currency we anchored on>"
  },

  "comparable_signals": [
    {
      "area_ru": "<микро-район / комплекс>",
      "area_en": "<micro-area / complex>",
      "price_per_unit": <number>,
      "unit": "sqm" | "sqft",
      "currency": "<ISO>",
      "similarity_ru": "<«Очень похоже» | «Похожий тип» | «Похожая локация»>",
      "similarity_en": "<\"Very similar\" | \"Similar type\" | \"Similar area\">",
      "why_ru": "<одно предложение: почему этот сигнал релевантен>",
      "why_en": "<one sentence: why this signal matters>"
    }, ...EXACTLY 3 items, realistic for the city even if synthesized from priors
  ],

  "negotiation": {
    "suggested_first_offer": <number — concrete number to put on the table first>,
    "deal_zone_min": <number — realistic lower bound of the deal zone>,
    "deal_zone_max": <number — realistic upper bound>,
    "upper_limit": <number — walk-away ceiling>,
    "currency": "<ISO>",
    "arguments": [
      {"ru":"...","en":"...","kind":"price|risk|timing|market"},
      ...2-3 items grounded in this object's risks and market position
    ]
  },

  "manual_checks": [
    {"ru":"<что Propa не может проверить и о чём спросить агента/юриста>","en":"..."},
    ...3-5 items — honest, trust-building, concrete
  ],

  "agent_script": {
    "client_message_ru": "<2-4 sentences the agent can send to a client to explain this verdict (neutral tone)>",
    "client_message_en": "<same in English>",
    "tones": {
      "neutral":  { "ru": "<2-4 предложения, нейтральный тон>",   "en": "<same, neutral>" },
      "selling":  { "ru": "<2-4 предложения, продающий тон, без давления>", "en": "<same, selling but honest>" },
      "cautious": { "ru": "<2-4 предложения, осторожный тон, подсветить риски>", "en": "<same, cautious>" }
    },
    "headline_ru": "<≤10 слов: что сказать клиенту первым>",
    "headline_en": "<≤10 words: what to tell the client first>",
    "next_step_ru": "<одна фраза: какой следующий шаг предложить клиенту>",
    "next_step_en": "<one sentence: the next step to propose>"
  },

  "sources": [{"title":"...","url":"...","kind":"listing|index|news|portal"}, ...0-6 items, only when WEB_FINDINGS were provided]
}

CRITICAL RULES:
- Compute "score" as a weighted blend tailored to purpose:
  • BUY:  price 25%, location 20%, growth 15%, liquidity 15%, environment 10%, risks 15%
  • RENT: price 25%, location 20%, transport 15%, comfort 15%, listing_trust 10%, risks 15%
  Make sure the headline verdict matches the score band: green ≥75, yellow 45–74, red <45.
- "confidence_band": "high" when address+type+area+(price OR strong web findings) are present and consistent; "medium" when the basics are present but the price/comps are estimated; "low" when location is fuzzy or only one input is present.
- "confidence" (numeric) must align: low=40–54, medium=55–74, high=75–95.
- price sub-score: when user provided a price within ±10% of local norm → ~80; ±10–25% off → ~55; >25% off → ~30. Without a user price, score reflects how attractive prices generally are for this type/area.
- The "market" block is REQUIRED. Use the country/city to choose currency and unit (sqft for US/UK/Canada, otherwise sqm). When WEB_FINDINGS are provided, your prices and trend MUST be consistent with them.
- "good" and "watch" are short pluses/minuses for the user — different from "reasons" (which justify the verdict) and "red_flags" (which are concrete warnings).
- next_steps must be concrete actions (visit, verify, request, check), never "provide more data".
- Echo back "purpose" verbatim.
- Be calibrated. Don't inflate scores. Honest 60s are better than fake 90s.

PRICE-REALISM RULES (anti-lowball — read carefully):
- The default presumption is asking ≈ market. Sellers in 2026 are not naive; the asking price is itself a strong market signal. Do NOT systematically discount it.
- price_proof.fair_price_max should typically sit between asking × 0.95 and asking × 1.10 for liquid urban segments. fair_price_min should typically sit between asking × 0.90 and asking × 1.00. Never let fair_price_max fall below asking × 0.85 unless you can name a concrete, severe driver (legal encumbrance, structural defect, district downgrade, distressed sale) AND that driver appears in red_flags with severity "high".
- WEB_FINDINGS take priority over priors. If listings/portals show comps near asking, the fair range MUST hug those comps, not undercut them.
- Use the listing's local currency and unit. NEVER convert to USD silently. NEVER apply a generic "−15% to fair" rule of thumb.
- If you don't have enough evidence to confidently price the object, LOWER confidence (set confidence_band="low", numeric 40–54) and EXPAND fair_price_min/max around the asking price (e.g. asking × 0.92 .. asking × 1.08). Never invent a precise low number to look smart.
- comparable_signals MUST be priced consistently with fair_price_min/max — do not show comps at 30% below the fair range.
- price_proof.market_assumption_ru/en is REQUIRED: state in one sentence what segment, district, year and currency you anchored on. If the listing currency or country is unclear, say so explicitly there.

NEGOTIATION RULES:
- suggested_first_offer ≥ fair_price_min × 0.95 unless a "high"-severity red flag justifies a deeper opening. Default opener for a fair-priced object: asking × 0.95–0.97, not asking × 0.80.
- deal_zone_min ≥ fair_price_min × 0.97. deal_zone_max ≈ fair_price_max. upper_limit ≈ asking (or fair_price_max, whichever is higher).
- Required ordering: suggested_first_offer ≤ deal_zone_min ≤ deal_zone_max ≤ upper_limit.

OTHER:
- price_proof.fair_price_min/max MUST be a total-price range for the object (use market.low_price_per_unit × area and high × area when area is known; otherwise derive a realistic total for the typical unit in this micro-area, consistent with the rules above).
- comparable_signals MUST contain exactly 3 entries. If you don't have hard listings, synthesize realistic 2026-priced signals for nearby micro-areas grounded in the priors — they must be plausible and consistent with the fair range, not generic.
- manual_checks must be specific (e.g. "request title deed and check encumbrances", not "do due diligence").
- agent_script.tones MUST contain all three keys (neutral, selling, cautious). The "selling" tone may emphasise strengths but must NOT contradict red_flags. The "cautious" tone must surface the top risk explicitly.
- Never claim "50+ sources" or invent source counts. Reference only what's in WEB_FINDINGS.`;

async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { "User-Agent": "PropaAI/1.0 (analysis)", "Accept-Language": "en" } },
    );
    if (!r.ok) return null;
    const j = await r.json();
    return j.display_name ?? null;
  } catch (e) {
    console.error("reverseGeocode failed:", e);
    return null;
  }
}

interface WebFinding {
  title: string;
  url: string;
  snippet: string;
  kind?: "listing" | "index" | "news" | "portal";
}

async function firecrawlSearch(query: string, lang: string): Promise<WebFinding[]> {
  const key = Deno.env.get("FIRECRAWL_API_KEY");
  if (!key) {
    console.warn("FIRECRAWL_API_KEY missing — skipping web search");
    return [];
  }
  try {
    const r = await fetch("https://api.firecrawl.dev/v2/search", {
      method: "POST",
      headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query, limit: 6, lang, tbs: "qdr:y" }),
    });
    if (!r.ok) {
      console.error("Firecrawl search failed:", r.status, await r.text());
      return [];
    }
    const j = await r.json();
    const results = j.data ?? j.web ?? j.results ?? [];
    return (Array.isArray(results) ? results : []).slice(0, 6).map((it: Record<string, unknown>) => ({
      title: String(it.title ?? ""),
      url: String(it.url ?? ""),
      snippet: String(it.description ?? it.snippet ?? "").slice(0, 280),
    }));
  } catch (e) {
    console.error("Firecrawl error:", e);
    return [];
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { kind, query, lat, lng, refine, purpose } = await req.json();

    let geoContext: string | null = null;
    if (typeof lat === "number" && typeof lng === "number") {
      geoContext = await reverseGeocode(lat, lng);
    }

    const normalizedPurpose = purpose === "rent" ? "rent" : "buy";

    const refineLines: string[] = [];
    let propType = "";
    let area = "";
    let userPrice = "";
    if (refine && typeof refine === "object") {
      if (refine.type) { propType = String(refine.type); refineLines.push(`Property type: ${propType}`); }
      if (refine.area) { area = String(refine.area); refineLines.push(`Area (m²): ${area}`); }
      if (refine.purpose) refineLines.push(`User goal: ${refine.purpose}`);
      if (refine.price) { userPrice = String(refine.price); refineLines.push(`Stated price: ${userPrice}`); }
    }

    // Build a focused web query: location + type + intent
    const locationHint = geoContext || query || "";
    const intent = normalizedPurpose === "rent" ? "rent price" : "average price per sqm";
    const typeHint = propType || "apartment";
    const webQuery = `${typeHint} ${intent} ${locationHint}`.trim().slice(0, 180);

    const webFindings = locationHint ? await firecrawlSearch(webQuery, "en") : [];
    const webBlock = webFindings.length
      ? `WEB_FINDINGS (treat as soft evidence, cross-check):\n` +
        webFindings.map((f, i) => `[${i + 1}] ${f.title}\n${f.url}\n${f.snippet}`).join("\n\n")
      : `WEB_FINDINGS: (none — rely on priors)`;

    const userPrompt = [
      `Input kind: ${kind}`,
      `Analysis purpose: ${normalizedPurpose}`,
      query ? `User query: ${query}` : null,
      lat && lng ? `Coordinates: ${lat}, ${lng}` : null,
      geoContext ? `Reverse-geocoded address: ${geoContext}` : null,
      ...refineLines,
      "",
      webBlock,
      "",
      `Produce the full JSON per schema. Be calibrated. Tailor sub-scores and weights to purpose="${normalizedPurpose}". Cite up to 6 sources from WEB_FINDINGS in "sources" if you used them.`,
    ].filter(Boolean).join("\n");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (aiResp.status === 429) {
      return new Response(JSON.stringify({ error: "rate_limit", message: "Too many requests, try in a moment." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (aiResp.status === 402) {
      return new Response(JSON.stringify({ error: "credits", message: "AI credits depleted. Please add credits." }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!aiResp.ok) {
      const t = await aiResp.text();
      console.error("AI gateway error:", aiResp.status, t);
      return new Response(JSON.stringify({ error: "ai_error", status: aiResp.status, body: t }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiResp.json();
    const content = aiJson.choices?.[0]?.message?.content ?? "{}";
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(content);
    } catch {
      console.error("Failed to parse AI JSON:", content);
      parsed = {
        verdict: "yellow",
        score: 55,
        confidence: 50,
        confidence_band: "low",
        headline_ru: "Условная оценка",
        headline_en: "Conditional assessment",
        reasons: [],
        red_flags: [],
        next_steps: [],
      };
    }

    if (geoContext) parsed.geo_address = geoContext;
    if (typeof lat === "number" && typeof lng === "number") {
      parsed.lat = lat;
      parsed.lng = lng;
    }
    parsed.purpose = parsed.purpose === "rent" ? "rent" : normalizedPurpose;

    // Attach the sources we actually fed in (if AI didn't echo them) for transparency
    if (!Array.isArray(parsed.sources) || (parsed.sources as unknown[]).length === 0) {
      if (webFindings.length) {
        parsed.sources = webFindings.map((f) => ({ title: f.title, url: f.url, kind: "portal" }));
      }
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze error:", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
