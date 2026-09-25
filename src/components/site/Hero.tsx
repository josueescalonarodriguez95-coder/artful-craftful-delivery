import { useLang } from "./LangContext";
import heroAsset from "@/assets/hero-truck.png.asset.json";
import heroWideAsset from "@/assets/hero-truck-wide.png.asset.json";


export const Hero = () => {
  const { lang } = useLang();
  return (
    <section id="top" className="relative w-full overflow-hidden bg-cream">
      <picture>
        <source
          media="(min-width: 768px)"
          srcSet={heroWideAsset.url}
          width={1920}
          height={1080}
        />
        <img
          src={heroAsset.url}
          alt={lang === "es" ? "Camión de Ramos Delivery Enterprise en ruta" : "Ramos Delivery Enterprise truck on the road"}
          className="block w-full h-auto max-h-[100svh] object-contain md:max-h-none md:object-cover"
          width={1254}
          height={1254}
          loading="eager"
          decoding="async"
        />
      </picture>
    </section>
  );
};
