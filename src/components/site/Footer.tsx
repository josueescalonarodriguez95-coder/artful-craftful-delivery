import { useLang } from "./LangContext";
import { t } from "@/i18n/translations";

export const Footer = () => {
  const { lang } = useLang();
  return (
    <footer className="bg-cream border-t border-border">
      <div className="container py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="font-display text-lg text-ink">
          Ramos<span className="text-clay">·</span>Delivery<span className="text-ink/50"> Enterprise</span>
        </div>
        <p className="text-sm text-ink/55 italic font-display">{t.footer.tag[lang]}</p>
        <div className="text-xs text-ink/50">
          © {new Date().getFullYear()} · {t.footer.rights[lang]}
        </div>
      </div>
    </footer>
  );
};
