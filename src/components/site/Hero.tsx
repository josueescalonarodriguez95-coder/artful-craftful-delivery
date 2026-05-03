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

    </section>
  );
};
