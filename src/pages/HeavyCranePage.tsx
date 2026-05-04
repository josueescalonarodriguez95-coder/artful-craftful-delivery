import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Construction, Sparkles, Mail, Phone, MessageSquare, Ruler, Weight, Mountain, Move3d } from "lucide-react";
import heavyCrane from "@/assets/service-heavy-crane.jpg";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { LangProvider, useLang } from "@/components/site/LangContext";
import { CartProvider } from "@/components/site/CartContext";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { ScrollToTop } from "@/components/site/ScrollToTop";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { Button } from "@/components/ui/button";

const EMAIL = "ramosdeliverye@gmail.com";
const PHONE_TEL = "+17864262444";
const PHONE_DISPLAY = "+1 (786) 426-2444";

const Body = () => {
  const { lang } = useLang();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const title = lang === "es" ? "Grúa para trabajos pesados especiales" : "Crane for special heavy-duty jobs";
  const desc =
    lang === "es"
      ? "Mini grúa araña (compact crawler crane) diseñada para izajes especiales en espacios reducidos. Ideal para esculturas monumentales, mármol pesado, instalaciones complejas y movimientos donde una grúa convencional no puede operar."
      : "Spider mini crane (compact crawler crane) for specialized lifts in tight spaces. Ideal for monumental sculptures, heavy marble, complex installations and lifts where a conventional crane cannot operate.";

  const specs = [
    {
      icon: Weight,
      label: lang === "es" ? "Capacidad máxima" : "Max capacity",
      value: lang === "es" ? "6,000 libras (2,720 kg)" : "6,000 lbs (2,720 kg)",
    },
    {
      icon: Mountain,
      label: lang === "es" ? "Altura de levantamiento" : "Lifting height",
      value: "9 m (29.5 ft)",
    },
    {
      icon: Move3d,
      label: lang === "es" ? "Alcance horizontal" : "Horizontal reach",
      value: "8.3 m (27.5 ft)",
    },
    {
      icon: Ruler,
      label: lang === "es" ? "Dimensiones compactas" : "Compact dimensions",
      value: lang === "es" ? "137″ largo · 73″ alto · 32″ ancho" : "137″ L · 73″ H · 32″ W",
    },
  ];

  const jobs =
    lang === "es"
      ? [
          "Montaje de esculturas y obras de arte monumentales",
          "Instalación en alturas complicadas",
          "Carga y descarga en zonas estrechas",
          "Trabajos en patios pequeños o interiores",
          "Movimiento de mármol y piezas pesadas",
          "Operadores certificados y plan de izaje a medida",
        ]
      : [
          "Installation of monumental sculptures and artworks",
          "Lifting at complicated heights",
          "Loading and unloading in tight areas",
          "Work in small patios or indoor spaces",
          "Marble and heavy-piece moving",
          "Certified operators and custom lift plan",
        ];

  const subject = lang === "es" ? "Cotización grúa especializada" : "Specialized crane quote";
  const body = lang === "es" ? "Hola, necesito información del servicio de grúa especializada." : "Hi, I'd like info about the specialized crane service.";

  return (
    <div className="min-h-screen bg-cream text-ink">
      <Nav />
      <main className="pt-28 md:pt-36 pb-24">
        <div className="container max-w-6xl">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-ink/70 hover:text-clay transition mb-6">
            <ArrowLeft className="h-4 w-4" />
            <span>{lang === "es" ? "Volver" : "Back"}</span>
          </Link>

          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div>
              <span className="block text-xs uppercase tracking-[0.25em] text-clay font-medium">
                {lang === "es" ? "Servicio especializado" : "Specialized service"}
              </span>
              <h1 className="mt-4 font-display text-4xl md:text-5xl lg:text-6xl leading-[1.05] text-balance">
                {title}
              </h1>
              <p className="mt-6 text-ink/75 text-lg leading-relaxed">{desc}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  size="lg"
                  onClick={() => setOpen(true)}
                  className="bg-clay hover:bg-clay/90 text-cream rounded-full px-7"
                >
                  {lang === "es" ? "Solicitar cotización" : "Request a quote"}
                </Button>
              </div>
            </div>
            <div className="rounded-md overflow-hidden bg-white shadow-elegant">
              <img
                src={heavyCrane}
                alt={title}
                width={1280}
                height={960}
                className="w-full h-auto object-cover"
              />
            </div>
          </div>

          <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {specs.map((s, i) => (
              <div key={i} className="rounded-md border border-border/70 bg-card/60 p-6 shadow-soft">
                <div className="h-11 w-11 rounded-full bg-ink text-cream flex items-center justify-center">
                  <s.icon className="h-5 w-5" />
                </div>
                <div className="mt-4 text-xs uppercase tracking-[0.2em] text-clay font-medium">{s.label}</div>
                <div className="mt-2 font-display text-xl text-ink leading-tight">{s.value}</div>
              </div>
            ))}
          </div>

          <div className="mt-14 rounded-md border border-border/70 bg-card/60 p-8 md:p-10">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-ink text-cream flex items-center justify-center">
                <Construction className="h-5 w-5" />
              </div>
              <span className="text-xs uppercase tracking-[0.2em] text-clay font-medium">
                {lang === "es" ? "¿Qué trabajos puede hacer?" : "What jobs can it do?"}
              </span>
            </div>
            <ul className="mt-6 grid md:grid-cols-2 gap-3 text-ink/80">
              {jobs.map((j, i) => (
                <li key={i} className="flex items-start gap-2 text-sm md:text-base">
                  <Sparkles className="h-4 w-4 text-clay mt-1 shrink-0" />
                  <span>{j}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-14 rounded-md bg-ink text-cream p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-cream/60 font-medium">
                {lang === "es" ? "¿Tienes un trabajo pesado?" : "Have a heavy-duty job?"}
              </div>
              <h3 className="mt-2 font-display text-2xl md:text-3xl">
                {lang === "es" ? "Cuéntanos los detalles y armamos el plan." : "Tell us the details and we'll plan the lift."}
              </h3>
            </div>
            <Button size="lg" onClick={() => setOpen(true)} className="bg-clay hover:bg-clay/90 text-cream rounded-full px-7">
              {lang === "es" ? "Contactar" : "Contact"}
            </Button>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="bg-cream">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl text-ink">
                  {lang === "es" ? "Contáctanos" : "Contact us"}
                </DialogTitle>
                <DialogDescription className="text-ink/70">
                  {lang === "es" ? "Elige cómo prefieres comunicarte." : "Choose how you'd like to reach us."}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 mt-2">
                <a href={`tel:${PHONE_TEL}`} className="flex items-center gap-3 px-4 py-3 rounded border border-border bg-background hover:border-ink/40 hover:bg-ink hover:text-cream transition-all duration-300 text-sm">
                  <Phone className="h-4 w-4" />
                  <span>{lang === "es" ? "Llamada" : "Call"} · {PHONE_DISPLAY}</span>
                </a>
                <a href={`sms:${PHONE_TEL}?body=${encodeURIComponent(body)}`} className="flex items-center gap-3 px-4 py-3 rounded border border-border bg-background hover:border-ink/40 hover:bg-ink hover:text-cream transition-all duration-300 text-sm">
                  <MessageSquare className="h-4 w-4" />
                  <span>{lang === "es" ? "Mensaje de texto" : "Text message"}</span>
                </a>
                <a href={`mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`} className="flex items-center gap-3 px-4 py-3 rounded border border-border bg-background hover:border-ink/40 hover:bg-ink hover:text-cream transition-all duration-300 text-sm">
                  <Mail className="h-4 w-4" />
                  <span>{lang === "es" ? "Correo" : "Email"} · {EMAIL}</span>
                </a>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
      <ScrollToTop />
    </div>
  );
};

const HeavyCranePage = () => (
  <LangProvider>
    <CartProvider>
      <Body />
    </CartProvider>
  </LangProvider>
);

export default HeavyCranePage;
