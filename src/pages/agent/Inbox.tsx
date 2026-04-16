import { ScreenHeader, EmptyState } from "@/components/TabShell";
import { MessageSquare } from "lucide-react";

export default function Inbox() {
  return (
    <div className="animate-fade-in">
      <ScreenHeader ru="Чаты" en="Inbox" />
      <EmptyState
        Icon={MessageSquare}
        ru="Нет сообщений"
        en="No messages yet"
        hint="Здесь появятся переписки с клиентами по WhatsApp, Telegram, Email и встроенному чату."
      />
    </div>
  );
}
