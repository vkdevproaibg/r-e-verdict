import { cn } from "@/lib/utils";

interface BiLabelProps {
  ru: string;
  en: string;
  className?: string;
  enClassName?: string;
  inline?: boolean;
}

/**
 * Bilingual label. RU primary, EN sub-label underneath (or inline).
 */
export function BiLabel({ ru, en, className, enClassName, inline }: BiLabelProps) {
  if (inline) {
    return (
      <span className={cn("inline-flex items-baseline gap-2", className)}>
        <span>{ru}</span>
        <span className={cn("text-xs text-muted-foreground", enClassName)}>{en}</span>
      </span>
    );
  }
  return (
    <span className={cn("flex flex-col leading-tight", className)}>
      <span>{ru}</span>
      <span className={cn("text-[11px] font-normal uppercase tracking-wider text-muted-foreground", enClassName)}>
        {en}
      </span>
    </span>
  );
}
