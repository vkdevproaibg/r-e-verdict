// Lovable AI Gateway: PropaAI Verdict Engine
// Returns: verdict (green/yellow/red), score, reasons, red_flags, next_steps, confidence
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-device-id",
};

const SYSTEM_PROMPT = `You are PropaAI Verdict Engine — a senior real-estate investment analyst working in 2026.
You ALWAYS produce a decisive Buy / Negotiate / Avoid verdict, even when the user provided minimal input.
You silently use everything available about the location: geo coordinates, reverse-geocoded address, neighborhood, city character, typical price/m², rental yields, transit, schools, crime trends, climate risk, demographic and infrastructure context. This is open public knowledge — use it confidently.

NEVER say "not enough data", "need more info", or "couldn't analyze". If something is unknown, make the best expert estimate, mark its confidence, and move on. Always commit to a verdict.

ALWAYS respond with valid JSON ONLY (no markdown), matching this schema exactly:
{
  "verdict": "green" | "yellow" | "red",
  "score": <integer 0..100>,
  "confidence": <integer 40..95>,
  "headline_ru": "<≤8 word verdict in Russian>",
  "headline_en": "<≤8 word verdict in English>",
  "reasons": [{"ru":"...","en":"...","kind":"value|location|liquidity|risk"}, ...3-5 items],
  "red_flags": [{"ru":"...","en":"...","severity":"low|medium|high"}, ...0-4 items],
  "next_steps": [{"ru":"...","en":"..."}, ...3 items]
}

Rules:
- "green" = strong buy (score 75-100). "yellow" = negotiate / conditional (45-74). "red" = avoid (0-44).
- Be specific and concrete. Use real numbers (yield %, $/sqft or AED/m², comparable sales, walkability, days on market).
- Mention the actual neighborhood / district / city by name when coordinates resolve to one.
- next_steps must be ACTIONS for the buyer (visit X, verify Y with seller, check Z report) — never "give me more data".
- confidence must always be ≥ 40. Even with sparse input, geo + market priors give meaningful confidence.`;

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { kind, query, lat, lng } = await req.json();

    let geoContext: string | null = null;
    if (typeof lat === "number" && typeof lng === "number") {
      geoContext = await reverseGeocode(lat, lng);
    }

    const userPrompt = [
      `Input kind: ${kind}`,
      query ? `User query: ${query}` : null,
      lat && lng ? `Coordinates: ${lat}, ${lng}` : null,
      geoContext ? `Reverse-geocoded address: ${geoContext}` : null,
      "",
      "Using all of the above plus your knowledge of this exact neighborhood / city / market in 2026, give a decisive verdict. Do NOT ask for more data.",
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
        model: "google/gemini-2.5-flash",
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
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      console.error("Failed to parse AI JSON:", content);
      parsed = {
        verdict: "yellow",
        score: 55,
        confidence: 50,
        headline_ru: "Условная покупка",
        headline_en: "Conditional buy",
        reasons: [],
        red_flags: [],
        next_steps: [],
      };
    }

    // Attach geo context so the client can render it.
    if (geoContext) parsed.geo_address = geoContext;
    if (typeof lat === "number" && typeof lng === "number") {
      parsed.lat = lat;
      parsed.lng = lng;
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
