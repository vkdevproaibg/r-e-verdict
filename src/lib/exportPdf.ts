import jsPDF from "jspdf";

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
    title: "Propa AI · Отчёт по объекту",
    verdict: "Вердикт",
    score: "Скор",
    confidence: "Уверенность",
    confidenceBand: "Полоса уверенности",
    purpose: "Цель",
    purposeBuy: "Покупка",
    purposeRent: "Аренда",
    address: "Адрес",
    market: "Рынок",
    avgPrice: "Средняя цена",
    range: "Диапазон",
    estimated: "Ориентир по объекту",
    trend: "Тренд (YoY)",
    rent: "Аренда / мес",
    yield: "Доходность",
    scores: "Детальные оценки",
    reasons: "Почему так",
    redFlags: "Риски",
    nextSteps: "Следующие шаги",
    good: "Сильные стороны",
    watch: "Слабые стороны",
    sources: "Источники",
    priceVsMarket: "Отклонение от рынка",
    generated: "Сформировано",
    page: "Стр.",
    verdictGreen: "Покупать",
    verdictYellow: "Торговаться",
    verdictRed: "Пройти мимо",
  },
  en: {
    title: "Propa AI · Property Report",
    verdict: "Verdict",
    score: "Score",
    confidence: "Confidence",
    confidenceBand: "Confidence band",
    purpose: "Goal",
    purposeBuy: "Buy",
    purposeRent: "Rent",
    address: "Address",
    market: "Market",
    avgPrice: "Average price",
    range: "Range",
    estimated: "Estimated fair price",
    trend: "Trend (YoY)",
    rent: "Rent / mo",
    yield: "Gross yield",
    scores: "Detailed scores",
    reasons: "Why this result",
    redFlags: "Red flags",
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
  },
} as const;

const VERDICT_COLOR: Record<string, [number, number, number]> = {
  green: [34, 139, 87],
  yellow: [201, 145, 32],
  red: [193, 58, 58],
};

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

