import { Sparkles, Map, Heart, Bell } from "lucide-react";
import { TabShell, TabDef } from "@/components/TabShell";

const tabs: TabDef[] = [
  { to: "/buyer", end: true, Icon: Sparkles, ru: "Анализ", en: "Analyze", primary: true },
  { to: "/buyer/map", Icon: Map, ru: "Карта", en: "Map" },
  { to: "/buyer/saved", Icon: Heart, ru: "Избранное", en: "Saved" },
  { to: "/buyer/alerts", Icon: Bell, ru: "Алерты", en: "Alerts" },
];

export default function BuyerLayout() {
  return <TabShell tabs={tabs} mode="Buyer mode" />;
}
