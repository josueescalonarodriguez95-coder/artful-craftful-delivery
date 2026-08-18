import { useLang } from "./LangContext";
import heroAsset from "@/assets/hero-truck.png.asset.json";


export const Hero = () => {
  const { lang } = useLang();
  return (
    <section id="top" className="relative w-full overflow-hidden bg-cream">
      <picture>
        <img
          src={heroAsset.url}
          alt={lang === "es" ? "Galería de arte con obra enmarcada" : "Art gallery with framed artwork"}
          className="block w-full h-auto max-h-[100svh] object-contain"
          width={1600}
          height={1024}
          loading="eager"
          decoding="async"
        />
      </picture>
    </section>
  );
};
