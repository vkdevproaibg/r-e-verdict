import { Users, Sparkles, Map, MessageSquare, FolderOpen } from "lucide-react";
import { TabShell, TabDef } from "@/components/TabShell";

const tabs: TabDef[] = [
  { to: "/agent", end: true, Icon: Users, ru: "Клиенты", en: "Clients", primary: true },
  { to: "/agent/analyze", Icon: Sparkles, ru: "Анализ", en: "Analyze" },
  { to: "/agent/map", Icon: Map, ru: "Карта", en: "Map" },
  { to: "/agent/inbox", Icon: MessageSquare, ru: "Чаты", en: "Inbox" },
  { to: "/agent/library", Icon: FolderOpen, ru: "Архив", en: "Library" },
];

export default function AgentLayout() {
  return <TabShell tabs={tabs} mode="Agent mode" />;
}
