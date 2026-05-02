import { useLang } from "./LangContext";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export const Nav = () => {
  const { lang, setLang } = useLang();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const T = {
    services: lang === "es" ? "Servicios" : "Services",
    delivery: lang === "es" ? "Delivery" : "Delivery",
    pedestals: lang === "es" ? "Pedestales" : "Pedestals",
    contact: lang === "es" ? "Contacto" : "Contact",
    quote: lang === "es" ? "Cotizar" : "Get a Quote",
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-cream/85 backdrop-blur-md border-b border-border/60" : "bg-transparent"
      }`}
    >
      <div className="container flex items-center justify-between h-16 md:h-20">
        <a href="#top" className="flex items-baseline gap-2 group">
          <span className="font-display text-2xl md:text-3xl tracking-tight text-ink">
            Ramos<span className="text-clay">·</span>Delivery<span className="text-ink/70"> Enterprise</span>
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-8 text-sm">
          <a href="#services" className="story-link text-ink hover:text-clay transition">{T.services}</a>
          <a href="#delivery" className="story-link text-ink hover:text-clay transition">{T.delivery}</a>
          <a href="#pedestals" className="story-link text-ink hover:text-clay transition">{T.pedestals}</a>
          <a href="#contact" className="story-link text-ink hover:text-clay transition">{T.contact}</a>
        </nav>

        <div className="flex items-center gap-3">
          <div className="flex items-center text-xs font-medium border border-border rounded-full overflow-hidden">
            <button
              onClick={() => setLang("es")}
              className={`px-3 py-1.5 transition ${lang === "es" ? "bg-ink text-cream" : "text-ink/60 hover:text-ink"}`}
              aria-label="Español"
            >ES</button>
            <button
              onClick={() => setLang("en")}
              className={`px-3 py-1.5 transition ${lang === "en" ? "bg-ink text-cream" : "text-ink/60 hover:text-ink"}`}
              aria-label="English"
            >EN</button>
          </div>
          <Button asChild size="sm" className="hidden sm:inline-flex bg-ink hover:bg-ink/90 text-cream rounded-full px-5">
            <a href="#delivery">{T.quote}</a>
          </Button>
        </div>
      </div>
    </header>
  );
};
