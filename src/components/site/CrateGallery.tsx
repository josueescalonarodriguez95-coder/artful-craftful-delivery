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
  const [index, setIndex] = useState(0);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const pausedRef = useRef(false);
  const total = images.length;

  useEffect(() => {
    pausedRef.current = openIdx !== null;
  }, [openIdx]);

  useEffect(() => {
    const id = setInterval(() => {
      if (!pausedRef.current) setIndex((i) => i + 1);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  const next = () => setIndex((i) => i + 1);
  const prev = () => setIndex((i) => i - 1);
  const wrap = (i: number) => ((i % total) + total) % total;

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
          className="relative flex-1 max-w-[520px] h-44 sm:h-56 md:h-64 flex items-center justify-center"
          style={{ perspective: "1200px" }}
        >
          {[-1, 0, 1].map((off) => {
            const i = wrap(index + off);
            const isCenter = off === 0;
            return (
              <button
                key={off}
                onClick={() => (isCenter ? setOpenIdx(i) : setIndex(index + off))}
                aria-label={isCenter ? (lang === "es" ? "Ver imagen" : "View image") : undefined}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-out"
                style={{
                  transform: `translate(-50%, -50%) translateX(${off * 38}%) rotateY(${off * -38}deg) scale(${isCenter ? 1 : 0.78})`,
                  zIndex: isCenter ? 10 : 5,
                  opacity: isCenter ? 1 : 0.55,
                  transformStyle: "preserve-3d",
                }}
              >
                <img
                  src={images[i]}
                  alt={`Crate work ${i + 1}`}
                  loading="lazy"
                  className="w-32 h-32 sm:w-44 sm:h-44 md:w-52 md:h-52 object-cover rounded-md shadow-elegant border border-border/60"
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