export function exportAnalysisPdf(result: ExportInput, lang: Lang = "ru") {
  const tr = T[lang];
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 40;
  const maxW = pageW - margin * 2;
  let y = margin;

  const ensureSpace = (h: number) => {
    if (y + h > pageH - margin - 24) {
      footer();
      doc.addPage();
      y = margin;
    }
  };

  const footer = () => {
    const pageNum = doc.getCurrentPageInfo().pageNumber;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(140);
    doc.text(`${tr.title}  ·  ${tr.page} ${pageNum}`, margin, pageH - 20);
    const stamp = new Date().toLocaleString(lang === "ru" ? "ru-RU" : "en-US");
    doc.text(`${tr.generated}: ${stamp}`, pageW - margin, pageH - 20, { align: "right" });
    doc.setTextColor(0);
  };

  // Header bar
  const headerH = 56;
  doc.setFillColor(20, 20, 22);
  doc.rect(0, 0, pageW, headerH, "F");
  doc.setTextColor(245);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("PROPA AI", margin, 34);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(tr.title, pageW - margin, 34, { align: "right" });
  doc.setTextColor(0);
  y = headerH + 24;

  // Verdict block
  const vColor = VERDICT_COLOR[result.verdict] ?? VERDICT_COLOR.yellow;
  const vLabel =
    result.verdict === "green" ? tr.verdictGreen :
    result.verdict === "red" ? tr.verdictRed : tr.verdictYellow;

  doc.setFillColor(vColor[0], vColor[1], vColor[2]);
  doc.roundedRect(margin, y, maxW, 90, 10, 10, "F");
  doc.setTextColor(255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(`${tr.verdict.toUpperCase()}: ${vLabel.toUpperCase()}`, margin + 16, y + 22);
  doc.setFontSize(20);
  const headline = lang === "ru" ? result.headline_ru : result.headline_en;
  const headlineLines = doc.splitTextToSize(headline || "", maxW - 32);
  doc.text(headlineLines.slice(0, 2), margin + 16, y + 46);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const meta: string[] = [];
  meta.push(`${tr.score}: ${result.score}/100`);
  meta.push(`${tr.confidence}: ${result.confidence}%`);
  if (result.confidence_band) meta.push(`${tr.confidenceBand}: ${result.confidence_band}`);
  if (result.purpose) meta.push(`${tr.purpose}: ${result.purpose === "rent" ? tr.purposeRent : tr.purposeBuy}`);
  doc.text(meta.join("   ·   "), margin + 16, y + 78);
  doc.setTextColor(0);
  y += 90 + 18;

  if (result.geo_address) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(`${tr.address}:`, margin, y);
    doc.setFont("helvetica", "normal");
    const addrLines = doc.splitTextToSize(result.geo_address, maxW - 80);
    doc.text(addrLines, margin + 60, y);
    y += addrLines.length * 12 + 10;
  }

  // Market
  if (result.market?.avg_price_per_unit) {
    sectionTitle(tr.market);
    const m = result.market;
    const ccy = m.currency ?? "";
    const unit = m.unit ?? "м²";
    const lines: string[] = [];
    lines.push(`${tr.avgPrice}: ${fmtNum(m.avg_price_per_unit)} ${ccy}/${unit}`);
    if (m.low_price_per_unit && m.high_price_per_unit) {
      lines.push(`${tr.range}: ${fmtNum(m.low_price_per_unit)}–${fmtNum(m.high_price_per_unit)} ${ccy}/${unit}`);
    }
    if (m.estimated_total) lines.push(`${tr.estimated}: ${fmtNum(m.estimated_total)} ${ccy}`);
    if (typeof m.trend_pct_yoy === "number") lines.push(`${tr.trend}: ${m.trend_pct_yoy > 0 ? "+" : ""}${m.trend_pct_yoy.toFixed(1)}%`);
    if (typeof m.rent_per_month === "number") lines.push(`${tr.rent}: ${fmtNum(m.rent_per_month)} ${ccy}`);
    if (typeof m.gross_yield_pct === "number") lines.push(`${tr.yield}: ${m.gross_yield_pct.toFixed(1)}%`);
    if (typeof result.price_deviation_pct === "number") {
      lines.push(`${tr.priceVsMarket}: ${result.price_deviation_pct > 0 ? "+" : ""}${result.price_deviation_pct.toFixed(0)}%`);
    }
    paragraph(lines.join("\n"));
    const comment = lang === "ru" ? m.trend_comment_ru : m.trend_comment_en;
    if (comment) {
      doc.setTextColor(90);
      paragraph(comment);
      doc.setTextColor(0);
    }
  }

  // Scores
  if (result.scores) {
    sectionTitle(tr.scores);
    const entries = Object.entries(result.scores).filter(([, v]) => typeof v === "number") as [string, number][];
    for (const [key, val] of entries) {
      ensureSpace(22);
      const label = SCORE_LABELS[key]?.[lang] ?? key;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(label, margin, y + 9);
      doc.text(`${Math.round(val)}`, margin + maxW, y + 9, { align: "right" });
      // bar
      const barX = margin + 130;
      const barW = maxW - 130 - 30;
      doc.setFillColor(235, 235, 238);
      doc.roundedRect(barX, y + 2, barW, 8, 4, 4, "F");
      const tone: [number, number, number] =
        val >= 75 ? [34, 139, 87] : val >= 45 ? [201, 145, 32] : [193, 58, 58];
      doc.setFillColor(tone[0], tone[1], tone[2]);
      const fillW = Math.max(2, (Math.max(0, Math.min(100, val)) / 100) * barW);
      doc.roundedRect(barX, y + 2, fillW, 8, 4, 4, "F");
      y += 18;
    }
    y += 6;
  }

  // Strengths / concerns
  bulletSection(tr.good, result.good);
  bulletSection(tr.watch, result.watch);
  bulletSection(tr.reasons, result.reasons);
  bulletSection(tr.redFlags, result.red_flags);
  bulletSection(tr.nextSteps, result.next_steps, true);

  // Sources
  if (result.sources && result.sources.length) {
    sectionTitle(tr.sources);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    for (const s of result.sources.slice(0, 8)) {
      const title = s.title || s.url || "";
      const txt = s.url ? `• ${title}\n   ${s.url}` : `• ${title}`;
      const lines = doc.splitTextToSize(txt, maxW);
      ensureSpace(lines.length * 11 + 4);
      doc.setTextColor(40);
      doc.text(lines, margin, y);
      y += lines.length * 11 + 4;
    }
    doc.setTextColor(0);
  }

  footer();

  const slug = (result.geo_address || headline || "report")
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, "-")
    .slice(0, 40)
    .replace(/^-|-$/g, "");
  doc.save(`propa-ai-${slug || "report"}.pdf`);

  // ---- helpers ----
  function sectionTitle(title: string) {
    ensureSpace(28);
    doc.setDrawColor(220);
    doc.setLineWidth(0.5);
    doc.line(margin, y, margin + maxW, y);
    y += 14;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(title, margin, y);
    y += 14;
  }

  function paragraph(text: string) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(text, maxW);
    ensureSpace(lines.length * 12 + 4);
    doc.text(lines, margin, y);
    y += lines.length * 12 + 6;
  }

  function bulletSection(title: string, items?: Bilingual[], numbered = false) {
    if (!items || !items.length) return;
    sectionTitle(title);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    items.forEach((it, i) => {
      const txt = lang === "ru" ? it.ru : it.en;
      if (!txt) return;
      const prefix = numbered ? `${i + 1}.` : "•";
      const lines = doc.splitTextToSize(`${prefix}  ${txt}`, maxW - 10);
      ensureSpace(lines.length * 12 + 4);
      doc.text(lines, margin, y);
      y += lines.length * 12 + 4;
    });
    y += 4;
  }
}
