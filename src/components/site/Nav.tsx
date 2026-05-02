import { useLang } from "./LangContext";
import { useCart } from "./CartContext";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Menu, Archive, Hammer, Truck, Package, Instagram, Facebook } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import logoRamos from "@/assets/logo-ramos-clean.png";

export const Nav = () => {
  const { lang, setLang } = useLang();
  const { count, setOpen } = useCart();
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
          <button
            onClick={() => setOpen(true)}
            aria-label={lang === "es" ? "Abrir carrito" : "Open cart"}
            className="relative h-10 w-10 rounded-full border border-border bg-background hover:bg-ink hover:text-cream transition flex items-center justify-center text-ink"
          >
            <ShoppingCart className="h-4 w-4" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-clay text-cream text-[10px] font-medium flex items-center justify-center tabular-nums">
                {count}
              </span>
            )}
          </button>
          <Sheet>
            <SheetTrigger asChild>
              <button
                aria-label={lang === "es" ? "Más opciones" : "More options"}
                className="h-10 w-10 rounded-full border border-border bg-background hover:bg-ink hover:text-cream transition flex items-center justify-center text-ink"
              >
                <Menu className="h-4 w-4" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-cream border-l border-border overflow-hidden">
              <div aria-hidden className="pointer-events-none absolute inset-0 -z-0 flex items-center justify-center overflow-hidden">
                <img
                  src={logoRamos}
                  alt=""
                  className="w-full h-auto opacity-[0.08] object-contain"
                />
              </div>
              <div className="relative z-10">
              <SheetHeader>
                <SheetTitle className="font-display text-2xl font-bold text-ink text-left">
                  {lang === "es" ? "Otros servicios" : "Other services"}
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-8 flex flex-col gap-1">
                <a
                  href="#storage"
                  className="flex items-center gap-3 px-3 py-3 rounded-lg font-normal text-ink hover:bg-ink/5 transition"
                >
                  <Archive className="h-5 w-5 text-clay" />
                  <span>Fine Art Storage</span>
                </a>
                <a
                  href="#services"
                  className="flex items-center gap-3 px-3 py-3 rounded-lg font-normal text-ink hover:bg-ink/5 transition"
                >
                  <Package className="h-5 w-5 text-clay" />
                  <span>Packing</span>
                </a>
                <a
                  href="#installation"
                  className="flex items-center gap-3 px-3 py-3 rounded-lg font-normal text-ink hover:bg-ink/5 transition"
                >
                  <Hammer className="h-5 w-5 text-clay" />
                  <span>{lang === "es" ? "Art Installation" : "Art Installation"}</span>
                </a>
                <a
                  href="#delivery"
                  className="flex items-center gap-3 px-3 py-3 rounded-lg font-normal text-ink hover:bg-ink/5 transition"
                >
                  <Truck className="h-5 w-5 text-clay" />
                  <span>{lang === "es" ? "Transporte" : "Transport"}</span>
                </a>
              </nav>
              <div className="mt-8 pt-6 border-t border-border">
                <p className="text-xs uppercase tracking-wider text-ink/60 mb-3 px-3">
                  {lang === "es" ? "Síguenos" : "Follow us"}
                </p>
                <div className="flex items-center gap-2 px-3">
                  <a
                    href="https://www.instagram.com/ramos_delivery_enterprise"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="h-10 w-10 rounded-full border border-border bg-background hover:bg-ink hover:text-cream transition flex items-center justify-center text-ink"
                  >
                    <Instagram className="h-4 w-4" />
                  </a>
                  <a
                    href="https://www.facebook.com/share/1P9s1y3cDh/?mibextid=wwXIfr"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="h-10 w-10 rounded-full border border-border bg-background hover:bg-ink hover:text-cream transition flex items-center justify-center text-ink"
                  >
                    <Facebook className="h-4 w-4" />
                  </a>
                </div>
              </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
