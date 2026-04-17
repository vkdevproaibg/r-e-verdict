import { ScreenHeader, EmptyState } from "@/components/TabShell";
import { Heart, MapPin, Trash2, Pencil } from "lucide-react";
import { useSaved, useToggleSave, useUpdateSavedNotes } from "@/hooks/useCloudData";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export default function Saved() {
  const { data: saved = [], isLoading } = useSaved();
  const toggleSave = useToggleSave();
  const updateNotes = useUpdateSavedNotes();
  const [editId, setEditId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState("");

  const editing = saved.find((s) => s.id === editId);

  const fmt = (n: number, ccy = "AED") =>
    new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n) + " " + ccy;

  const openEdit = (id: string) => {
    const row = saved.find((s) => s.id === id);
    if (!row) return;
    setNotes(row.notes ?? "");
    setTags((row.tags ?? []).join(", "));
    setEditId(id);
  };

  const save = () => {
    if (!editing) return;
    updateNotes.mutate({
      id: editing.id,
      notes: notes.trim() || undefined,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
    });
    setEditId(null);
  };

  return (
    <div className="animate-fade-in">
      <ScreenHeader ru="Избранное" en="Saved" />

      {isLoading ? null : saved.length === 0 ? (
        <EmptyState
          Icon={Heart}
          ru="Пока пусто"
          en="Nothing saved yet"
          hint="Сохраняйте объекты с карты — будут здесь с заметками и алертами."
        />
      ) : (
        <div className="px-5 space-y-2">
          {saved.map((s) => {
            const p = s.property;
            if (!p) return null;
            return (
              <div
                key={s.id}
                className="rounded-2xl border border-border bg-card p-4 shadow-soft"
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "h-10 w-10 rounded-xl grid place-items-center shrink-0",
                    p.verdict === "green" ? "bg-verdict-green/15" :
                    p.verdict === "yellow" ? "bg-verdict-yellow/15" :
                    p.verdict === "red" ? "bg-verdict-red/15" : "bg-secondary"
                  )}>
                    <span className={cn("h-2 w-2 rounded-full",
                      p.verdict === "green" ? "bg-verdict-green" :
                      p.verdict === "yellow" ? "bg-verdict-yellow" :
                      p.verdict === "red" ? "bg-verdict-red" : "bg-muted-foreground")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium leading-tight truncate">{p.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1 truncate">
                      <MapPin className="h-3 w-3 shrink-0" /> {p.address}
                    </div>
                    <div className="mt-1 text-sm font-semibold">{fmt(p.price, p.currency)}</div>
                    {s.notes && (
                      <p className="mt-2 text-xs text-muted-foreground line-clamp-2 italic">"{s.notes}"</p>
                    )}
                    {s.tags && s.tags.length > 0 && (
                      <div className="mt-1.5 flex gap-1 flex-wrap">
                        {s.tags.map((t) => (
                          <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button
                      onClick={() => openEdit(s.id)}
                      className="h-8 w-8 grid place-items-center rounded-lg hover:bg-secondary"
                      aria-label="Edit notes"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => toggleSave.mutate({ propertyId: p.id, save: false })}
                      className="h-8 w-8 grid place-items-center rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                      aria-label="Remove"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Sheet open={!!editId} onOpenChange={(o) => !o && setEditId(null)}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>Заметки и теги · Notes & tags</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-3">
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Заметка</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Что важно про этот объект…"
                className="mt-1 rounded-xl"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Теги (через запятую)</label>
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="инвест, до 1М, новостройка"
                className="mt-1 rounded-xl h-11"
              />
            </div>
            <Button onClick={save} className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 rounded-xl">
              Сохранить
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
