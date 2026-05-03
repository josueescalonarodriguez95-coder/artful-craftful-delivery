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
const VISIBLE = 3;
const THUMB = 112; // px (w-28)
const GAP = 12; // gap-3
const STEP = THUMB + GAP;

export const CrateGallery = () => {
  const { lang } = useLang();
  const [index, setIndex] = useState(0);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    pausedRef.current = openIdx !== null;
  }, [openIdx]);

  useEffect(() => {
    const id = setInterval(() => {
      if (!pausedRef.current) setIndex((i) => i + 1);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const next = () => setIndex((i) => i + 1);
  const prev = () => setIndex((i) => i - 1);

  // Build a long extended list so the strip can slide smoothly with a carousel feel.
  // We render images.length * 3 copies and keep index in middle range visually.
  const total = images.length;
  const extended = Array.from({ length: total * 5 }, (_, i) => i % total);
  const offsetBase = total * 2; // start in the middle

  const translate = -(index + offsetBase) * STEP;

  return (
    <div className="mt-10">
      <div className="text-xs uppercase tracking-[0.2em] text-ink/60 font-medium mb-4">
        {lang === "es" ? "Nuestro trabajo" : "Our work"}
      </div>
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={prev}
          aria-label={lang === "es" ? "Anterior" : "Previous"}
          className="shrink-0 h-9 w-9 rounded-full border border-border bg-background hover:bg-ink hover:text-cream transition flex items-center justify-center text-ink"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div
          className="overflow-hidden"
          style={{ width: VISIBLE * THUMB + (VISIBLE - 1) * GAP }}
        >
          <div
            className="flex"
            style={{
              gap: `${GAP}px`,
              transform: `translateX(${translate}px)`,
              transition: "transform 700ms cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            {extended.map((i, pos) => (
              <button
                key={pos}
                onClick={() => setOpenIdx(i)}
                className="relative shrink-0 w-28 h-28 rounded-md overflow-hidden border border-border shadow-soft hover:shadow-elegant hover:scale-105 transition-transform duration-300"
                style={{ width: THUMB, height: THUMB }}
                aria-label={lang === "es" ? "Ver imagen" : "View image"}
              >
                <img
                  src={images[i]}
                  alt={`Crate work ${i + 1}`}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={next}
          aria-label={lang === "es" ? "Siguiente" : "Next"}
          className="shrink-0 h-9 w-9 rounded-full border border-border bg-background hover:bg-ink hover:text-cream transition flex items-center justify-center text-ink"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <Dialog open={openIdx !== null} onOpenChange={(o) => !o && setOpenIdx(null)}>
        <DialogContent className="max-w-4xl p-0 bg-transparent border-0 shadow-none">
          {openIdx !== null && (
            <div className="relative">
              <img
                src={images[openIdx]}
                alt={`Crate work ${openIdx + 1}`}
                className="w-full h-auto max-h-[85vh] object-contain rounded-md"
              />
              <button
                onClick={() => setOpenIdx((i) => (i === null ? i : (i - 1 + images.length) % images.length))}
                aria-label={lang === "es" ? "Anterior" : "Previous"}
                className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-cream/90 hover:bg-cream text-ink flex items-center justify-center shadow-soft"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setOpenIdx((i) => (i === null ? i : (i + 1) % images.length))}
                aria-label={lang === "es" ? "Siguiente" : "Next"}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-cream/90 hover:bg-cream text-ink flex items-center justify-center shadow-soft"
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
