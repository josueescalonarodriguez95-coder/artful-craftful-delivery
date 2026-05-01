import { useLang } from "./LangContext";
import { t } from "@/i18n/translations";

export const Marquee = () => {
  const { lang } = useLang();
  const items = [...t.marquee[lang], ...t.marquee[lang]];
  return (
    <div className="border-y border-border bg-secondary/40 overflow-hidden py-5">
      <div className="flex gap-16 whitespace-nowrap animate-marquee">
        {items.map((it, i) => (
          <div key={i} className="flex items-center gap-16 text-ink/60 font-display text-2xl md:text-3xl italic">
            <span>{it}</span>
            <span className="text-clay">✦</span>
          </div>
        ))}
      </div>
    </div>
  );
};
