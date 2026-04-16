import { ScreenHeader, EmptyState } from "@/components/TabShell";
import { MessageSquare } from "lucide-react";

export default function BuyerInbox() {
  return (
    <div className="animate-fade-in">
      <ScreenHeader ru="Чаты" en="Inbox" />
      <EmptyState
        Icon={MessageSquare}
        ru="Нет переписок"
        en="No conversations"
        hint="Свяжитесь с агентом с карты — диалог появится здесь."
      />
    </div>
  );
}
