import { ScreenHeader, EmptyState } from "@/components/TabShell";
import { Button } from "@/components/ui/button";
import { Plus, UserPlus, Users, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const sample = [
  { name: "Анна Петрова", stage: "Просмотр · Viewing", count: 3, last: "2ч" },
  { name: "Игорь Соколов", stage: "Интерес · Interested", count: 1, last: "вчера" },
  { name: "Maria Lopez", stage: "Новый · New", count: 0, last: "—" },
];

const stageColor: Record<string, string> = {
  "Просмотр · Viewing": "bg-verdict-yellow/15 text-verdict-yellow",
  "Интерес · Interested": "bg-verdict-green/15 text-verdict-green",
  "Новый · New": "bg-secondary text-muted-foreground",
};

export default function ClientsList() {
  return (
    <div className="animate-fade-in">
      <ScreenHeader
        ru="Клиенты"
        en="Clients"
        action={
          <Button size="sm" className="rounded-full bg-foreground text-background hover:bg-foreground/90 h-9">
            <Plus className="h-4 w-4 mr-1" /> Новый
          </Button>
        }
      />

      <div className="px-5 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Поиск · Search" className="pl-9 h-11 rounded-xl bg-card" />
        </div>
      </div>

      <div className="px-5 space-y-2">
        {sample.map((c) => (
          <button
            key={c.name}
            className="w-full text-left rounded-2xl border border-border bg-card p-4 shadow-soft hover:shadow-elevated hover:-translate-y-0.5 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-bronze grid place-items-center text-accent-foreground text-sm font-semibold">
                {c.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="font-medium truncate">{c.name}</div>
                  <div className="text-xs text-muted-foreground shrink-0">{c.last}</div>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${stageColor[c.stage]}`}>
                    {c.stage}
                  </span>
                  <span className="text-xs text-muted-foreground">{c.count} объектов</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <EmptyState
        Icon={UserPlus}
        ru="Пригласите клиента"
        en="Invite a client"
        hint="Отправьте ссылку или QR — клиент увидит ваши объекты в своём приложении."
      />
    </div>
  );
}
