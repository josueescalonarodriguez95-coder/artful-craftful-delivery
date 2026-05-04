import { Link } from "react-router-dom";
import { useLang } from "./LangContext";
import { t } from "@/i18n/translations";
import { useReveal } from "@/hooks/useReveal";
import crates from "@/assets/service-crates.jpg";
import pedestals from "@/assets/service-pedestals.jpg";
import restoration from "@/assets/service-restoration.jpg";
import moving from "@/assets/service-moving.jpg";

export const Services = () => {
  const { lang } = useLang();
  const ref = useReveal<HTMLDivElement>();

  const cards = [
    { img: restoration, ...t.services.items[0], href: "/delivery", external: true },
    { img: crates, ...t.services.items[1], href: "#delivery", external: false },
    { img: pedestals, ...t.services.items[2], href: "#pedestals", external: false },
    {
      img: moving,
      tag: { es: "04 — Mudanzas", en: "04 — Moving" },
      title: { es: "Mudanzas", en: "Moving services" },
      body: {
        es: "Mudanzas de artículos de valor y mudanzas estándar — residenciales y comerciales.",
        en: "Valuables moving and standard moves — residential and commercial.",
      },
      href: "/mudanzas",
      external: true,
    },
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

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {cards.map((c, i) => (
            <ServiceCard
              key={i}
              href={c.href}
              external={c.external}
              delay={i * 120}
              image={c.img}
              tag={c.tag[lang]}
              title={c.title[lang]}
              body={c.body[lang]}
              more={lang === "es" ? "Ver más" : "Learn more"}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const ServiceCard = ({ href, external, delay, image, tag, title, body, more }: { href: string; external: boolean; delay: number; image: string; tag: string; title: string; body: string; more: string }) => {
  const ref = useReveal<HTMLAnchorElement>();
  const className = "reveal group block bg-card rounded-md overflow-hidden shadow-soft hover:shadow-elegant transition-all duration-700";
  const style = { transitionDelay: `${delay}ms` };
  const inner = (
    <>
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
    </>
  );
  if (external) {
    return (
      <Link ref={ref as never} to={href} className={className} style={style}>
        {inner}
      </Link>
    );
  }
  return (
    <a ref={ref} href={href} className={className} style={style}>
      {inner}
    </a>
  );
};

