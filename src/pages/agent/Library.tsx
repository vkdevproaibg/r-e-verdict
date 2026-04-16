import { ScreenHeader, EmptyState } from "@/components/TabShell";
import { FolderOpen } from "lucide-react";

export default function Library() {
  return (
    <div className="animate-fade-in">
      <ScreenHeader ru="Архив" en="Library" />
      <EmptyState
        Icon={FolderOpen}
        ru="Архив пуст"
        en="No saved analyses"
        hint="Сохранённые анализы и ваше портфолио объектов будут здесь."
      />
    </div>
  );
}
