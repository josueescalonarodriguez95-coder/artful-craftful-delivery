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
import img8 from "@/assets/crate-gallery-8.jpg";
import img9 from "@/assets/crate-gallery-9.jpg";

const images = [img1, img2, img3, img4, img5, img6, img7, img8, img9];

// Premium horizontal carousel with snapping, drag/swipe + momentum, infinite loop.
export const CrateGallery = () => {
  const { lang } = useLang();
  const total = images.length;

  // Single logical list. When we reach the last item, the next step wraps
  // back to the first one (no empty slots beyond the available images).
  const [index, setIndex] = useState(0);
  const [drag, setDrag] = useState(0); // px while dragging
  const [animate, setAnimate] = useState(true);
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef(220); // px width per slot (image + gap)
  const draggingRef = useRef(false);
  const startXRef = useRef(0);
  const lastXRef = useRef(0);
  const lastTRef = useRef(0);
  const velocityRef = useRef(0);
  const pausedRef = useRef(false);

  // Measure slot width responsively
  useEffect(() => {
    const measure = () => {
      const w = containerRef.current?.clientWidth ?? 480;
      // image is ~60% of container width on mobile, capped on desktop
      const imgW = Math.min(260, Math.max(150, w * 0.55));
      const gap = 24;
      slotRef.current = imgW + gap;
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    pausedRef.current = openIdx !== null;
  }, [openIdx]);

  // Autoplay
  useEffect(() => {
    const id = setInterval(() => {
      if (!pausedRef.current && !draggingRef.current) {
        setAnimate(true);
        setIndex((i) => (i + 1) % total);
      }
    }, 4000);
    return () => clearInterval(id);
  }, [total]);

  const goTo = (i: number) => {
    setAnimate(true);
    setIndex(((i % total) + total) % total);
  };
  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  // Pointer handlers — drag with momentum
  const onPointerDown = (e: React.PointerEvent) => {
    draggingRef.current = true;
    startXRef.current = e.clientX;
    lastXRef.current = e.clientX;
    lastTRef.current = performance.now();
    velocityRef.current = 0;
    setAnimate(false);
    pausedRef.current = true;
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const now = performance.now();
    const dt = Math.max(1, now - lastTRef.current);
    velocityRef.current = (e.clientX - lastXRef.current) / dt; // px/ms
    lastXRef.current = e.clientX;
    lastTRef.current = now;
    setDrag(e.clientX - startXRef.current);
  };
  const endDrag = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    const slot = slotRef.current;
    const projected = drag + velocityRef.current * 180;
    const steps = Math.round(-projected / slot);
    setAnimate(true);
    setIndex((i) => (((i + steps) % total) + total) % total);
    setDrag(0);
    pausedRef.current = openIdx !== null;
  };

  const slot = slotRef.current;
  const translatePx = -index * slot + drag;

  const activeDot = index;

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
          className="relative flex-1 max-w-[640px] h-56 sm:h-64 md:h-72 overflow-hidden touch-pan-y select-none cursor-grab active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onPointerLeave={endDrag}
        >
          {/* Track */}
          <div
            className="absolute top-1/2 left-1/2 flex items-center"
            style={{
              transform: `translate3d(calc(-50% + ${translatePx}px + ${slot / 2}px), -50%, 0)`,
              transition: animate
                ? "transform 800ms cubic-bezier(0.22, 1, 0.36, 1)"
                : "none",
              willChange: "transform",
              gap: 0,
            }}
          >
            {Array.from({ length: total }).map((_, i) => {
              const distance = (i * slot) - (index * slot - drag);
              const norm = slot ? distance / slot : 0; // 0 at center
              const abs = Math.min(2, Math.abs(norm));
              const isActive = abs < 0.5;
              const scale = 1 - abs * 0.06; // subtle scale, keep crisp
              const opacity = Math.max(0.85, 1 - abs * 0.08); // keep all bright
              const logical = i % total;
              return (
                <div
                  key={i}
                  className="shrink-0 flex items-center justify-center"
                  style={{ width: slot }}
                >
                  <button
                    onClick={() => {
                      if (Math.abs(drag) > 4) return;
                      setOpenIdx(logical);
                    }}
                    className="block will-change-transform"
                    style={{
                      transform: `scale(${scale})`,
                      opacity,
                      transition: animate
                        ? "transform 800ms cubic-bezier(0.22, 1, 0.36, 1), opacity 800ms ease-in-out"
                        : "none",
                    }}
                    aria-label={isActive ? (lang === "es" ? "Ver imagen" : "View image") : undefined}
                  >
                    <img
                      src={images[logical]}
                      alt={`Crate work ${logical + 1}`}
                      loading="lazy"
                      draggable={false}
                      className="w-40 h-40 sm:w-52 sm:h-52 md:w-60 md:h-60 object-cover rounded-md shadow-elegant border border-border/60 pointer-events-none"
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={next}
          aria-label={lang === "es" ? "Siguiente" : "Next"}
          className="shrink-0 h-9 w-9 rounded-full bg-ink/5 hover:bg-ink/15 backdrop-blur-sm text-ink/70 hover:text-ink transition flex items-center justify-center"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Pagination dots */}
      <div className="mt-5 flex items-center justify-center gap-1.5">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`${lang === "es" ? "Ir a" : "Go to"} ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === activeDot ? "w-6 bg-ink/70" : "w-1.5 bg-ink/25 hover:bg-ink/40"
            }`}
          />
        ))}
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
              <div className="flex-1 min-w-0 max-h-[85vh] overflow-auto rounded-md">
                <img
                  src={images[openIdx]}
                  alt={`Crate work ${openIdx + 1}`}
                  onClick={(e) => {
                    const el = e.currentTarget;
                    el.classList.toggle("scale-[2]");
                  }}
                  className="w-full h-auto max-h-[85vh] object-contain transition-transform duration-300 ease-in-out cursor-zoom-in origin-center"
                />
              </div>
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
