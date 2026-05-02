import { useState } from "react";
import { useLang } from "./LangContext";
import { t } from "@/i18n/translations";
import { AboutPanel } from "./AboutPanel";
import { Sparkles } from "lucide-react";

export const Footer = () => {
  const { lang } = useLang();
  const [open, setOpen] = useState(false);
  return (
    <footer className="bg-cream border-t border-border">
      <div className="container py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="font-display text-lg text-ink">
          Ramos<span className="text-clay">·</span>Delivery<span className="text-ink/50"> Enterprise</span>
        </div>
        <p className="text-sm text-ink/55 italic font-display">{t.footer.tag[lang]}</p>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setOpen(true)}
            className="group inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ink/70 hover:text-ink transition border border-border rounded-full px-4 py-2 hover:border-clay/60 bg-card/40"
          >
            <Sparkles className="h-3.5 w-3.5 text-[hsl(45,85%,55%)]" />
            {lang === "es" ? "Ramos Delivery Enterprise" : "Ramos Delivery Enterprise"}
          </button>
          <div className="text-xs text-ink/50">
            © {new Date().getFullYear()} · {t.footer.rights[lang]}
          </div>
        </div>
      </div>
      <AboutPanel open={open} onOpenChange={setOpen} />
    </footer>
  );
};
