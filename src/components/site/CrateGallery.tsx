import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useLang } from "./LangContext";
import img1 from "@/assets/crate-gallery-1.jpg";
import img2 from "@/assets/crate-gallery-2.jpg";
import img3 from "@/assets/crate-gallery-3.jpg";
import img4 from "@/assets/crate-gallery-4.jpg";
import img5 from "@/assets/crate-gallery-5.jpg";
import img6 from "@/assets/crate-gallery-6.jpg";
import img7 from "@/assets/crate-gallery-7.jpg";

const images = [img1, img2, img3, img4, img5, img6, img7];

export const CrateGallery = () => {
  const { lang } = useLang();
  // index is fractional during drag for fluid motion
  const [index, setIndex] = useState(0);
  const [drag, setDrag] = useState(0); // -1..1 fraction of slot width while dragging
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const pausedRef = useRef(false);
  const draggingRef = useRef(false);
  const startXRef = useRef(0);
  const slotWidthRef = useRef(160);
  const containerRef = useRef<HTMLDivElement>(null);
  const total = images.length;

  useEffect(() => {
    pausedRef.current = openIdx !== null;
  }, [openIdx]);

  useEffect(() => {
    const id = setInterval(() => {
      if (!pausedRef.current && !draggingRef.current) setIndex((i) => i + 1);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  const wrap = (i: number) => ((i % total) + total) % total;
  const next = () => setIndex((i) => i + 1);
  const prev = () => setIndex((i) => i - 1);

  // Pointer / touch handlers for swipe
  const onPointerDown = (e: React.PointerEvent) => {
    draggingRef.current = true;
    startXRef.current = e.clientX;
    slotWidthRef.current = (containerRef.current?.clientWidth ?? 480) * 0.38;
    pausedRef.current = true;
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - startXRef.current;
    const frac = Math.max(-1.5, Math.min(1.5, dx / slotWidthRef.current));
    setDrag(-frac); // dragging right -> previous (negative index shift)
  };
  const endDrag = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (Math.abs(drag) > 0.25) {
      setIndex((i) => i + Math.round(drag));
    }
    setDrag(0);
    pausedRef.current = openIdx !== null;
  };

  // Render a window of 5 slides for smoother flow
  const offsets = [-2, -1, 0, 1, 2];
  const effective = index + drag;

  return (
    <div className="mt-10">
      <div className="text-xs uppercase tracking-[0.2em] text-ink/60 font-medium mb-4 text-center sm:text-left">
        {lang === "es" ? "Nuestro trabajo" : "Our work"}
      </div>

      <div className="flex items-center justify-center gap-2 sm:gap-4">
        <button
          onClick={prev}
          aria-label={lang === "es" ? "Anterior" : "Previous"}
          className="shrink-0 h-9 w-9 rounded-full bg-ink/5 hover:bg-ink/15 backdrop-blur-sm text-ink/70 hover:text-ink transition flex items-center justify-center"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div
          ref={containerRef}
          className="relative flex-1 max-w-[560px] h-48 sm:h-60 md:h-72 flex items-center justify-center touch-pan-y select-none cursor-grab active:cursor-grabbing overflow-hidden"
          style={{ perspective: "1400px" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onPointerLeave={endDrag}
        >
          {offsets.map((baseOff) => {
            const i = wrap(Math.round(effective) + baseOff);
            // off relative to the visual center (fractional)
            const off = (Math.round(effective) + baseOff) - effective;
            const abs = Math.abs(off);
            const isCenter = abs < 0.5;
            return (
              <button
                key={`${baseOff}-${i}`}
                onClick={() => {
                  if (Math.abs(drag) > 0.05) return;
                  if (isCenter) setOpenIdx(i);
                  else setIndex((idx) => idx + Math.round(off === 0 ? 0 : (off > 0 ? -1 : 1)) * 0 + (baseOff));
                }}
                aria-label={isCenter ? (lang === "es" ? "Ver imagen" : "View image") : undefined}
                className="absolute top-1/2 left-1/2 will-change-transform"
                style={{
                  transform: `translate(-50%, -50%) translateX(${off * 42}%) rotateY(${off * -32}deg) scale(${Math.max(0.62, 1 - abs * 0.22)})`,
                  zIndex: 20 - Math.round(abs * 10),
                  opacity: Math.max(0.25, 1 - abs * 0.35),
                  transformStyle: "preserve-3d",
                  transition: draggingRef.current
                    ? "none"
                    : "transform 700ms cubic-bezier(0.22,1,0.36,1), opacity 500ms ease-out",
                  filter: isCenter ? "none" : "blur(0.3px)",
                }}
              >
                <img
                  src={images[i]}
                  alt={`Crate work ${i + 1}`}
                  loading="lazy"
                  draggable={false}
                  className="w-36 h-36 sm:w-48 sm:h-48 md:w-56 md:h-56 object-cover rounded-md shadow-elegant border border-border/60 pointer-events-none"
                />
              </button>
            );
          })}
        </div>

        <button
          onClick={next}
          aria-label={lang === "es" ? "Siguiente" : "Next"}
          className="shrink-0 h-9 w-9 rounded-full bg-ink/5 hover:bg-ink/15 backdrop-blur-sm text-ink/70 hover:text-ink transition flex items-center justify-center"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <Dialog open={openIdx !== null} onOpenChange={(o) => !o && setOpenIdx(null)}>
        <DialogContent className="max-w-5xl p-0 bg-transparent border-0 shadow-none">
          {openIdx !== null && (
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => setOpenIdx((i) => (i === null ? i : (i - 1 + images.length) % images.length))}
                aria-label={lang === "es" ? "Anterior" : "Previous"}
                className="shrink-0 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-cream/20 hover:bg-cream/40 backdrop-blur-sm text-cream flex items-center justify-center transition"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <img
                src={images[openIdx]}
                alt={`Crate work ${openIdx + 1}`}
                className="flex-1 min-w-0 h-auto max-h-[85vh] object-contain rounded-md"
              />
              <button
                onClick={() => setOpenIdx((i) => (i === null ? i : (i + 1) % images.length))}
                aria-label={lang === "es" ? "Siguiente" : "Next"}
                className="shrink-0 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-cream/20 hover:bg-cream/40 backdrop-blur-sm text-cream flex items-center justify-center transition"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
