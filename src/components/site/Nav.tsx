import { useLang } from "./LangContext";
import { useCart } from "./CartContext";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Menu, Archive, Hammer, Truck, Instagram, Facebook, Sparkles, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AboutPanel } from "./AboutPanel";
import logoRamos from "@/assets/logo-ramos-clean.png";

export const Nav = () => {
  const { lang, setLang } = useLang();
  const { count, setOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [restOpen, setRestOpen] = useState(false);

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
    restorations: lang === "es" ? "Restauraciones" : "Restorations",
    contact: lang === "es" ? "Contacto" : "Contact",
    quote: lang === "es" ? "Cotizar" : "Get a Quote",
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-cream/85 backdrop-blur-md border-b border-border/60" : "bg-transparent"
      }`}
    >
      <div className="container flex items-center justify-between h-16 md:h-20">
        <button
          onClick={() => setAboutOpen(true)}
          className="relative flex items-center gap-2 group text-left"
          aria-label={lang === "es" ? "Quiénes somos" : "About us"}
        >
          <span className="relative font-display text-2xl md:text-3xl tracking-tight text-ink inline-block animate-brand-pulse origin-left">
            <span
              className="bg-[linear-gradient(110deg,transparent_0%,transparent_40%,hsl(var(--clay)/0.45)_50%,transparent_60%,transparent_100%)] bg-[length:250%_100%] bg-clip-text"
              style={{ WebkitBackgroundClip: "text" }}
            >
              <span className="text-ink">Ramos</span><span className="text-clay">·</span><span className="text-ink">Delivery</span><span className="text-ink/70"> Enterprise</span>
            </span>
            <span aria-hidden className="pointer-events-none absolute inset-0 animate-shine bg-[linear-gradient(110deg,transparent_40%,hsl(var(--clay)/0.35)_50%,transparent_60%)] bg-[length:250%_100%] mix-blend-overlay rounded" />
            <span aria-hidden className="absolute -bottom-1 left-0 h-[2px] w-0 bg-clay transition-all duration-500 group-hover:w-full" />
          </span>
        </button>

        <nav className="hidden md:flex items-center gap-2 text-sm">
          <a href="#services" className="px-4 py-2 rounded-full border border-ink/15 bg-cream/70 backdrop-blur-sm text-ink font-medium hover:bg-ink hover:text-cream hover:border-ink transition-all duration-300 shadow-sm">{T.services}</a>
          <a href="#delivery" className="px-4 py-2 rounded-full border border-ink/15 bg-cream/70 backdrop-blur-sm text-ink font-medium hover:bg-ink hover:text-cream hover:border-ink transition-all duration-300 shadow-sm">{T.delivery}</a>
          <a href="#pedestals" className="px-4 py-2 rounded-full border border-ink/15 bg-cream/70 backdrop-blur-sm text-ink font-medium hover:bg-ink hover:text-cream hover:border-ink transition-all duration-300 shadow-sm">{T.pedestals}</a>
          <Link to="/restauraciones" className="px-4 py-2 rounded-full border border-ink/15 bg-cream/70 backdrop-blur-sm text-ink font-medium hover:bg-ink hover:text-cream hover:border-ink transition-all duration-300 shadow-sm">{T.restorations}</Link>
          <a href="#contact" className="px-4 py-2 rounded-full border border-ink/15 bg-cream/70 backdrop-blur-sm text-ink font-medium hover:bg-ink hover:text-cream hover:border-ink transition-all duration-300 shadow-sm">{T.contact}</a>
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
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
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
                  onClick={closeMenu}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg font-normal text-ink hover:bg-ink/5 transition"
                >
                  <Archive className="h-5 w-5 text-clay" />
                  <span>Fine Art Storage</span>
                </a>
                <a
                  href="#installation"
                  onClick={closeMenu}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg font-normal text-ink hover:bg-ink/5 transition"
                >
                  <Hammer className="h-5 w-5 text-clay" />
                  <span>{lang === "es" ? "Art Installation" : "Art Installation"}</span>
                </a>
                <Link
                  to="/mudanzas"
                  onClick={closeMenu}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg font-normal text-ink hover:bg-ink/5 transition"
                >
                  <Truck className="h-5 w-5 text-clay" />
                  <span>{lang === "es" ? "Transporte" : "Transport"}</span>
                </Link>
                <Link
                  to="/restauraciones"
                  onClick={closeMenu}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg font-normal text-ink hover:bg-ink/5 transition"
                >
                  <Sparkles className="h-5 w-5 text-clay" />
                  <span>{lang === "es" ? "Restauraciones" : "Restorations"}</span>
                </Link>
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
      <AboutPanel open={aboutOpen} onOpenChange={setAboutOpen} />
    </header>
  );
};
