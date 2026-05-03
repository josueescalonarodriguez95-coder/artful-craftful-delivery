import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLang } from "./LangContext";
import { useReveal } from "@/hooks/useReveal";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import img1 from "@/assets/installation-1.jpg";
import img2 from "@/assets/installation-2.jpg";
import img3 from "@/assets/installation-3.jpg";
import img4 from "@/assets/installation-4.jpg";
import album1 from "@/assets/album-1.jpg";
import album2 from "@/assets/album-2.jpg";
import album3 from "@/assets/album-3.jpg";
import album4 from "@/assets/album-4.jpg";

type MediaType = "image" | "video";
type Photo = { src: string; es: string; en: string; type: MediaType };

const initialPhotos: Photo[] = [
  { src: img1, type: "image", es: "Dos fotografías de gran formato instaladas en pared", en: "Two large-format photographs installed on wall" },
  { src: img2, type: "image", es: "Instalación de tapiz contemporáneo en comedor", en: "Contemporary tapestry installation in dining room" },
  { src: img3, type: "image", es: "Mural abstracto instalado en escalera", en: "Abstract mural installed on staircase wall" },
  { src: img4, type: "image", es: "Fotografía de ola enmarcada en sala", en: "Framed wave photograph in living room" },
];

const albumExtras: Photo[] = [
  { src: album1, type: "image", es: "Instalación de obra de gran formato con nivel láser", en: "Large-format artwork installation with laser level" },
  { src: album2, type: "image", es: "Fotografía de ola enmarcada en pared blanca", en: "Framed wave photograph on white wall" },
  { src: album3, type: "image", es: "Obra abstracta sobre consola en sala", en: "Abstract artwork above console in living room" },
  { src: album4, type: "image", es: "Obra contemporánea instalada sobre sofá", en: "Contemporary artwork installed above sofa" },
  { src: "/album-video-1.mov", type: "video", es: "Video de instalación", en: "Installation video" },
  { src: "/album-video-2.mov", type: "video", es: "Video de instalación", en: "Installation video" },
];

export const ArtInstallation = () => {
  const { lang } = useLang();
  const ref = useReveal<HTMLDivElement>();
  const [open, setOpen] = useState<Photo | null>(null);
  const [albumOpen, setAlbumOpen] = useState(false);
  const albumPhotos: Photo[] = [...initialPhotos, ...albumExtras];

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
            {initialPhotos.map((p, i) => (
              <button
                key={i}
                onClick={() => setOpen(p)}
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
            className="shrink-0 self-center text-xs uppercase tracking-[0.2em] text-ink/70 hover:text-ink underline underline-offset-4 decoration-ink/40 hover:decoration-ink transition-colors"
          >
            {lang === "es" ? "más" : "more"}
          </button>
        </div>
      </div>

      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-w-5xl p-2 bg-cream">
          {open && (open.type === "video" ? (
            <video
              src={open.src}
              controls
              autoPlay
              className="w-full h-auto rounded max-h-[80vh]"
            />
          ) : (
            <img
              src={open.src}
              alt={lang === "es" ? "Vista previa de instalación" : "Installation preview"}
              className="w-full h-auto rounded"
            />
          ))}
        </DialogContent>
      </Dialog>

      <Dialog open={albumOpen} onOpenChange={setAlbumOpen}>
        <DialogContent className="max-w-6xl bg-cream max-h-[90vh] overflow-y-auto">
          <div className="mb-4">
            <span className="text-xs uppercase tracking-[0.25em] text-clay font-medium">
              {lang === "es" ? "Álbum" : "Album"}
            </span>
            <h3 className="mt-2 font-display text-3xl md:text-4xl text-ink">
              {lang === "es" ? "Instalaciones realizadas" : "Past installations"}
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {albumPhotos.map((p, i) => (
              <button
                key={i}
                onClick={() => setOpen(p)}
                className="group relative aspect-square overflow-hidden rounded-md border border-border/70 bg-card shadow-soft focus:outline-none focus:ring-2 focus:ring-ink/40"
              >
                {p.type === "video" ? (
                  <>
                    <video
                      src={p.src}
                      muted
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-ink/20">
                      <span className="w-12 h-12 rounded-full bg-cream/90 flex items-center justify-center">
                        <span className="w-0 h-0 border-y-[8px] border-y-transparent border-l-[12px] border-l-ink ml-1" />
                      </span>
                    </span>
                  </>
                ) : (
                  <img
                    src={p.src}
                    alt={lang === "es" ? p.es : p.en}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};
