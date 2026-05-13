import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ExternalLink, Check, GitCompare, Sparkles, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Source = {
  id: string;
  name: string;
  region: string;
  url: string;
  brand: string; // background tint hint
};

type Listing = {
  id: string;
  source: string;
  title: string;
  price: string;
  beds: string;
  area: string;
  city: string;
  url: string;
  img: string;
};

const SOURCES: Source[] = [
  { id: "zillow", name: "Zillow", region: "USA", url: "https://www.zillow.com", brand: "from-[#006AFF]/15 to-transparent" },
  { id: "redfin", name: "Redfin", region: "USA", url: "https://www.redfin.com", brand: "from-[#A02021]/15 to-transparent" },
  { id: "realtor", name: "Realtor.com", region: "USA", url: "https://www.realtor.com", brand: "from-[#D92228]/12 to-transparent" },
  { id: "bayut", name: "Bayut", region: "UAE", url: "https://www.bayut.com", brand: "from-[#26B57F]/15 to-transparent" },
  { id: "rightmove", name: "Rightmove", region: "UK", url: "https://www.rightmove.co.uk", brand: "from-[#00DEB6]/15 to-transparent" },
  { id: "idealista", name: "Idealista", region: "EU", url: "https://www.idealista.com", brand: "from-[#E8A33D]/15 to-transparent" },
];

