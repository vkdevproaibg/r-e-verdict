import { Map, Heart, Users, MessageSquare } from "lucide-react";
import { TabShell, TabDef } from "@/components/TabShell";

const tabs: TabDef[] = [
  { to: "/buyer", end: true, Icon: Map, ru: "Карта", en: "Map", primary: true },
  { to: "/buyer/saved", Icon: Heart, ru: "Избранное", en: "Saved" },
  { to: "/buyer/agents", Icon: Users, ru: "Агенты", en: "Agents" },
  { to: "/buyer/inbox", Icon: MessageSquare, ru: "Чаты", en: "Inbox" },
];

export default function BuyerLayout() {
  return <TabShell tabs={tabs} mode="Buyer mode" />;
}
