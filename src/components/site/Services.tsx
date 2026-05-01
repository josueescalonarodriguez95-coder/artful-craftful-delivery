import { useLang } from "./LangContext";
import { t } from "@/i18n/translations";
import { useReveal } from "@/hooks/useReveal";
import crates from "@/assets/service-crates.jpg";
import pedestals from "@/assets/service-pedestals.jpg";
import restoration from "@/assets/service-restoration.jpg";

const images = [
  null, // delivery placeholder text-only? actually use for delivery too
  crates,
  pedestals,
];

export const Services = () => {
  const { lang } = useLang();
  const ref = useReveal<HTMLDivElement>();

  const cards = [
    { img: restoration, ...t.services.items[0] },
    { img: crates, ...t.services.items[1] },
    { img: pedestals, ...t.services.items[2] },
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
                key={i}
                href={i === 0 ? "#delivery" : "#pedestals"}
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

const ServiceCard = ({ href, delay, image, tag, title, body, more }: { href: string; delay: number; image: string; tag: string; title: string; body: string; more: string }) => {
  const ref = useReveal<HTMLAnchorElement>();
  return (
    <a
      ref={ref}
      href={href}
      className="reveal group block bg-card rounded-md overflow-hidden shadow-soft hover:shadow-elegant transition-all duration-700"
      style={{ transitionDelay: `${delay}ms` }}
    >
                <div className="aspect-[4/5] overflow-hidden bg-secondary">
                  <img
                    src={c.img}
                    alt={c.title[lang]}
                    loading="lazy"
                    width={1200}
                    height={900}
                    className="h-full w-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-[1.06]"
                  />
                </div>
                <div className="p-6 md:p-8">
                  <span className="text-xs uppercase tracking-[0.2em] text-clay font-medium">{c.tag[lang]}</span>
                  <h3 className="mt-3 font-display text-2xl md:text-3xl text-ink">{c.title[lang]}</h3>
                  <p className="mt-3 text-sm text-ink/65 leading-relaxed">{c.body[lang]}</p>
                  <div className="mt-5 inline-flex items-center gap-2 text-sm text-ink group-hover:text-clay transition-colors">
                    <span className="hairline pb-0.5">{lang === "es" ? "Ver más" : "Learn more"}</span>
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
};
