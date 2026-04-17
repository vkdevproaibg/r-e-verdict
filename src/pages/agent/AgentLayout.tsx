import { Sparkles, Map, Users, FolderOpen } from "lucide-react";
import { TabShell, TabDef } from "@/components/TabShell";

const tabs: TabDef[] = [
  { to: "/agent", end: true, Icon: Sparkles, ru: "Анализ", en: "Analyze", primary: true },
  { to: "/agent/map", Icon: Map, ru: "Карта", en: "Map" },
  { to: "/agent/clients", Icon: Users, ru: "Клиенты", en: "Clients" },
  { to: "/agent/library", Icon: FolderOpen, ru: "Архив", en: "Library" },
];

export default function AgentLayout() {
  return <TabShell tabs={tabs} mode="Agent mode" />;
}
