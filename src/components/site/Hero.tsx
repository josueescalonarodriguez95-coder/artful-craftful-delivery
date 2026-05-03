import { useLang } from "./LangContext";
import { t } from "@/i18n/translations";
import heroImg from "@/assets/hero-truck.jpg";
import { ArrowRight } from "lucide-react";

export const Hero = () => {
  const { lang } = useLang();
  return (
    <section id="top" className="relative min-h-[100svh] flex items-end overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroImg}
          alt={lang === "es" ? "Galería de arte con obra enmarcada" : "Art gallery with framed artwork"}
          className="h-full w-full object-cover animate-slow-pan"
          width={1600}
          height={1024}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-cream/30 via-cream/10 to-cream" />
        <div className="absolute inset-0 bg-gradient-overlay opacity-40" />
      </div>

      <div className="relative container pb-16 md:pb-24 pt-32">
        <div className="max-w-3xl -ml-2 md:-ml-6 lg:-ml-10 text-left">
          <div className="flex items-center gap-3 mb-6 animate-fade-in">
            <span className="h-px w-10 bg-clay origin-left animate-draw-line" />
            <span className="text-xs uppercase tracking-[0.25em] text-ink font-semibold">
              {t.hero.eyebrow[lang]}
            </span>
          </div>
          <p className="mt-6 max-w-xl text-base md:text-lg text-ink font-medium animate-fade-up [animation-delay:200ms]">
            {t.hero.sub[lang]}
          </p>
          <div className="mt-10 flex flex-wrap gap-3 animate-fade-up [animation-delay:400ms]">
            <a
              href="#delivery"
              className="group inline-flex items-center gap-2 bg-ink text-cream px-7 py-3.5 rounded-full text-sm font-medium hover:bg-clay transition-colors duration-300"
            >
              {t.hero.cta1[lang]}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="#services"
              className="inline-flex items-center gap-2 border border-ink/30 text-ink px-7 py-3.5 rounded-full text-sm font-medium hover:bg-ink hover:text-cream transition-all duration-300"
            >
              {t.hero.cta2[lang]}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
