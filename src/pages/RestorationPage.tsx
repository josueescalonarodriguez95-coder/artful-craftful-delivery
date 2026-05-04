import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Gem, Palette, Hammer, Image as ImageIcon, Video } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useLang } from "@/components/site/LangContext";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { ScrollToTop } from "@/components/site/ScrollToTop";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";

const SECTIONS = [
  {
    id: "marmol",
    icon: Gem,
    es: {
      tag: "Mármol",
      title: "Restauración de Mármol",
      summary:
        "Recuperamos esculturas, bases, tableros y elementos arquitectónicos en mármol — limpieza profunda, reparación de fracturas, reposición de fragmentos y pulido final para devolver brillo, color y estabilidad estructural.",
    },
    en: {
      tag: "Marble",
      title: "Marble Restoration",
      summary:
        "We restore marble sculptures, bases, tabletops and architectural elements — deep cleaning, fracture repair, fragment replacement and final polishing to bring back shine, color and structural stability.",
    },
  },
  {
    id: "lienzo",
    icon: Palette,
    es: {
      tag: "Lienzo",
      title: "Restauración de Lienzos",
      summary:
        "Limpieza de barnices oxidados, reentelado, consolidación de capa pictórica, retoques reversibles y barnizado final. Cuidamos la integridad original de cada pintura sobre lienzo.",
    },
    en: {
      tag: "Canvas",
      title: "Canvas Restoration",
      summary:
        "Removal of oxidized varnishes, relining, paint-layer consolidation, reversible inpainting and final varnish. We protect the original integrity of every canvas painting.",
    },
  },
  {
    id: "esculturas",
    icon: Hammer,
    es: {
      tag: "Esculturas",
      title: "Restauración de Esculturas",
      summary:
        "Reparación y conservación de esculturas en bronce, madera, resina, cerámica y materiales mixtos — soldaduras, reconstrucción de partes faltantes, pátinas y acabados de conservación.",
    },
    en: {
      tag: "Sculptures",
      title: "Sculpture Restoration",
      summary:
        "Repair and conservation of bronze, wood, resin, ceramic and mixed-media sculptures — welding, reconstruction of missing parts, patinas and conservation finishes.",
    },
  },
];

const ThumbCard = ({ kind }: { kind: "photo" | "video" }) => {
  const { lang } = useLang();
  const [open, setOpen] = useState(false);
  const Icon = kind === "video" ? Video : ImageIcon;
  const label =
    kind === "video"
      ? lang === "es" ? "Video" : "Video"
      : lang === "es" ? "Foto" : "Photo";
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group bg-secondary/40 rounded-md border border-border/60 overflow-hidden cursor-zoom-in"
        aria-label={label}
      >
        <div className="relative block w-full aspect-square bg-cream overflow-hidden flex flex-col items-center justify-center text-ink/40 gap-1 transition group-hover:bg-cream/80">
          <Icon className="h-5 w-5" />
          <span className="text-[10px] uppercase tracking-[0.15em]">{label}</span>
        </div>
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl bg-cream">
          <DialogTitle className="sr-only">{label}</DialogTitle>
          <div className="aspect-video w-full rounded-md bg-secondary/40 border border-border/60 flex flex-col items-center justify-center text-ink/40 gap-2">
            <Icon className="h-8 w-8" />
            <span className="text-xs uppercase tracking-[0.2em]">
              {lang === "es" ? "Próximamente" : "Coming soon"}
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

const Body = () => {
  const { lang } = useLang();

  useEffect(() => {
    document.title = (lang === "es" ? "Restauraciones" : "Restorations") + " — Ramos Delivery Enterprise";
  }, [lang]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

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
            {lang === "es" ? "Servicio" : "Service"}
          </span>
          <h1 className="mt-4 font-display text-4xl md:text-6xl leading-[1.05] text-balance">
            {lang === "es" ? "Restauraciones" : "Restorations"}
          </h1>
          <p className="mt-6 text-ink/75 text-lg max-w-2xl leading-relaxed">
            {lang === "es"
              ? "Tres especialidades, un mismo estándar museístico. Conoce qué restauramos y mira ejemplos en foto y video."
              : "Three specialties, one museum-grade standard. Discover what we restore and see photo and video examples."}
          </p>

          <div className="mt-16 space-y-20">
            {SECTIONS.map((s, idx) => {
              const copy = lang === "es" ? s.es : s.en;
              const Icon = s.icon;
              return (
                <section key={s.id} id={s.id} className="scroll-mt-32">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-11 w-11 rounded-full bg-ink text-cream flex items-center justify-center">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs uppercase tracking-[0.2em] text-clay font-medium">
                      {String(idx + 1).padStart(2, "0")} — {copy.tag}
                    </span>
                  </div>
                  <h2 className="font-display text-3xl md:text-4xl text-ink leading-tight">{copy.title}</h2>
                  <p className="mt-4 text-ink/70 leading-relaxed max-w-3xl">{copy.summary}</p>

                  {/* Media thumbnails — same look as pedestal preview */}
                  <div className="mt-8 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 max-w-3xl">
                    {[0, 1, 2, 3].map((i) => (
                      <ThumbCard key={`p-${i}`} kind="photo" />
                    ))}
                    <ThumbCard kind="video" />
                    <ThumbCard kind="video" />
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
      <ScrollToTop />
    </div>
  );
};

const RestorationPage = () => <Body />;

export default RestorationPage;
