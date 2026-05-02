import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (openIdx !== null) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % images.length), 2500);
    return () => clearInterval(id);
  }, [openIdx]);

  const visibleCount = 5;
  const ordered = Array.from({ length: visibleCount }, (_, i) => (index + i) % images.length);

  return (
    <div className="mt-10">
      <div className="text-xs uppercase tracking-[0.2em] text-ink/60 font-medium mb-4">
        {lang === "es" ? "Nuestro trabajo" : "Our work"}
      </div>
      <div className="flex gap-3 overflow-hidden">
        {ordered.map((i) => (
          <button
            key={i}
            onClick={() => setOpenIdx(i)}
            className="relative shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-md overflow-hidden border border-border shadow-soft hover:shadow-elegant transition-all duration-500 hover:scale-105 animate-fade-in"
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