const FEEDS: Record<string, Listing[]> = {
  zillow: [
    { id: "z1", source: "zillow", title: "2BR Loft · Williamsburg", price: "$1,250,000", beds: "2 bd · 2 ba", area: "1,180 sqft", city: "Brooklyn, NY",
      url: "https://www.zillow.com/homedetails/example-1/", img: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=640&q=70" },
    { id: "z2", source: "zillow", title: "Brownstone · Park Slope", price: "$2,890,000", beds: "4 bd · 3 ba", area: "2,400 sqft", city: "Brooklyn, NY",
      url: "https://www.zillow.com/homedetails/example-2/", img: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=640&q=70" },
    { id: "z3", source: "zillow", title: "Modern Condo · LIC", price: "$985,000", beds: "1 bd · 1 ba", area: "780 sqft", city: "Queens, NY",
      url: "https://www.zillow.com/homedetails/example-3/", img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=640&q=70" },
    { id: "z4", source: "zillow", title: "Townhouse · Bed-Stuy", price: "$1,650,000", beds: "3 bd · 2 ba", area: "1,720 sqft", city: "Brooklyn, NY",
      url: "https://www.zillow.com/homedetails/example-4/", img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=640&q=70" },
  ],
  redfin: [
    { id: "r1", source: "redfin", title: "Bay View Home", price: "$1,495,000", beds: "3 bd · 2 ba", area: "1,640 sqft", city: "San Francisco, CA",
      url: "https://www.redfin.com/example-1", img: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=640&q=70" },
    { id: "r2", source: "redfin", title: "Modern Hillside", price: "$2,150,000", beds: "4 bd · 3 ba", area: "2,300 sqft", city: "Oakland, CA",
      url: "https://www.redfin.com/example-2", img: "https://images.unsplash.com/photo-1605114195644-9b1f8a23c0a4?w=640&q=70" },
    { id: "r3", source: "redfin", title: "Sunny Bungalow", price: "$925,000", beds: "2 bd · 1 ba", area: "1,100 sqft", city: "Berkeley, CA",
      url: "https://www.redfin.com/example-3", img: "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=640&q=70" },
    { id: "r4", source: "redfin", title: "Loft Conversion", price: "$1,180,000", beds: "1 bd · 2 ba", area: "1,400 sqft", city: "Oakland, CA",
      url: "https://www.redfin.com/example-4", img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=640&q=70" },
  ],
  realtor: [
    { id: "rl1", source: "realtor", title: "Lake View Estate", price: "$3,400,000", beds: "5 bd · 4 ba", area: "4,100 sqft", city: "Austin, TX",
      url: "https://www.realtor.com/example-1", img: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=640&q=70" },
    { id: "rl2", source: "realtor", title: "Downtown Penthouse", price: "$1,820,000", beds: "2 bd · 2 ba", area: "1,560 sqft", city: "Austin, TX",
      url: "https://www.realtor.com/example-2", img: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=640&q=70" },
    { id: "rl3", source: "realtor", title: "Suburban Family Home", price: "$680,000", beds: "4 bd · 2 ba", area: "2,000 sqft", city: "Round Rock, TX",
      url: "https://www.realtor.com/example-3", img: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=640&q=70" },
    { id: "rl4", source: "realtor", title: "Hill Country Ranch", price: "$1,250,000", beds: "3 bd · 3 ba", area: "2,800 sqft", city: "Dripping Springs, TX",
      url: "https://www.realtor.com/example-4", img: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=640&q=70" },
  ],
  bayut: [
    { id: "b1", source: "bayut", title: "Marina View Apartment", price: "AED 2,950,000", beds: "2 bd · 2 ba", area: "1,400 sqft", city: "Dubai Marina",
      url: "https://www.bayut.com/example-1", img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=640&q=70" },
    { id: "b2", source: "bayut", title: "Palm Jumeirah Villa", price: "AED 18,500,000", beds: "5 bd · 6 ba", area: "6,200 sqft", city: "Palm Jumeirah",
      url: "https://www.bayut.com/example-2", img: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=640&q=70" },
    { id: "b3", source: "bayut", title: "Downtown Studio", price: "AED 1,150,000", beds: "Studio", area: "520 sqft", city: "Downtown Dubai",
      url: "https://www.bayut.com/example-3", img: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=640&q=70" },
    { id: "b4", source: "bayut", title: "JVC Townhouse", price: "AED 2,250,000", beds: "3 bd · 4 ba", area: "1,950 sqft", city: "Jumeirah Village Circle",
      url: "https://www.bayut.com/example-4", img: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=640&q=70" },
  ],
  rightmove: [
    { id: "rm1", source: "rightmove", title: "Victorian Terrace", price: "£785,000", beds: "3 bd · 2 ba", area: "1,250 sqft", city: "London, UK",
      url: "https://www.rightmove.co.uk/example-1", img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=640&q=70" },
    { id: "rm2", source: "rightmove", title: "Riverside Flat", price: "£550,000", beds: "2 bd · 1 ba", area: "780 sqft", city: "London, UK",
      url: "https://www.rightmove.co.uk/example-2", img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=640&q=70" },
    { id: "rm3", source: "rightmove", title: "Cotswolds Cottage", price: "£625,000", beds: "3 bd · 2 ba", area: "1,400 sqft", city: "Stroud, UK",
      url: "https://www.rightmove.co.uk/example-3", img: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=640&q=70" },
    { id: "rm4", source: "rightmove", title: "Modern Mews", price: "£1,250,000", beds: "4 bd · 3 ba", area: "1,800 sqft", city: "London, UK",
      url: "https://www.rightmove.co.uk/example-4", img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=640&q=70" },
  ],
  idealista: [
    { id: "i1", source: "idealista", title: "Ático con terraza", price: "€890,000", beds: "3 bd · 2 ba", area: "140 m²", city: "Madrid, ES",
      url: "https://www.idealista.com/example-1", img: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=640&q=70" },
    { id: "i2", source: "idealista", title: "Piso reformado", price: "€520,000", beds: "2 bd · 1 ba", area: "85 m²", city: "Barcelona, ES",
      url: "https://www.idealista.com/example-2", img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=640&q=70" },
    { id: "i3", source: "idealista", title: "Casa con jardín", price: "€1,150,000", beds: "4 bd · 3 ba", area: "220 m²", city: "Valencia, ES",
      url: "https://www.idealista.com/example-3", img: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=640&q=70" },
    { id: "i4", source: "idealista", title: "Loft moderno", price: "€395,000", beds: "1 bd · 1 ba", area: "65 m²", city: "Sevilla, ES",
      url: "https://www.idealista.com/example-4", img: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=640&q=70" },
  ],
};

export default function SourcesBrowser() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialPurpose = (params.get("purpose") as "buy" | "rent") || "buy";
  const initialArea = params.get("area") ?? "";

  const [purpose, setPurpose] = useState<"buy" | "rent">(initialPurpose);
  const [area, setArea] = useState<string>(initialArea);
  const [sourceId, setSourceId] = useState<string>(SOURCES[0].id);
  const [selected, setSelected] = useState<string[]>([]);

  const source = useMemo(() => SOURCES.find((s) => s.id === sourceId)!, [sourceId]);
  const listings = FEEDS[sourceId] ?? [];

  const toggle = (id: string) => {
    setSelected((cur) => {
      if (cur.includes(id)) return cur.filter((x) => x !== id);
      if (cur.length >= 2) {
        toast.info(t("analyze.sources.limit"));
        return cur;
      }
      return [...cur, id];
    });
  };

  const buildParams = (q: string, compareWith?: string) => {
    const p = new URLSearchParams();
    p.set("kind", "url");
    p.set("q", q);
    p.set("purpose", purpose);
    if (area.trim()) p.set("area", area.trim());
    if (compareWith) p.set("compareWith", compareWith);
    return p;
  };

  const launch = () => {
    if (selected.length === 0) return;
    const picked = selected
      .map((id) => listings.find((l) => l.id === id))
      .filter(Boolean) as Listing[];
    if (picked.length === 1) {
      navigate(`/app/analyze/loading?${buildParams(picked[0].url).toString()}`);
      return;
    }
    sessionStorage.setItem("propaai_compare_queue", JSON.stringify(picked.map((p) => p.url)));
    toast.success(t("analyze.sources.compareTwo") + " · " + picked[0].title + " + " + picked[1].title);
    navigate(`/app/analyze/loading?${buildParams(picked[0].url, picked[1].url).toString()}`);
  };

  return (
    <div className="px-5 lg:px-8 py-6 lg:py-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/app/analyze")}
          className="h-9 w-9 rounded-xl border border-border bg-card grid place-items-center hover:border-accent/40 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1 text-[10px] uppercase tracking-widest text-muted-foreground">
          <Sparkles className="h-3 w-3 text-accent" />
          {purpose === "rent" ? t("analyze.purpose.rent") : t("analyze.purpose.buy")}
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mt-4">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">{t("analyze.sources.title")}</h1>
        <p className="mt-2 text-base text-muted-foreground max-w-2xl">{t("analyze.sources.sub")}</p>
      </motion.div>

      <div className="mt-6 grid lg:grid-cols-[260px_1fr] gap-6">
        {/* Source picker */}
        <aside>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
            {t("analyze.sources.pickSource")}
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
            {SOURCES.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSourceId(s.id);
                  setSelected([]);
                }}
                className={cn(
                  "group rounded-2xl border p-3 text-left transition-all bg-gradient-to-br",
                  s.brand,
                  sourceId === s.id
                    ? "border-accent/60 ring-1 ring-accent/20 shadow-bronze"
                    : "border-border hover:border-accent/40"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <div className={cn(
                    "h-9 w-9 rounded-xl grid place-items-center shrink-0",
                    sourceId === s.id ? "bg-gradient-bronze text-accent-foreground shadow-bronze" : "bg-secondary"
                  )}>
                    <Globe className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold tracking-tight truncate">{s.name}</div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.region}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Feed panel */}
        <section className="min-w-0">
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            {/* Faux browser bar */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-secondary/40">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
              </div>
              <div className="flex-1 mx-2 h-7 rounded-lg bg-background border border-border flex items-center px-3 text-xs text-muted-foreground truncate">
                {source.url}
              </div>
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-foreground hover:text-accent transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t("analyze.sources.openOriginal")}</span>
              </a>
            </div>

            <div className="p-4 lg:p-5">
              <div className="flex items-baseline justify-between gap-3 flex-wrap">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{t("analyze.sources.feedTitle")}</div>
                  <div className="text-base font-semibold tracking-tight">{source.name} · {source.region}</div>
                </div>
                <div className="text-xs text-muted-foreground">{t("analyze.sources.tapToSelect")}</div>
              </div>

              <div className="mt-4 grid sm:grid-cols-2 gap-3">
                {listings.map((l) => {
                  const isSel = selected.includes(l.id);
                  return (
                    <motion.button
                      key={l.id}
                      whileHover={{ y: -2 }}
                      onClick={() => toggle(l.id)}
                      className={cn(
                        "relative group text-left rounded-2xl border bg-card overflow-hidden transition-all",
                        isSel
                          ? "border-accent ring-2 ring-accent/30 shadow-bronze"
                          : "border-border hover:border-accent/40 hover:shadow-elevated"
                      )}
                    >
                      <div className="relative aspect-[16/10] bg-secondary overflow-hidden">
                        <img
                          src={l.img}
                          alt={l.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform group-hover:scale-[1.03]"
                        />
                        {isSel && (
                          <div className="absolute top-2 right-2 h-7 w-7 rounded-full bg-gradient-bronze grid place-items-center shadow-bronze text-accent-foreground">
                            <Check className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-sm font-semibold tracking-tight leading-tight line-clamp-1">{l.title}</div>
                          <div className="text-sm font-semibold tracking-tight text-accent shrink-0">{l.price}</div>
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground leading-snug line-clamp-1">
                          {l.beds} · {l.area}
                        </div>
                        <div className="mt-0.5 text-[11px] text-muted-foreground/80 line-clamp-1">{l.city}</div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              <p className="mt-4 text-[11px] text-muted-foreground/80 leading-relaxed">
                {t("analyze.sources.comingSoonHint")}
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Sticky action bar */}
      {selected.length > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-20 lg:bottom-6 inset-x-0 z-[1050] px-5"
        >
          <div className="max-w-2xl mx-auto rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-elevated p-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold tracking-tight">
                {selected.length === 1 ? t("analyze.sources.selectedOne") : t("analyze.sources.selectedTwo")}
              </div>
              <div className="text-[11px] text-muted-foreground truncate">
                {selected.map((id) => listings.find((l) => l.id === id)?.title).filter(Boolean).join(" · ")}
              </div>
            </div>
            <Button
              onClick={launch}
              className="h-11 rounded-xl bg-gradient-bronze text-accent-foreground shadow-bronze hover:opacity-90 font-semibold px-4"
            >
              {selected.length === 2 ? (
                <>
                  <GitCompare className="h-4 w-4 mr-1.5" />
                  {t("analyze.sources.compareTwo")}
                </>
              ) : (
                <>
                  {t("analyze.sources.analyzeOne")}
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </>
              )}
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
