// Lovable AI Gateway: PropaAI Verdict Engine
// Returns: verdict (green/yellow/red), score, reasons, red_flags, next_steps, confidence
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-device-id",
};

const SYSTEM_PROMPT = `You are PropaAI Verdict Engine — a senior real-estate investment analyst.
Given input about a property (address, link, location coords, free-form text, or document text), produce a decisive Buy/Negotiate/Avoid verdict.

ALWAYS respond with valid JSON ONLY (no markdown), matching this schema exactly:
{
  "verdict": "green" | "yellow" | "red",
  "score": <integer 0..100>,
  "confidence": <integer 0..100>,
  "headline_ru": "<≤8 word verdict in Russian>",
  "headline_en": "<≤8 word verdict in English>",
  "reasons": [{"ru":"...","en":"...","kind":"value|location|liquidity|risk"}, ...3-5 items],
  "red_flags": [{"ru":"...","en":"...","severity":"low|medium|high"}, ...0-4 items],
  "next_steps": [{"ru":"...","en":"..."}, ...3 items]
}

Rules:
- "green" = strong buy (score 75-100). "yellow" = negotiate / conditional (45-74). "red" = avoid (0-44).
- Be specific and concise. Prefer numbers (yield %, price/m², comps).
- If the input is too vague, return verdict "yellow", confidence ≤ 50, and ask for more in next_steps.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { kind, query, lat, lng } = await req.json();

    const userPrompt = [
      `Input kind: ${kind}`,
      query ? `Query: ${query}` : null,
      lat && lng ? `Coordinates: ${lat}, ${lng}` : null,
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
          { role: "user", content: userPrompt || "Analyze this property." },
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
    try { parsed = JSON.parse(content); }
    catch {
      console.error("Failed to parse AI JSON:", content);
      parsed = { verdict: "yellow", score: 50, confidence: 30, headline_ru: "Недостаточно данных", headline_en: "Need more data", reasons: [], red_flags: [], next_steps: [] };
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
