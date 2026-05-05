import jsPDF from "jspdf";
import html2canvas from "html2canvas";

type Lang = "ru" | "en";

interface Bilingual { ru: string; en: string; severity?: string }

interface ExportInput {
  verdict: "green" | "yellow" | "red";
  score: number;
  confidence: number;
  confidence_band?: "low" | "medium" | "high";
  headline_ru: string;
  headline_en: string;
  reasons?: Bilingual[];
  red_flags?: Bilingual[];
  next_steps?: Bilingual[];
  good?: Bilingual[];
  watch?: Bilingual[];
  sources?: { title?: string; url?: string }[];
  scores?: Record<string, number | undefined>;
  price_deviation_pct?: number | null;
  purpose?: "buy" | "rent";
  geo_address?: string;
  market?: {
    currency?: string;
    unit?: string;
    avg_price_per_unit?: number;
    low_price_per_unit?: number;
    high_price_per_unit?: number;
    estimated_total?: number;
    trend_pct_yoy?: number;
    trend_comment_ru?: string;
    trend_comment_en?: string;
    rent_per_month?: number | null;
    gross_yield_pct?: number | null;
  };
}

const T = {
  ru: {
    brand: "PROPA AI",
    title: "Инвестиционный отчёт по объекту",
    subtitle: "Независимая оценка на основе 12 факторов и открытых рыночных данных",
    verdict: "Вердикт",
    score: "Общий скор",
    confidence: "Уверенность модели",
    confidenceBand: "Полоса уверенности",
    purpose: "Цель",
    purposeBuy: "Покупка",
    purposeRent: "Аренда",
    address: "Объект",
    market: "Рыночный контекст",
    avgPrice: "Средняя цена",
    range: "Диапазон по району",
    estimated: "Справедливая цена",
    trend: "Динамика год к году",
    rent: "Аренда / месяц",
    yield: "Валовая доходность",
    scores: "Детальные оценки",
    reasons: "Почему такой вердикт",
    redFlags: "Риски и красные флаги",
    nextSteps: "Что делать дальше",
    good: "Сильные стороны",
    watch: "Слабые стороны",
    sources: "Источники данных",
    priceVsMarket: "Отклонение от рынка",
    generated: "Сформировано",
    page: "Стр.",
    verdictGreen: "Покупать",
    verdictYellow: "Торговаться",
    verdictRed: "Пройти мимо",
    confLow: "низкая", confMed: "средняя", confHigh: "высокая",
    disclaimer: "Аналитический материал на основе открытых источников. Не является инвестиционной рекомендацией.",
    prepared: "Подготовлено для",
    client: "клиента",
  },
  en: {
    brand: "PROPA AI",
    title: "Property Investment Report",
    subtitle: "Independent valuation across 12 signals and live market data",
    verdict: "Verdict",
    score: "Overall score",
    confidence: "Model confidence",
    confidenceBand: "Confidence band",
    purpose: "Goal",
    purposeBuy: "Buy",
    purposeRent: "Rent",
    address: "Property",
    market: "Market context",
    avgPrice: "Average price",
    range: "District range",
    estimated: "Fair price estimate",
    trend: "YoY trend",
    rent: "Rent / month",
    yield: "Gross yield",
    scores: "Detailed scores",
    reasons: "Why this verdict",
    redFlags: "Risks & red flags",
    nextSteps: "Next steps",
    good: "Strengths",
    watch: "Concerns",
    sources: "Sources",
    priceVsMarket: "Price vs market",
    generated: "Generated",
    page: "Page",
    verdictGreen: "Strong buy",
    verdictYellow: "Negotiate",
    verdictRed: "Walk away",
    confLow: "low", confMed: "medium", confHigh: "high",
    disclaimer: "Analytical material based on open sources. Not an investment recommendation.",
    prepared: "Prepared for",
    client: "client",
  },
} as const;

const SCORE_LABELS: Record<string, { ru: string; en: string }> = {
  price: { ru: "Цена", en: "Price" },
  location: { ru: "Локация", en: "Location" },
  growth: { ru: "Рост", en: "Growth" },
  liquidity: { ru: "Ликвидность", en: "Liquidity" },
  environment: { ru: "Среда", en: "Environment" },
  risks: { ru: "Риски", en: "Risks" },
  transport: { ru: "Транспорт", en: "Transport" },
  comfort: { ru: "Комфорт", en: "Comfort" },
  listing_trust: { ru: "Доверие к листингу", en: "Listing trust" },
};

