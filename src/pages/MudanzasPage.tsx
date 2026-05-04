import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Truck, Package, Sparkles, Mail, Phone, MessageSquare, Construction } from "lucide-react";
import spiderCrane from "@/assets/service-spider-crane.jpg";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const EMAIL = "ramosdeliverye@gmail.com";
const PHONE_TEL = "+17864262444";
const PHONE_DISPLAY = "+1 (786) 426-2444";
import { LangProvider, useLang } from "@/components/site/LangContext";
import { CartProvider } from "@/components/site/CartContext";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { ScrollToTop } from "@/components/site/ScrollToTop";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { Button } from "@/components/ui/button";

const Body = () => {
  const { lang } = useLang();
  const [open, setOpen] = useState(false);
  const title = lang === "es" ? "Mudanzas" : "Moving Services";
  const desc =
    lang === "es"
      ? "Servicio profesional de mudanzas — desde artículos de alto valor (obras de arte, antigüedades, piezas delicadas) hasta mudanzas residenciales y comerciales tradicionales."
      : "Professional moving service — from high-value items (artwork, antiques, delicate pieces) to traditional residential and commercial moves.";

  const subject = lang === "es" ? "Cotización de mudanza" : "Moving quote";
  const body = lang === "es" ? "Hola, quiero cotizar una mudanza. Detalles:" : "Hi, I'd like a moving quote. Details:";

  const tiers = [
    {
      icon: ShieldCheck,
      tag: lang === "es" ? "Alto valor" : "High value",
      name: lang === "es" ? "Mudanza de artículos de valor" : "Valuables moving",
      body:
        lang === "es"
          ? "Embalaje museístico, transporte climatizado y manejo certificado para obras de arte, antigüedades, esculturas, mármol y piezas únicas."
          : "Museum-grade packing, climate-controlled transport and certified handling for artwork, antiques, sculptures, marble and unique pieces.",
      points:
        lang === "es"
          ? ["Inventario y condition report", "Embalaje a medida + huacales", "Seguro de tránsito disponible", "Personal especializado"]
          : ["Inventory & condition report", "Custom packing + crates", "Transit insurance available", "Specialized crew"],
    },
    {
      icon: Truck,
      tag: lang === "es" ? "Estándar" : "Standard",
      name: lang === "es" ? "Mudanza de artículos normales" : "Standard moving",
      body:
        lang === "es"
          ? "Mudanzas residenciales y de oficina con equipo profesional, materiales de embalaje y transporte seguro."
          : "Residential and office moves with a professional crew, packing materials and secure transport.",
      points:
        lang === "es"
          ? ["Carga y descarga", "Mantas, plástico y cinta", "Desarmado y armado", "Local e interestatal"]
          : ["Loading & unloading", "Blankets, plastic & tape", "Disassembly & reassembly", "Local & interstate"],
    },
    {
      icon: Construction,
      tag: lang === "es" ? "Grúa especializada" : "Specialized crane",
      name: lang === "es" ? "Servicio de grúa para trabajos pesados" : "Crane service for heavy-duty jobs",
      body:
        lang === "es"
          ? "Mini grúa araña (compact crawler crane) para izajes especiales en espacios reducidos — ideal para esculturas monumentales, mármol pesado y piezas de gran formato."
          : "Spider mini crane (compact crawler crane) for specialized lifts in tight spaces — ideal for monumental sculptures, heavy marble and large-format pieces.",
      points:
        lang === "es"
          ? ["Acceso a espacios reducidos", "Capacidad para cargas pesadas", "Operadores certificados", "Plan de izaje a medida"]
          : ["Access to tight spaces", "Heavy-load capacity", "Certified operators", "Custom lift plan"],
      image: spiderCrane,
    },
  ];

  return (
    <div className="min-h-screen bg-cream text-ink">
      <Nav />
      <main className="pt-28 md:pt-36 pb-24">
        <div className="container max-w-5xl">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-ink/70 hover:text-clay transition mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{lang === "es" ? "Volver" : "Back"}</span>
          </Link>
          <span className="block text-xs uppercase tracking-[0.25em] text-clay font-medium">
            {lang === "es" ? "Servicio" : "Service"}
          </span>
          <h1 className="mt-4 font-display text-4xl md:text-6xl leading-[1.05] text-balance">
            {title}
          </h1>
          <p className="mt-6 text-ink/75 text-lg max-w-2xl leading-relaxed">{desc}</p>

          <div className="mt-14 grid md:grid-cols-2 gap-6">
            {tiers.map((tier, i) => (
              <div
                key={i}
                className="group rounded-md border border-border/70 bg-card/60 p-7 md:p-8 shadow-soft hover:shadow-elegant transition"
              >
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full bg-ink text-cream flex items-center justify-center">
                    <tier.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs uppercase tracking-[0.2em] text-clay font-medium">
                    {tier.tag}
                  </span>
                </div>
                <h2 className="mt-5 font-display text-2xl md:text-3xl text-ink leading-tight">
                  {tier.name}
                </h2>
                <p className="mt-3 text-sm text-ink/65 leading-relaxed">{tier.body}</p>
                <ul className="mt-5 space-y-2 text-sm text-ink/75">
                  {tier.points.map((p, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <Sparkles className="h-4 w-4 text-clay mt-0.5 shrink-0" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-14 rounded-md bg-ink text-cream p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-cream/60 font-medium">
                {lang === "es" ? "¿Listo para mudarte?" : "Ready to move?"}
              </div>
              <h3 className="mt-2 font-display text-2xl md:text-3xl">
                {lang === "es"
                  ? "Cotiza tu mudanza con nosotros."
                  : "Get a quote for your move."}
              </h3>
            </div>
            <Button
              size="lg"
              onClick={() => setOpen(true)}
              className="bg-clay hover:bg-clay/90 text-cream rounded-full px-7"
            >
              {lang === "es" ? "Cotizar" : "Get a quote"}
            </Button>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="bg-cream">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl text-ink">
                  {lang === "es" ? "Contáctanos" : "Contact us"}
                </DialogTitle>
                <DialogDescription className="text-ink/70">
                  {lang === "es"
                    ? "Elige cómo prefieres cotizar tu mudanza."
                    : "Choose how you'd like to request your moving quote."}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 mt-2">
                <a
                  href={`tel:${PHONE_TEL}`}
                  className="flex items-center gap-3 px-4 py-3 rounded border border-border bg-background hover:border-ink/40 hover:bg-ink hover:text-cream transition-all duration-300 text-sm"
                >
                  <Phone className="h-4 w-4" />
                  <span>{lang === "es" ? "Llamada" : "Call"} · {PHONE_DISPLAY}</span>
                </a>
                <a
                  href={`sms:${PHONE_TEL}?body=${encodeURIComponent(body)}`}
                  className="flex items-center gap-3 px-4 py-3 rounded border border-border bg-background hover:border-ink/40 hover:bg-ink hover:text-cream transition-all duration-300 text-sm"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>{lang === "es" ? "Mensaje de texto" : "Text message"}</span>
                </a>
                <a
                  href={`mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`}
                  className="flex items-center gap-3 px-4 py-3 rounded border border-border bg-background hover:border-ink/40 hover:bg-ink hover:text-cream transition-all duration-300 text-sm"
                >
                  <Mail className="h-4 w-4" />
                  <span>{lang === "es" ? "Correo electrónico" : "Email"} · {EMAIL}</span>
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

const MudanzasPage = () => (
  <LangProvider>
    <CartProvider>
      <Body />
    </CartProvider>
  </LangProvider>
);

export default MudanzasPage;
