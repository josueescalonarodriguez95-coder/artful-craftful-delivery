import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { LangProvider, useLang } from "@/components/site/LangContext";
import { CartProvider } from "@/components/site/CartContext";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { ScrollToTop } from "@/components/site/ScrollToTop";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";

type Slug = "marmol" | "lienzo" | "esculturas";

const META: Record<Slug, { es: string; en: string; descEs: string; descEn: string }> = {
  marmol: {
    es: "Restauración de Mármol",
    en: "Marble Restoration",
    descEs:
      "Recuperamos piezas de mármol — esculturas, bases, tableros y elementos arquitectónicos — devolviéndoles su brillo, color y estabilidad estructural.",
    descEn:
      "We restore marble pieces — sculptures, bases, tabletops and architectural elements — recovering their shine, color and structural stability.",
  },
  lienzo: {
    es: "Restauración de Lienzos",
    en: "Canvas Restoration",
    descEs:
      "Limpieza, reentelado, retoques y conservación de pinturas sobre lienzo, respetando la integridad original de la obra.",
    descEn:
      "Cleaning, relining, inpainting and conservation of canvas paintings, respecting the original integrity of the work.",
  },
  esculturas: {
    es: "Restauración de Esculturas",
    en: "Sculpture Restoration",
    descEs:
      "Reparación y conservación de esculturas en diversos materiales — bronce, madera, resina, cerámica y mixtas.",
    descEn:
      "Repair and conservation of sculptures in various materials — bronze, wood, resin, ceramic and mixed media.",
  },
};

const Body = ({ slug }: { slug: Slug }) => {
  const { lang } = useLang();
  const meta = META[slug];
  const title = lang === "es" ? meta.es : meta.en;
  const desc = lang === "es" ? meta.descEs : meta.descEn;

  useEffect(() => {
    document.title = `${title} — Ramos Delivery Enterprise`;
  }, [title]);

  return (
    <div className="min-h-screen bg-cream text-ink">
      <Nav />
      <main className="pt-28 md:pt-36 pb-24">
        <div className="container max-w-4xl">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-ink/70 hover:text-clay transition mb-6"
            aria-label={lang === "es" ? "Volver" : "Back"}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{lang === "es" ? "Volver" : "Back"}</span>
          </Link>
          <span className="block text-xs uppercase tracking-[0.25em] text-clay font-medium">
            {lang === "es" ? "Restauraciones" : "Restorations"}
          </span>
          <h1 className="mt-4 font-display text-4xl md:text-6xl leading-[1.05] text-balance">
            {title}
          </h1>
          <p className="mt-6 text-ink/75 text-lg max-w-2xl leading-relaxed">{desc}</p>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Placeholder for future photos */}
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="aspect-[4/3] rounded-md border border-border/70 bg-card/60 shadow-soft flex items-center justify-center text-ink/40 text-sm"
              >
                {lang === "es" ? "Fotografía próximamente" : "Photo coming soon"}
              </div>
            ))}
          </div>

          <div className="mt-14 prose prose-stone max-w-none">
            <p className="text-ink/70 italic">
              {lang === "es"
                ? "Próximamente agregaremos información detallada, procesos y casos de estudio."
                : "Detailed information, processes and case studies coming soon."}
            </p>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
      <ScrollToTop />
    </div>
  );
};

const RestorationPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const valid: Slug[] = ["marmol", "lienzo", "esculturas"];
  const safe = (valid.includes(slug as Slug) ? slug : "marmol") as Slug;
  return (
    <LangProvider>
      <CartProvider>
        <Body slug={safe} />
      </CartProvider>
    </LangProvider>
  );
};

export default RestorationPage;
