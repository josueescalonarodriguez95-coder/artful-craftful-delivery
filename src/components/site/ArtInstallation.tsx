import { useState } from "react";
import { useLang } from "./LangContext";
import { useReveal } from "@/hooks/useReveal";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import img1 from "@/assets/installation-1.jpg";
import img2 from "@/assets/installation-2.jpg";
import img3 from "@/assets/installation-3.jpg";
import img4 from "@/assets/installation-4.jpg";

const photos = [
  { src: img1, es: "Dos fotografías de gran formato instaladas en pared", en: "Two large-format photographs installed on wall" },
  { src: img2, es: "Instalación de tapiz contemporáneo en comedor", en: "Contemporary tapestry installation in dining room" },
  { src: img3, es: "Mural abstracto instalado en escalera", en: "Abstract mural installed on staircase wall" },
  { src: img4, es: "Fotografía de ola enmarcada en sala", en: "Framed wave photograph in living room" },
];

export const ArtInstallation = () => {
  const { lang } = useLang();
  const ref = useReveal<HTMLDivElement>();
  const [open, setOpen] = useState<string | null>(null);
  const [albumOpen, setAlbumOpen] = useState(false);

  const album = [...photos, ...photos, ...photos];

  return (
    <section id="installation" className="relative py-24 md:py-36 bg-cream">
      <div className="container">
        <div ref={ref} className="reveal max-w-2xl mb-12 md:mb-16">
          <span className="text-xs uppercase tracking-[0.25em] text-clay font-medium">
            {lang === "es" ? "Instalación" : "Installation"}
          </span>
          <h2 className="mt-4 font-display text-4xl md:text-6xl text-ink leading-[1.05] text-balance">
            {lang === "es" ? "Art installation." : "Art installation."}
          </h2>
          <p className="mt-5 text-ink/70 max-w-lg">
            {lang === "es"
              ? "Instalamos obras de arte en galerías, residencias, oficinas y espacios públicos con precisión, herramientas profesionales y manejo certificado."
              : "We install artworks in galleries, residences, offices and public spaces with precision, professional tools and certified handling."}
          </p>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 flex-1">
            {photos.map((p, i) => (
              <button
                key={i}
                onClick={() => setOpen(p.src)}
                className="group relative aspect-square overflow-hidden rounded-md border border-border/70 bg-card shadow-soft focus:outline-none focus:ring-2 focus:ring-ink/40"
              >
                <img
                  src={p.src}
                  alt={lang === "es" ? p.es : p.en}
                  loading="lazy"
                  width={1024}
                  height={1024}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </button>
            ))}
          </div>
          <button
            onClick={() => setAlbumOpen(true)}
            className="hidden md:flex shrink-0 self-stretch items-center justify-center px-5 rounded-md border border-ink/20 bg-cream hover:bg-ink hover:text-cream transition-colors text-sm uppercase tracking-[0.2em] font-medium"
            aria-label={lang === "es" ? "Ver más instalaciones" : "See more installations"}
          >
            {lang === "es" ? "Más →" : "More →"}
          </button>
        </div>
        <div className="mt-4 md:hidden">
          <button
            onClick={() => setAlbumOpen(true)}
            className="w-full px-5 py-3 rounded-md border border-ink/20 bg-cream hover:bg-ink hover:text-cream transition-colors text-sm uppercase tracking-[0.2em] font-medium"
          >
            {lang === "es" ? "Más →" : "More →"}
          </button>
        </div>
      </div>

      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-w-5xl p-2 bg-cream">
          {open && (
            <img
              src={open}
              alt={lang === "es" ? "Vista previa de instalación" : "Installation preview"}
              className="w-full h-auto rounded"
            />
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};
