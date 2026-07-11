// Listing portals per country — single source of truth for SourcesBrowser.
import type { CountryCode } from "./countries";

export type Source = {
  id: string;
  name: string;
  region: string;      // display label (e.g. "USA", "Georgia")
  country: CountryCode; // canonical country code
  url: string;
  brand: string;       // tailwind gradient tint
};

export type Listing = {
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

export const SOURCES: Source[] = [
  // USA
  { id: "zillow", name: "Zillow", region: "USA", country: "US", url: "https://www.zillow.com", brand: "from-[#006AFF]/15 to-transparent" },
  { id: "redfin", name: "Redfin", region: "USA", country: "US", url: "https://www.redfin.com", brand: "from-[#A02021]/15 to-transparent" },
  { id: "realtor", name: "Realtor.com", region: "USA", country: "US", url: "https://www.realtor.com", brand: "from-[#D92228]/12 to-transparent" },
  // UAE
  { id: "bayut", name: "Bayut", region: "UAE", country: "AE", url: "https://www.bayut.com", brand: "from-[#26B57F]/15 to-transparent" },
  { id: "propertyfinder", name: "Property Finder", region: "UAE", country: "AE", url: "https://www.propertyfinder.ae", brand: "from-[#EF4136]/15 to-transparent" },
  // UK
  { id: "rightmove", name: "Rightmove", region: "UK", country: "GB", url: "https://www.rightmove.co.uk", brand: "from-[#00DEB6]/15 to-transparent" },
  { id: "zoopla", name: "Zoopla", region: "UK", country: "GB", url: "https://www.zoopla.co.uk", brand: "from-[#8246AF]/15 to-transparent" },
  // Spain & Portugal
  { id: "idealista_es", name: "Idealista", region: "España", country: "ES", url: "https://www.idealista.com", brand: "from-[#E8A33D]/15 to-transparent" },
  { id: "fotocasa", name: "Fotocasa", region: "España", country: "ES", url: "https://www.fotocasa.es", brand: "from-[#F5A623]/15 to-transparent" },
  { id: "idealista_pt", name: "Idealista PT", region: "Portugal", country: "PT", url: "https://www.idealista.pt", brand: "from-[#E8A33D]/15 to-transparent" },
  { id: "imovirtual", name: "Imovirtual", region: "Portugal", country: "PT", url: "https://www.imovirtual.com", brand: "from-[#FF6B00]/15 to-transparent" },
  // Italy
  { id: "immobiliare", name: "Immobiliare.it", region: "Italia", country: "IT", url: "https://www.immobiliare.it", brand: "from-[#E30613]/15 to-transparent" },
  { id: "idealista_it", name: "Idealista IT", region: "Italia", country: "IT", url: "https://www.idealista.it", brand: "from-[#E8A33D]/15 to-transparent" },
  // Germany
  { id: "immoscout24", name: "ImmoScout24", region: "Deutschland", country: "DE", url: "https://www.immobilienscout24.de", brand: "from-[#F86300]/15 to-transparent" },
  { id: "immowelt", name: "Immowelt", region: "Deutschland", country: "DE", url: "https://www.immowelt.de", brand: "from-[#FFB800]/15 to-transparent" },
  // France
  { id: "seloger", name: "SeLoger", region: "France", country: "FR", url: "https://www.seloger.com", brand: "from-[#E30613]/15 to-transparent" },
  { id: "leboncoin", name: "Leboncoin", region: "France", country: "FR", url: "https://www.leboncoin.fr", brand: "from-[#FF6E14]/15 to-transparent" },
  // Netherlands, Greece
  { id: "funda", name: "Funda", region: "Nederland", country: "NL", url: "https://www.funda.nl", brand: "from-[#FF7500]/15 to-transparent" },
  { id: "spitogatos", name: "Spitogatos", region: "Ελλάδα", country: "GR", url: "https://www.spitogatos.gr", brand: "from-[#00A3E0]/15 to-transparent" },
  // Cyprus
  { id: "bazaraki", name: "Bazaraki", region: "Cyprus", country: "CY", url: "https://www.bazaraki.com", brand: "from-[#0BA6DE]/15 to-transparent" },
  // Turkey
  { id: "hepsiemlak", name: "Hepsiemlak", region: "Türkiye", country: "TR", url: "https://www.hepsiemlak.com", brand: "from-[#E4002B]/15 to-transparent" },
  { id: "sahibinden", name: "Sahibinden", region: "Türkiye", country: "TR", url: "https://www.sahibinden.com", brand: "from-[#FFCC00]/18 to-transparent" },
  // Georgia
  { id: "myhome", name: "MyHome.ge", region: "Georgia", country: "GE", url: "https://www.myhome.ge", brand: "from-[#FF5A00]/15 to-transparent" },
  { id: "ss_ge", name: "SS.ge", region: "Georgia", country: "GE", url: "https://ss.ge", brand: "from-[#003DA5]/15 to-transparent" },
  // Russia
  { id: "cian", name: "ЦИАН", region: "Россия", country: "RU", url: "https://www.cian.ru", brand: "from-[#0468FF]/15 to-transparent" },
  { id: "avito", name: "Avito", region: "Россия", country: "RU", url: "https://www.avito.ru", brand: "from-[#97CF26]/18 to-transparent" },
  // Balkans
  { id: "nekretnine_me", name: "Nekretnine.me", region: "Crna Gora", country: "ME", url: "https://www.nekretnine.me", brand: "from-[#C8102E]/15 to-transparent" },
  { id: "halooglasi", name: "Halo Oglasi", region: "Srbija", country: "RS", url: "https://www.halooglasi.com", brand: "from-[#E30613]/15 to-transparent" },
  // Poland
  { id: "otodom", name: "Otodom", region: "Polska", country: "PL", url: "https://www.otodom.pl", brand: "from-[#82BC00]/18 to-transparent" },
  // Thailand
  { id: "hipflat", name: "Hipflat", region: "Thailand", country: "TH", url: "https://www.hipflat.com", brand: "from-[#5AC8FA]/18 to-transparent" },
  { id: "dotproperty", name: "DotProperty", region: "Thailand", country: "TH", url: "https://www.dotproperty.co.th", brand: "from-[#00A651]/15 to-transparent" },
];

// Curated demo listings — used when we have local mock data. Anything not in
// FEEDS falls back to genericFeed() below so the country's ribbon is never empty.
const IMGS = [
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=640&q=70",
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=640&q=70",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=640&q=70",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=640&q=70",
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=640&q=70",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=640&q=70",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=640&q=70",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=640&q=70",
];

export const FEEDS: Record<string, Listing[]> = {
  zillow: [
    { id: "z1", source: "zillow", title: "2BR Loft · Williamsburg", price: "$1,250,000", beds: "2 bd · 2 ba", area: "1,180 sqft", city: "Brooklyn, NY", url: "https://www.zillow.com/homedetails/example-1/", img: IMGS[0] },
    { id: "z2", source: "zillow", title: "Brownstone · Park Slope", price: "$2,890,000", beds: "4 bd · 3 ba", area: "2,400 sqft", city: "Brooklyn, NY", url: "https://www.zillow.com/homedetails/example-2/", img: IMGS[1] },
    { id: "z3", source: "zillow", title: "Modern Condo · LIC", price: "$985,000", beds: "1 bd · 1 ba", area: "780 sqft", city: "Queens, NY", url: "https://www.zillow.com/homedetails/example-3/", img: IMGS[2] },
    { id: "z4", source: "zillow", title: "Townhouse · Bed-Stuy", price: "$1,650,000", beds: "3 bd · 2 ba", area: "1,720 sqft", city: "Brooklyn, NY", url: "https://www.zillow.com/homedetails/example-4/", img: IMGS[3] },
  ],
  bayut: [
    { id: "b1", source: "bayut", title: "Marina View Apartment", price: "AED 2,950,000", beds: "2 bd · 2 ba", area: "1,400 sqft", city: "Dubai Marina", url: "https://www.bayut.com/example-1", img: IMGS[0] },
    { id: "b2", source: "bayut", title: "Palm Jumeirah Villa", price: "AED 18,500,000", beds: "5 bd · 6 ba", area: "6,200 sqft", city: "Palm Jumeirah", url: "https://www.bayut.com/example-2", img: IMGS[1] },
    { id: "b3", source: "bayut", title: "Downtown Studio", price: "AED 1,150,000", beds: "Studio", area: "520 sqft", city: "Downtown Dubai", url: "https://www.bayut.com/example-3", img: IMGS[5] },
    { id: "b4", source: "bayut", title: "JVC Townhouse", price: "AED 2,250,000", beds: "3 bd · 4 ba", area: "1,950 sqft", city: "JVC", url: "https://www.bayut.com/example-4", img: IMGS[3] },
  ],
  myhome: [
    { id: "mh1", source: "myhome", title: "ბათუმი Sea View", price: "$135,000", beds: "2 bd · 1 ba", area: "68 m²", city: "Batumi", url: "https://www.myhome.ge/en/pr/example-1", img: IMGS[0] },
    { id: "mh2", source: "myhome", title: "თბილისი · Vake", price: "$220,000", beds: "3 bd · 2 ba", area: "92 m²", city: "Tbilisi", url: "https://www.myhome.ge/en/pr/example-2", img: IMGS[1] },
    { id: "mh3", source: "myhome", title: "Kobuleti Front-line", price: "$88,000", beds: "1 bd", area: "44 m²", city: "Kobuleti", url: "https://www.myhome.ge/en/pr/example-3", img: IMGS[5] },
    { id: "mh4", source: "myhome", title: "Saburtalo Newbuild", price: "$185,000", beds: "2 bd · 2 ba", area: "78 m²", city: "Tbilisi", url: "https://www.myhome.ge/en/pr/example-4", img: IMGS[3] },
  ],
  hepsiemlak: [
    { id: "he1", source: "hepsiemlak", title: "Kadıköy 2+1", price: "₺7,850,000", beds: "2+1", area: "95 m²", city: "İstanbul", url: "https://www.hepsiemlak.com/example-1", img: IMGS[0] },
    { id: "he2", source: "hepsiemlak", title: "Alanya Sea View", price: "€215,000", beds: "3+1", area: "130 m²", city: "Antalya", url: "https://www.hepsiemlak.com/example-2", img: IMGS[1] },
    { id: "he3", source: "hepsiemlak", title: "Beşiktaş Studio", price: "₺5,200,000", beds: "1+0", area: "48 m²", city: "İstanbul", url: "https://www.hepsiemlak.com/example-3", img: IMGS[5] },
    { id: "he4", source: "hepsiemlak", title: "Bodrum Villa", price: "€780,000", beds: "4+2", area: "260 m²", city: "Muğla", url: "https://www.hepsiemlak.com/example-4", img: IMGS[3] },
  ],
  cian: [
    { id: "c1", source: "cian", title: "2-к · Патриаршие", price: "48 500 000 ₽", beds: "2 к", area: "72 м²", city: "Москва", url: "https://www.cian.ru/example-1", img: IMGS[0] },
    { id: "c2", source: "cian", title: "Студия · Сити", price: "18 900 000 ₽", beds: "Студия", area: "32 м²", city: "Москва", url: "https://www.cian.ru/example-2", img: IMGS[5] },
    { id: "c3", source: "cian", title: "3-к · Крестовский", price: "36 000 000 ₽", beds: "3 к", area: "98 м²", city: "СПб", url: "https://www.cian.ru/example-3", img: IMGS[1] },
    { id: "c4", source: "cian", title: "1-к · Сокол", price: "16 200 000 ₽", beds: "1 к", area: "44 м²", city: "Москва", url: "https://www.cian.ru/example-4", img: IMGS[3] },
  ],
  immoscout24: [
    { id: "im1", source: "immoscout24", title: "Altbau · Prenzlauer Berg", price: "€780,000", beds: "3 Zi", area: "95 m²", city: "Berlin", url: "https://www.immobilienscout24.de/example-1", img: IMGS[1] },
    { id: "im2", source: "immoscout24", title: "Neubau Loft · Mitte", price: "€1,150,000", beds: "2 Zi", area: "82 m²", city: "Berlin", url: "https://www.immobilienscout24.de/example-2", img: IMGS[0] },
    { id: "im3", source: "immoscout24", title: "Familienhaus · Grünwald", price: "€2,450,000", beds: "5 Zi", area: "210 m²", city: "München", url: "https://www.immobilienscout24.de/example-3", img: IMGS[3] },
    { id: "im4", source: "immoscout24", title: "Studio · Schanze", price: "€395,000", beds: "1 Zi", area: "38 m²", city: "Hamburg", url: "https://www.immobilienscout24.de/example-4", img: IMGS[5] },
  ],
  idealista_es: [
    { id: "i1", source: "idealista_es", title: "Ático con terraza", price: "€890,000", beds: "3 hab", area: "140 m²", city: "Madrid", url: "https://www.idealista.com/example-1", img: IMGS[1] },
    { id: "i2", source: "idealista_es", title: "Piso reformado", price: "€520,000", beds: "2 hab", area: "85 m²", city: "Barcelona", url: "https://www.idealista.com/example-2", img: IMGS[3] },
    { id: "i3", source: "idealista_es", title: "Casa con jardín", price: "€1,150,000", beds: "4 hab", area: "220 m²", city: "Valencia", url: "https://www.idealista.com/example-3", img: IMGS[4] },
    { id: "i4", source: "idealista_es", title: "Loft moderno", price: "€395,000", beds: "1 hab", area: "65 m²", city: "Sevilla", url: "https://www.idealista.com/example-4", img: IMGS[5] },
  ],
};

// Fallback generator so every source has 4 demo cards even without curated data.
export function feedFor(source: Source): Listing[] {
  if (FEEDS[source.id]) return FEEDS[source.id];
  const currency = pickCurrency(source.country);
  const cities = pickCities(source.country);
  const base: [string, string, string][] = [
    ["Central 2BR", "2 bd · 1 ba", "72 m²"],
    ["Family Home", "4 bd · 3 ba", "180 m²"],
    ["Studio Loft", "Studio", "38 m²"],
    ["Suburb Villa", "5 bd · 4 ba", "240 m²"],
  ];
  const prices = ["120,000", "285,000", "68,000", "540,000"];
  return base.map(([title, beds, area], i) => ({
    id: `${source.id}-${i + 1}`,
    source: source.id,
    title: `${title} · ${cities[i % cities.length]}`,
    price: `${currency}${prices[i]}`,
    beds,
    area,
    city: cities[i % cities.length],
    url: `${source.url.replace(/\/$/, "")}/listing/example-${i + 1}`,
    img: IMGS[(i * 2) % IMGS.length],
  }));
}

function pickCurrency(c: CountryCode): string {
  switch (c) {
    case "US": return "$";
    case "GB": return "£";
    case "AE": return "AED ";
    case "RU": return "";
    case "TR": return "₺";
    case "GE": return "$";
    case "TH": return "฿";
    case "PL": return "zł ";
    case "RS": return "€";
    default: return "€";
  }
}
function pickCities(c: CountryCode): string[] {
  const map: Partial<Record<CountryCode, string[]>> = {
    GB: ["London", "Manchester", "Bristol", "Edinburgh"],
    ES: ["Madrid", "Barcelona", "Valencia", "Málaga"],
    PT: ["Lisboa", "Porto", "Cascais", "Faro"],
    IT: ["Milano", "Roma", "Firenze", "Napoli"],
    DE: ["Berlin", "München", "Hamburg", "Köln"],
    FR: ["Paris", "Nice", "Lyon", "Marseille"],
    NL: ["Amsterdam", "Rotterdam", "Utrecht", "Den Haag"],
    GR: ["Athens", "Thessaloniki", "Chania", "Rhodes"],
    CY: ["Limassol", "Paphos", "Nicosia", "Larnaca"],
    TR: ["İstanbul", "Antalya", "İzmir", "Bodrum"],
    GE: ["Tbilisi", "Batumi", "Kobuleti", "Kutaisi"],
    RU: ["Москва", "СПб", "Сочи", "Казань"],
    ME: ["Budva", "Kotor", "Podgorica", "Tivat"],
    RS: ["Beograd", "Novi Sad", "Niš", "Kragujevac"],
    PL: ["Warszawa", "Kraków", "Gdańsk", "Wrocław"],
    TH: ["Bangkok", "Phuket", "Chiang Mai", "Pattaya"],
    AE: ["Dubai Marina", "Downtown", "JVC", "Business Bay"],
    US: ["New York", "Miami", "Austin", "San Francisco"],
  };
  return map[c] ?? ["Central", "North", "South", "East"];
}

export function sourcesForCountry(country: CountryCode): Source[] {
  if (country === "AUTO") return SOURCES;
  const local = SOURCES.filter((s) => s.country === country);
  if (local.length === 0) return SOURCES;
  // Local first, then the rest as secondary suggestions.
  const rest = SOURCES.filter((s) => s.country !== country);
  return [...local, ...rest];
}
