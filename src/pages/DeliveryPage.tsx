import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Truck, ShieldCheck, Thermometer, ClipboardCheck, Image as ImageIcon, Video } from "lucide-react";
import { useLang } from "@/components/site/LangContext";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { ScrollToTop } from "@/components/site/ScrollToTop";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { InternalHashLink } from "@/components/site/InternalHashLink";
import { Button } from "@/components/ui/button";

const Body = () => {
  const { lang } = useLang();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    document.title = (lang === "es" ? "Fine Art Delivery" : "Fine Art Delivery") + " — Ramos Delivery Enterprise";
  }, [lang]);

  const features = [
    {
      icon: Thermometer,
      es: { title: "Transporte climatizado", body: "Vehículos con control de temperatura y humedad para piezas sensibles." },
      en: { title: "Climate-controlled transport", body: "Temperature & humidity-controlled vehicles for sensitive pieces." },
    },
    {
      icon: ShieldCheck,
      es: { title: "Manejo certificado", body: "Personal entrenado en handling museístico, guantes y soportes adecuados." },
      en: { title: "Certified handling", body: "Crew trained in museum-grade handling, gloves and proper supports." },
    },
    {
      icon: ClipboardCheck,
      es: { title: "Condition report", body: "Inventario fotográfico y reporte de condición antes y después del traslado." },
      en: { title: "Condition report", body: "Photo inventory and condition report before and after transit." },
    },
    {
      icon: Truck,
      es: { title: "Door-to-door", body: "Recogida y entrega puerta a puerta, local e interestatal." },
      en: { title: "Door-to-door", body: "Door-to-door pickup and delivery, local and interstate." },
    },
  ];

  return (
    <div className="min-h-screen bg-cream text-ink">
      <Nav />
      <main className="pt-28 md:pt-36 pb-24">
        <div className="container max-w-6xl">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-ink/70 hover:text-clay transition mb-6">
            <ArrowLeft className="h-4 w-4" />
            <span>{lang === "es" ? "Volver" : "Back"}</span>
          </Link>
          <span className="block text-xs uppercase tracking-[0.25em] text-clay font-medium">
            {lang === "es" ? "01 — Delivery" : "01 — Delivery"}
          </span>
          <h1 className="mt-4 font-display text-4xl md:text-6xl leading-[1.05] text-balance">
            Fine Art on Delivery
          </h1>
          <p className="mt-6 text-ink/75 text-lg max-w-2xl leading-relaxed">
            {lang === "es"
              ? "Servicio especializado de transporte de obras de arte — diseñado para galerías, coleccionistas, museos y artistas que no pueden permitirse un error."
              : "Specialized art transport service — built for galleries, collectors, museums and artists who cannot afford a mistake."}
          </p>

          <div className="mt-12 grid md:grid-cols-2 gap-5">
            {features.map((f, i) => {
              const c = lang === "es" ? f.es : f.en;
              const Icon = f.icon;
              return (
                <div key={i} className="rounded-md border border-border/70 bg-card/60 p-6 md:p-7 shadow-soft hover:shadow-elegant transition">
                  <div className="h-11 w-11 rounded-full bg-ink text-cream flex items-center justify-center">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-display text-xl md:text-2xl text-ink">{c.title}</h3>
                  <p className="mt-2 text-sm text-ink/65 leading-relaxed">{c.body}</p>
                </div>
              );
            })}
          </div>

          <section className="mt-16">
            <h2 className="font-display text-2xl md:text-3xl text-ink">
              {lang === "es" ? "Galería" : "Gallery"}
            </h2>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="aspect-[4/3] rounded-md border border-border/70 bg-card/60 shadow-soft flex flex-col items-center justify-center text-ink/40 text-xs gap-2">
                  <ImageIcon className="h-6 w-6" />
                  <span>{lang === "es" ? "Foto próximamente" : "Photo coming soon"}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 aspect-video rounded-md border border-border/70 bg-card/60 shadow-soft flex flex-col items-center justify-center text-ink/40 text-xs gap-2">
              <Video className="h-6 w-6" />
              <span>{lang === "es" ? "Video próximamente" : "Video coming soon"}</span>
            </div>
          </section>

          <div className="mt-14 rounded-md bg-ink text-cream p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-cream/60 font-medium">
                {lang === "es" ? "¿Listo para enviar tu obra?" : "Ready to ship your artwork?"}
              </div>
              <h3 className="mt-2 font-display text-2xl md:text-3xl">
                {lang === "es" ? "Cotiza tu delivery con la calculadora." : "Quote your delivery with our calculator."}
              </h3>
            </div>
            <Button asChild size="lg" className="bg-clay hover:bg-clay/90 text-cream rounded-full px-7">
              <InternalHashLink to="/#delivery" className="inline-flex items-center justify-center bg-clay hover:bg-clay/90 text-cream rounded-full px-7 py-3 text-sm font-medium transition">
                {lang === "es" ? "Ir a la calculadora" : "Open calculator"}
              </InternalHashLink>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
      <ScrollToTop />
    </div>
  );
};

const DeliveryPage = () => <Body />;

export default DeliveryPage;
