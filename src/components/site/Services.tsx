import { useState } from "react";
import { useLang } from "./LangContext";
import { t } from "@/i18n/translations";
import { useReveal } from "@/hooks/useReveal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import crates from "@/assets/service-crates.jpg";
import pedestals from "@/assets/service-pedestals.jpg";
import restoration from "@/assets/service-restoration.jpg";

export type MediaItem =
  | { type: "image"; src: string; alt?: string }
  | { type: "video"; src: string; poster?: string };

// 👇 AQUÍ AGREGAS TUS FOTOS Y VIDEOS POR SERVICIO
// Para imágenes: importa arriba (import miFoto from "@/assets/mi-foto.jpg")
// y agrega { type: "image", src: miFoto, alt: "..." }
// Para videos: { type: "video", src: "/ruta/al/video.mp4", poster: opcional }
const serviceMedia: Record<string, MediaItem[]> = {
  delivery: [],
  crates: [],
  pedestals: [],
};

export const Services = () => {
  const { lang } = useLang();
  const ref = useReveal<HTMLDivElement>();
  const [open, setOpen] = useState<null | { key: string; title: string; body: string }>(null);

  const cards = [
    { key: "delivery", img: restoration, ...t.services.items[0] },
    { key: "crates", img: crates, ...t.services.items[1] },
    { key: "pedestals", img: pedestals, ...t.services.items[2] },
  ];

  return (
    <section id="services" className="relative py-24 md:py-36 bg-cream">
      <div className="container">
        <div ref={ref} className="reveal max-w-2xl mb-16 md:mb-20">
          <span className="text-xs uppercase tracking-[0.25em] text-clay font-medium">{t.services.eyebrow[lang]}</span>
          <h2 className="mt-4 font-display text-4xl md:text-6xl text-ink leading-[1.05] text-balance">
            {t.services.title[lang]}
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {cards.map((c, i) => (
            <ServiceCard
              key={c.key}
              delay={i * 120}
              image={c.img}
              tag={c.tag[lang]}
              title={c.title[lang]}
              body={c.body[lang]}
              more={lang === "es" ? "Ver galería" : "View gallery"}
              onClick={() => setOpen({ key: c.key, title: c.title[lang], body: c.body[lang] })}
            />
          ))}
        </div>
      </div>

      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-w-5xl bg-cream">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl md:text-3xl text-ink">
              {open?.title}
            </DialogTitle>
            <DialogDescription className="text-ink/70">{open?.body}</DialogDescription>
          </DialogHeader>
          <MediaGallery items={open ? serviceMedia[open.key] ?? [] : []} lang={lang} />
        </DialogContent>
      </Dialog>
    </section>
  );
};

const MediaGallery = ({ items, lang }: { items: MediaItem[]; lang: "es" | "en" }) => {
  if (items.length === 0) {
    return (
      <div className="mt-4 rounded-md border border-dashed border-ink/20 bg-secondary/40 p-10 text-center">
        <p className="text-sm text-ink/70">
          {lang === "es"
            ? "Aquí se mostrarán las fotos y videos de este servicio. Agrega tu contenido en src/components/site/Services.tsx → serviceMedia."
            : "Photos and videos for this service will appear here. Add your content in src/components/site/Services.tsx → serviceMedia."}
        </p>
      </div>
    );
  }
  return (
    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((m, i) =>
        m.type === "image" ? (
          <div key={i} className="aspect-[4/3] overflow-hidden rounded-md bg-secondary">
            <img src={m.src} alt={m.alt ?? ""} loading="lazy" className="h-full w-full object-cover" />
          </div>
        ) : (
          <div key={i} className="aspect-[4/3] overflow-hidden rounded-md bg-black">
            <video src={m.src} poster={m.poster} controls className="h-full w-full object-cover" />
          </div>
        )
      )}
    </div>
  );
};

const ServiceCard = ({
  delay,
  image,
  tag,
  title,
  body,
  more,
  onClick,
}: {
  delay: number;
  image: string;
  tag: string;
  title: string;
  body: string;
  more: string;
  onClick: () => void;
}) => {
  const ref = useReveal<HTMLButtonElement>();
  return (
    <button
      ref={ref}
      onClick={onClick}
      type="button"
      className="reveal group block w-full text-left bg-card rounded-md overflow-hidden shadow-soft hover:shadow-elegant transition-all duration-700"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="aspect-[4/5] overflow-hidden bg-secondary">
        <img
          src={image}
          alt={title}
          loading="lazy"
          width={1200}
          height={900}
          className="h-full w-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-[1.06]"
        />
      </div>
      <div className="p-6 md:p-8">
        <span className="text-xs uppercase tracking-[0.2em] text-clay font-medium">{tag}</span>
        <h3 className="mt-3 font-display text-2xl md:text-3xl text-ink">{title}</h3>
        <p className="mt-3 text-sm text-ink/65 leading-relaxed">{body}</p>
        <div className="mt-5 inline-flex items-center gap-2 text-sm text-ink group-hover:text-clay transition-colors">
          <span className="hairline pb-0.5">{more}</span>
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </div>
      </div>
    </button>
  );
};
