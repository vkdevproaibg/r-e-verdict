import { ScreenHeader, EmptyState } from "@/components/TabShell";
import { Heart } from "lucide-react";

export default function Saved() {
  return (
    <div className="animate-fade-in">
      <ScreenHeader ru="Избранное" en="Saved" />
      <EmptyState
        Icon={Heart}
        ru="Пока пусто"
        en="Nothing saved yet"
        hint="Сохраняйте объекты с карты — будут здесь с заметками и алертами."
      />
    </div>
  );
}