function fmtNum(n: number | null | undefined): string {
  if (n == null || !isFinite(n)) return "—";
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return Math.round(n).toLocaleString("en-US");
  return `${Math.round(n)}`;
}

function esc(s: string | undefined | null): string {
  if (!s) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function verdictPalette(v: ExportInput["verdict"]) {
  switch (v) {
    case "green": return { bg: "#0f3a2a", accent: "#34c187", soft: "#e8f6ee", text: "#0a2f23" };
    case "red": return { bg: "#3a1010", accent: "#e25656", soft: "#fbeaea", text: "#3a1010" };
    default: return { bg: "#3a2a0a", accent: "#d6a13a", soft: "#fbf3df", text: "#3a2a0a" };
  }
}

function buildHtml(result: ExportInput, lang: Lang): string {
  const tr = T[lang];
  const pal = verdictPalette(result.verdict);
  const headline = lang === "ru" ? result.headline_ru : result.headline_en;
  const vLabel =
    result.verdict === "green" ? tr.verdictGreen :
    result.verdict === "red" ? tr.verdictRed : tr.verdictYellow;
  const confBand =
    result.confidence_band === "low" ? tr.confLow :
    result.confidence_band === "high" ? tr.confHigh : tr.confMed;

  const m = result.market || {};
  const ccy = m.currency ?? "";
  const unit = m.unit ?? "м²";
  const trendComment = lang === "ru" ? m.trend_comment_ru : m.trend_comment_en;

  const marketRows: { k: string; v: string }[] = [];
  if (m.avg_price_per_unit) marketRows.push({ k: tr.avgPrice, v: `${fmtNum(m.avg_price_per_unit)} ${ccy}/${unit}` });
  if (m.low_price_per_unit && m.high_price_per_unit)
    marketRows.push({ k: tr.range, v: `${fmtNum(m.low_price_per_unit)}–${fmtNum(m.high_price_per_unit)} ${ccy}/${unit}` });
  if (m.estimated_total) marketRows.push({ k: tr.estimated, v: `${fmtNum(m.estimated_total)} ${ccy}` });
  if (typeof m.trend_pct_yoy === "number") marketRows.push({ k: tr.trend, v: `${m.trend_pct_yoy > 0 ? "+" : ""}${m.trend_pct_yoy.toFixed(1)}%` });
  if (typeof m.rent_per_month === "number" && m.rent_per_month) marketRows.push({ k: tr.rent, v: `${fmtNum(m.rent_per_month)} ${ccy}` });
  if (typeof m.gross_yield_pct === "number") marketRows.push({ k: tr.yield, v: `${m.gross_yield_pct.toFixed(1)}%` });
  if (typeof result.price_deviation_pct === "number")
    marketRows.push({ k: tr.priceVsMarket, v: `${result.price_deviation_pct > 0 ? "+" : ""}${result.price_deviation_pct.toFixed(0)}%` });

  const scoresHtml = result.scores
    ? Object.entries(result.scores)
        .filter(([, v]) => typeof v === "number")
        .map(([k, v]) => {
          const val = v as number;
          const label = SCORE_LABELS[k]?.[lang] ?? k;
          const tone = val >= 75 ? "#2f9d6c" : val >= 45 ? "#d6a13a" : "#d65656";
          return `
            <div class="score-row">
              <div class="score-label">${esc(label)}</div>
              <div class="score-bar"><div class="score-fill" style="width:${Math.max(2, Math.min(100, val))}%;background:${tone}"></div></div>
              <div class="score-val">${Math.round(val)}</div>
            </div>`;
        })
        .join("")
    : "";

  const bullets = (items?: Bilingual[], numbered = false) => {
    if (!items || !items.length) return "";
    return `<ol class="${numbered ? "bullets numbered" : "bullets"}">${items
      .map((it, i) => {
        const txt = lang === "ru" ? it.ru : it.en;
        if (!txt) return "";
        return `<li><span class="bullet-mark">${numbered ? i + 1 : "•"}</span><span>${esc(txt)}</span></li>`;
      })
      .join("")}</ol>`;
  };

  const sourcesHtml = (result.sources || []).slice(0, 10).map((s, i) => `
    <div class="source">
      <span class="source-num">${i + 1}</span>
      <div>
        <div class="source-title">${esc(s.title || s.url || "")}</div>
        ${s.url ? `<div class="source-url">${esc(s.url)}</div>` : ""}
      </div>
    </div>
  `).join("");

  const meta: { k: string; v: string }[] = [
    { k: tr.score, v: `${result.score} / 100` },
    { k: tr.confidence, v: `${result.confidence}% · ${confBand}` },
  ];
  if (result.purpose) meta.push({ k: tr.purpose, v: result.purpose === "rent" ? tr.purposeRent : tr.purposeBuy });

  return `
<div id="propa-pdf-root" style="width:794px;background:#f8f5f0;color:#1f2126;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
<style>
  #propa-pdf-root * { box-sizing:border-box; }
  .page { padding:48px 56px; background:#f8f5f0; }
  .header { display:flex; justify-content:space-between; align-items:center; padding-bottom:18px; border-bottom:1px solid #e6dfd3; }
  .brand { font-weight:800; letter-spacing:0.22em; font-size:13px; color:#1f2126; }
  .brand .dot { display:inline-block;width:8px;height:8px;background:#b67a32;border-radius:50%;margin-right:10px;vertical-align:middle; }
  .header-meta { font-size:10px; letter-spacing:0.18em; text-transform:uppercase; color:#8a8275; }
  .title-block { margin-top:32px; }
  .eyebrow { font-size:10px; letter-spacing:0.28em; text-transform:uppercase; color:#b67a32; font-weight:600; }
  .title { font-family:'Fraunces',Georgia,serif; font-size:36px; line-height:1.1; margin:10px 0 8px; letter-spacing:-0.02em; color:#1f2126; }
  .subtitle { font-size:13px; color:#6a6358; max-width:560px; line-height:1.5; }

  .verdict-card { margin-top:28px; border-radius:20px; padding:26px 28px; background:linear-gradient(135deg, ${pal.bg} 0%, #0d0f12 100%); color:#fff; position:relative; overflow:hidden; }
  .verdict-card::after { content:""; position:absolute; right:-60px; top:-60px; width:220px; height:220px; border-radius:50%; background:radial-gradient(circle, ${pal.accent}33 0%, transparent 70%); }
  .verdict-tag { display:inline-flex; align-items:center; gap:8px; font-size:10px; letter-spacing:0.24em; text-transform:uppercase; color:#e8e4dd; opacity:0.85; }
  .verdict-tag .pill { display:inline-block; width:8px; height:8px; border-radius:50%; background:${pal.accent}; box-shadow:0 0 12px ${pal.accent}aa; }
  .verdict-headline { font-family:'Fraunces',Georgia,serif; font-size:28px; line-height:1.18; margin:14px 0 22px; max-width:640px; letter-spacing:-0.015em; }
  .verdict-meta { display:flex; gap:36px; flex-wrap:wrap; }
  .vm-item { font-size:11px; }
  .vm-k { color:#bdb5a7; letter-spacing:0.16em; text-transform:uppercase; font-size:9px; margin-bottom:4px; }
  .vm-v { color:#fff; font-size:15px; font-weight:600; }
  .verdict-label { font-family:'Fraunces',Georgia,serif; font-size:34px; color:${pal.accent}; font-weight:600; }

  .property-strip { margin-top:18px; background:#fff; border:1px solid #ece5d6; border-radius:14px; padding:16px 20px; display:flex; gap:16px; align-items:center; }
  .property-strip .ic { width:36px;height:36px;border-radius:10px;background:#f3ecdb;display:inline-flex;align-items:center;justify-content:center;color:#b67a32;font-size:18px;font-weight:700; }
  .property-strip .pk { font-size:9px; letter-spacing:0.2em; text-transform:uppercase; color:#8a8275; }
  .property-strip .pv { font-size:14px; color:#1f2126; margin-top:2px; }

  .section { margin-top:34px; }
  .section-title { font-family:'Fraunces',Georgia,serif; font-size:20px; color:#1f2126; margin-bottom:14px; letter-spacing:-0.01em; }
  .section-title .num { color:#b67a32; font-size:12px; letter-spacing:0.2em; margin-right:10px; vertical-align:middle; }

  .market-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:10px; }
  .market-cell { background:#fff; border:1px solid #ece5d6; border-radius:12px; padding:14px 16px; }
  .mc-k { font-size:10px; letter-spacing:0.16em; text-transform:uppercase; color:#8a8275; }
  .mc-v { font-size:18px; font-weight:600; color:#1f2126; margin-top:4px; font-feature-settings:"tnum"; }
  .market-comment { margin-top:12px; padding:14px 16px; background:#fbf6e9; border-left:3px solid #b67a32; border-radius:8px; font-size:12px; color:#5a5142; line-height:1.55; }

  .score-row { display:grid; grid-template-columns:140px 1fr 44px; gap:14px; align-items:center; padding:8px 0; border-bottom:1px dashed #ebe3d3; }
  .score-row:last-child { border-bottom:none; }
  .score-label { font-size:12px; color:#3a352c; }
  .score-bar { height:8px; background:#ece5d6; border-radius:99px; overflow:hidden; }
  .score-fill { height:100%; border-radius:99px; }
  .score-val { font-size:13px; font-weight:600; text-align:right; color:#1f2126; font-feature-settings:"tnum"; }

  .bullets { list-style:none; padding:0; margin:0; }
  .bullets li { display:flex; gap:12px; padding:10px 0; border-bottom:1px solid #efe9da; font-size:12.5px; line-height:1.55; color:#2a2620; }
  .bullets li:last-child { border-bottom:none; }
  .bullet-mark { flex:0 0 22px; height:22px; border-radius:50%; background:#f3ecdb; color:#b67a32; display:inline-flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; }
  .bullets.numbered .bullet-mark { background:#1f2126; color:#fff; }

  .two-col { display:grid; grid-template-columns:1fr 1fr; gap:18px; }
  .panel { background:#fff; border:1px solid #ece5d6; border-radius:14px; padding:18px 20px; }
  .panel h4 { margin:0 0 10px; font-size:11px; letter-spacing:0.2em; text-transform:uppercase; color:#8a8275; font-weight:700; }

  .source { display:flex; gap:12px; padding:10px 0; border-bottom:1px solid #efe9da; }
  .source:last-child { border-bottom:none; }
  .source-num { flex:0 0 24px; height:24px; border-radius:6px; background:#1f2126; color:#fff; font-size:11px; display:inline-flex; align-items:center; justify-content:center; font-weight:600; }
  .source-title { font-size:12px; color:#1f2126; line-height:1.4; }
  .source-url { font-size:10px; color:#8a8275; margin-top:2px; word-break:break-all; }

  .footer { margin-top:42px; padding-top:18px; border-top:1px solid #e6dfd3; display:flex; justify-content:space-between; font-size:10px; color:#8a8275; }
  .disclaimer { font-size:10px; color:#9a9285; margin-top:18px; line-height:1.5; font-style:italic; }
</style>

<div class="page">
  <div class="header">
    <div class="brand"><span class="dot"></span>${tr.brand}</div>
    <div class="header-meta">${esc(tr.title)}</div>
  </div>

  <div class="title-block">
    <div class="eyebrow">${esc(tr.subtitle)}</div>
    <h1 class="title">${esc(tr.title)}</h1>
  </div>

  <div class="verdict-card">
    <div class="verdict-tag"><span class="pill"></span>${esc(tr.verdict)}</div>
    <div style="display:flex; align-items:baseline; gap:18px; margin-top:6px;">
      <div class="verdict-label">${esc(vLabel)}</div>
    </div>
    <div class="verdict-headline">${esc(headline)}</div>
    <div class="verdict-meta">
      ${meta.map(x => `<div class="vm-item"><div class="vm-k">${esc(x.k)}</div><div class="vm-v">${esc(x.v)}</div></div>`).join("")}
    </div>
  </div>

  ${result.geo_address ? `
    <div class="property-strip">
      <div class="ic">◆</div>
      <div>
        <div class="pk">${esc(tr.address)}</div>
        <div class="pv">${esc(result.geo_address)}</div>
      </div>
    </div>
  ` : ""}

  ${marketRows.length ? `
    <div class="section">
      <div class="section-title"><span class="num">01</span>${esc(tr.market)}</div>
      <div class="market-grid">
        ${marketRows.map(r => `<div class="market-cell"><div class="mc-k">${esc(r.k)}</div><div class="mc-v">${esc(r.v)}</div></div>`).join("")}
      </div>
      ${trendComment ? `<div class="market-comment">${esc(trendComment)}</div>` : ""}
    </div>
  ` : ""}

  ${scoresHtml ? `
    <div class="section">
      <div class="section-title"><span class="num">02</span>${esc(tr.scores)}</div>
      ${scoresHtml}
    </div>
  ` : ""}

  ${(result.good?.length || result.watch?.length) ? `
    <div class="section">
      <div class="two-col">
        ${result.good?.length ? `<div class="panel"><h4>${esc(tr.good)}</h4>${bullets(result.good)}</div>` : ""}
        ${result.watch?.length ? `<div class="panel"><h4>${esc(tr.watch)}</h4>${bullets(result.watch)}</div>` : ""}
      </div>
    </div>
  ` : ""}

  ${result.reasons?.length ? `
    <div class="section">
      <div class="section-title"><span class="num">03</span>${esc(tr.reasons)}</div>
      ${bullets(result.reasons)}
    </div>
  ` : ""}

  ${result.red_flags?.length ? `
    <div class="section">
      <div class="section-title"><span class="num">04</span>${esc(tr.redFlags)}</div>
      ${bullets(result.red_flags)}
    </div>
  ` : ""}

  ${result.next_steps?.length ? `
    <div class="section">
      <div class="section-title"><span class="num">05</span>${esc(tr.nextSteps)}</div>
      ${bullets(result.next_steps, true)}
    </div>
  ` : ""}

  ${sourcesHtml ? `
    <div class="section">
      <div class="section-title"><span class="num">06</span>${esc(tr.sources)}</div>
      ${sourcesHtml}
    </div>
  ` : ""}

  <div class="disclaimer">${esc(tr.disclaimer)}</div>

  <div class="footer">
    <div>${esc(tr.brand)} · ${esc(tr.title)}</div>
    <div>${esc(tr.generated)}: ${new Date().toLocaleString(lang === "ru" ? "ru-RU" : "en-US")}</div>
  </div>
</div>
</div>`;
}

export async function exportAnalysisPdf(result: ExportInput, lang: Lang = "ru") {
  const html = buildHtml(result, lang);

  // Mount offscreen
  const host = document.createElement("div");
  host.style.position = "fixed";
  host.style.left = "-10000px";
  host.style.top = "0";
  host.style.zIndex = "-1";
  host.innerHTML = html;
  document.body.appendChild(host);

  const node = host.querySelector("#propa-pdf-root") as HTMLElement;

  try {
    // Wait a tick for fonts
    await (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts?.ready?.catch(() => {});
    await new Promise((r) => setTimeout(r, 50));

    const canvas = await html2canvas(node, {
      scale: 2,
      backgroundColor: "#f8f5f0",
      useCORS: true,
      logging: false,
      windowWidth: node.scrollWidth,
    });

    const pdf = new jsPDF({ unit: "pt", format: "a4", compress: true });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();

    const imgW = pageW;
    const imgH = (canvas.height * imgW) / canvas.width;

    if (imgH <= pageH) {
      pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, imgW, imgH);
    } else {
      // Multi-page: slice canvas into page-height chunks
      const pageHpx = (canvas.width * pageH) / pageW;
      let offset = 0;
      let pageIdx = 0;
      while (offset < canvas.height) {
        const sliceH = Math.min(pageHpx, canvas.height - offset);
        const slice = document.createElement("canvas");
        slice.width = canvas.width;
        slice.height = sliceH;
        const ctx = slice.getContext("2d")!;
        ctx.fillStyle = "#f8f5f0";
        ctx.fillRect(0, 0, slice.width, slice.height);
        ctx.drawImage(canvas, 0, -offset);
        if (pageIdx > 0) pdf.addPage();
        const sliceImgH = (sliceH * imgW) / canvas.width;
        pdf.addImage(slice.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, imgW, sliceImgH);
        offset += sliceH;
        pageIdx += 1;
      }
    }

    const slug = (result.geo_address || result.headline_en || "report")
      .toLowerCase()
      .replace(/[^a-z0-9]+/gi, "-")
      .slice(0, 40)
      .replace(/^-|-$/g, "");
    pdf.save(`propa-ai-${slug || "report"}.pdf`);
  } finally {
    document.body.removeChild(host);
  }
}
