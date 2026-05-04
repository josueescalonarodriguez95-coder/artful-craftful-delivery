import { useEffect, useRef, useState } from "react";
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

const allMedia: Photo[] = [...initialPhotos, ...albumExtras];

export const ArtInstallation = () => {
  const { lang } = useLang();
  const ref = useReveal<HTMLDivElement>();
  const [open, setOpen] = useState<{ list: Photo[]; index: number } | null>(null);
  const [albumOpen, setAlbumOpen] = useState(false);
  const albumPhotos: Photo[] = allMedia;

  const current = open ? open.list[open.index] : null;
  const prev = () => open && setOpen({ ...open, index: (open.index - 1 + open.list.length) % open.list.length });
  const next = () => open && setOpen({ ...open, index: (open.index + 1) % open.list.length });

  // Smooth carousel
  const total = allMedia.length;
  const [cIndex, setCIndex] = useState(0);
  const [drag, setDrag] = useState(0);
  const [animate, setAnimate] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef(220);
  const draggingRef = useRef(false);
  const startXRef = useRef(0);
  const lastXRef = useRef(0);
  const lastTRef = useRef(0);
  const velocityRef = useRef(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    const measure = () => {
      const w = containerRef.current?.clientWidth ?? 480;
      const imgW = Math.min(260, Math.max(150, w * 0.55));
      slotRef.current = imgW + 24;
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => { pausedRef.current = open !== null || albumOpen; }, [open, albumOpen]);

  useEffect(() => {
    const id = setInterval(() => {
      if (!pausedRef.current && !draggingRef.current) {
        setAnimate(true);
        setCIndex((i) => (i + 1) % total);
      }
    }, 4000);
    return () => clearInterval(id);
  }, [total]);

  const goTo = (i: number) => { setAnimate(true); setCIndex(((i % total) + total) % total); };
  const onPointerDown = (e: React.PointerEvent) => {
    draggingRef.current = true;
    startXRef.current = e.clientX; lastXRef.current = e.clientX;
    lastTRef.current = performance.now(); velocityRef.current = 0;
    setAnimate(false); pausedRef.current = true;
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const now = performance.now();
    const dt = Math.max(1, now - lastTRef.current);
    velocityRef.current = (e.clientX - lastXRef.current) / dt;
    lastXRef.current = e.clientX; lastTRef.current = now;
    setDrag(e.clientX - startXRef.current);
  };
  const endDrag = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    const slot = slotRef.current;
    const projected = drag + velocityRef.current * 180;
    const steps = Math.round(-projected / slot);
    setAnimate(true);
    setCIndex((i) => (((i + steps) % total) + total) % total);
    setDrag(0);
    pausedRef.current = open !== null || albumOpen;
  };

  const slot = slotRef.current;
  const translatePx = -cIndex * slot + drag;

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

        <div className="flex items-center justify-center gap-2 sm:gap-4">
          <button
            onClick={() => goTo(cIndex - 1)}
            aria-label={lang === "es" ? "Anterior" : "Previous"}
            className="shrink-0 h-9 w-9 rounded-full bg-ink/5 hover:bg-ink/15 backdrop-blur-sm text-ink/70 hover:text-ink transition flex items-center justify-center"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div
            ref={containerRef}
            className="relative flex-1 max-w-[640px] h-56 sm:h-64 md:h-72 overflow-hidden touch-pan-y select-none cursor-grab active:cursor-grabbing"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onPointerLeave={endDrag}
          >
            <div
              className="absolute top-1/2 left-1/2 flex items-center"
              style={{
                transform: `translate3d(calc(-50% + ${translatePx}px + ${slot / 2}px), -50%, 0)`,
                transition: animate ? "transform 800ms cubic-bezier(0.22, 1, 0.36, 1)" : "none",
                willChange: "transform",
              }}
            >
              {allMedia.map((p, i) => {
                const distance = (i * slot) - (cIndex * slot - drag);
                const norm = slot ? distance / slot : 0;
                const abs = Math.min(2, Math.abs(norm));
                const scale = 1 - abs * 0.06;
                const opacity = Math.max(0.85, 1 - abs * 0.08);
                return (
                  <div key={i} className="shrink-0 flex items-center justify-center" style={{ width: slot }}>
                    <button
                      onClick={() => { if (Math.abs(drag) > 4) return; setOpen({ list: allMedia, index: i }); }}
                      className="block will-change-transform relative"
                      style={{
                        transform: `scale(${scale})`,
                        opacity,
                        transition: animate ? "transform 800ms cubic-bezier(0.22, 1, 0.36, 1), opacity 800ms ease-in-out" : "none",
                      }}
                    >
                      {p.type === "video" ? (
                        <div className="relative w-40 h-40 sm:w-52 sm:h-52 md:w-60 md:h-60 rounded-md shadow-elegant border border-border/60 overflow-hidden bg-ink/10 pointer-events-none">
                          <video src={p.src} muted playsInline preload="metadata" className="w-full h-full object-cover" />
                          <span className="absolute inset-0 flex items-center justify-center bg-ink/20">
                            <span className="w-12 h-12 rounded-full bg-cream/90 flex items-center justify-center">
                              <span className="w-0 h-0 border-y-[8px] border-y-transparent border-l-[12px] border-l-ink ml-1" />
                            </span>
                          </span>
                        </div>
                      ) : (
                        <img
                          src={p.src}
                          alt={lang === "es" ? p.es : p.en}
                          loading="lazy"
                          draggable={false}
                          className="w-40 h-40 sm:w-52 sm:h-52 md:w-60 md:h-60 object-cover rounded-md shadow-elegant border border-border/60 pointer-events-none"
                        />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => goTo(cIndex + 1)}
            aria-label={lang === "es" ? "Siguiente" : "Next"}
            className="shrink-0 h-9 w-9 rounded-full bg-ink/5 hover:bg-ink/15 backdrop-blur-sm text-ink/70 hover:text-ink transition flex items-center justify-center"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 flex items-center justify-center gap-1.5">
          {allMedia.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`${lang === "es" ? "Ir a" : "Go to"} ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === cIndex ? "w-6 bg-ink/70" : "w-1.5 bg-ink/25 hover:bg-ink/40"
              }`}
            />
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setAlbumOpen(true)}
            className="text-xs uppercase tracking-[0.2em] text-ink/70 hover:text-ink underline underline-offset-4 decoration-ink/40 hover:decoration-ink transition-colors"
          >
            {lang === "es" ? "ver álbum completo" : "view full album"}
          </button>
        </div>
      </div>

      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-w-5xl p-0 bg-transparent border-0 shadow-none">
          {current && (
            <div className="flex items-center gap-2 sm:gap-4">
              {open && open.list.length > 1 && (
                <button
                  onClick={prev}
                  aria-label={lang === "es" ? "Anterior" : "Previous"}
                  className="shrink-0 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-cream/20 hover:bg-cream/40 backdrop-blur-sm text-cream flex items-center justify-center transition"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}
              {current.type === "video" ? (
                <video
                  src={current.src}
                  controls
                  autoPlay
                  className="flex-1 min-w-0 h-auto rounded max-h-[80vh]"
                />
              ) : (
                <img
                  src={current.src}
                  alt={lang === "es" ? "Vista previa de instalación" : "Installation preview"}
                  className="flex-1 min-w-0 h-auto max-h-[85vh] object-contain rounded"
                />
              )}
              {open && open.list.length > 1 && (
                <button
                  onClick={next}
                  aria-label={lang === "es" ? "Siguiente" : "Next"}
                  className="shrink-0 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-cream/20 hover:bg-cream/40 backdrop-blur-sm text-cream flex items-center justify-center transition"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}
            </div>
          )}
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
                onClick={() => setOpen({ list: albumPhotos, index: i })}
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
