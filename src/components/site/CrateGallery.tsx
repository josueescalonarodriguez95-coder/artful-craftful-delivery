import { useEffect, useState } from "react";
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

export const CrateGallery = () => {
  const { lang } = useLang();
  const [start, setStart] = useState(0);
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  useEffect(() => {
    if (openIdx !== null) return;
    const id = setInterval(() => setStart((s) => (s + 1) % images.length), 3000);
    return () => clearInterval(id);
  }, [openIdx]);

  const next = () => setStart((s) => (s + 1) % images.length);
  const prev = () => setStart((s) => (s - 1 + images.length) % images.length);

  const visible = Array.from({ length: VISIBLE }, (_, i) => (start + i) % images.length);

  return (
    <div className="mt-10">
      <div className="text-xs uppercase tracking-[0.2em] text-ink/60 font-medium mb-4">
        {lang === "es" ? "Nuestro trabajo" : "Our work"}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={prev}
          aria-label={lang === "es" ? "Anterior" : "Previous"}
          className="shrink-0 h-9 w-9 rounded-full border border-border bg-background hover:bg-ink hover:text-cream transition flex items-center justify-center text-ink"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex-1 overflow-hidden">
          <div className="flex gap-3 justify-center">
            {visible.map((i, pos) => (
              <button
                key={`${i}-${start}`}
                onClick={() => setOpenIdx(i)}
                style={{ animationDelay: `${pos * 120}ms` }}
                className="relative shrink-0 w-24 h-24 md:w-28 md:h-28 rounded-md overflow-hidden border border-border shadow-soft hover:shadow-elegant transition-all duration-700 ease-out hover:scale-105 animate-fade-in"
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
            <img
              src={images[openIdx]}
              alt={`Crate work ${openIdx + 1}`}
              className="w-full h-auto max-h-[85vh] object-contain rounded-md"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
