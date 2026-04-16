import { useApp } from "@/state/AppContext";

export function LanguageToggle() {
  const { lang, setLang } = useApp();
  return (
    <div className="inline-flex items-center rounded-full border border-border bg-card p-0.5 text-xs font-medium">
      {(["ru", "en"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`px-3 py-1 rounded-full transition-colors ${
            lang === l ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
