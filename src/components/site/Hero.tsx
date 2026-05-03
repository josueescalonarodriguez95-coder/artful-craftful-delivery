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
      </div>

      <div className="relative container pb-16 md:pb-24 pt-32">
        <div className="max-w-2xl -ml-2 md:-ml-6 lg:-ml-10 text-left bg-ink/55 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-cream/15 shadow-2xl">
          <div className="flex items-center gap-3 mb-6 animate-fade-in">
            <span className="h-px w-10 bg-clay origin-left animate-draw-line" />
            <span className="text-xs uppercase tracking-[0.25em] text-cream font-semibold">
              {t.hero.eyebrow[lang]}
            </span>
          </div>
          <p className="mt-6 max-w-xl text-base md:text-lg text-cream font-medium animate-fade-up [animation-delay:200ms]">
            {t.hero.sub[lang]}
          </p>
          <div className="mt-10 flex flex-wrap gap-3 animate-fade-up [animation-delay:400ms]">
            <a
              href="#delivery"
              className="group inline-flex items-center gap-2 bg-cream text-ink px-7 py-3.5 rounded-full text-sm font-medium hover:bg-clay hover:text-cream transition-colors duration-300"
            >
              {t.hero.cta1[lang]}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="#services"
              className="inline-flex items-center gap-2 border border-cream/60 text-cream px-7 py-3.5 rounded-full text-sm font-medium hover:bg-cream hover:text-ink transition-all duration-300"
            >
              {t.hero.cta2[lang]}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
