import { useLang } from "./LangContext";
import { useReveal } from "@/hooks/useReveal";
import { ShieldCheck, Thermometer, Lock } from "lucide-react";
import storageImg from "@/assets/storage-facility.png.asset.json";

export const FineArtStorage = () => {
  const { lang } = useLang();
  const ref = useReveal<HTMLDivElement>();

  return (
    <section id="storage" className="relative py-24 md:py-36 bg-cream">
      <div className="container">
        <div ref={ref} className="reveal max-w-2xl mb-12 md:mb-16">
          <span className="text-xs uppercase tracking-[0.25em] text-clay font-medium">
            {lang === "es" ? "Almacenamiento" : "Storage"}
          </span>
          <h2 className="mt-4 font-display text-4xl md:text-6xl text-ink leading-[1.05] text-balance">
            {lang === "es" ? "Almacenamiento de bellas artes." : "Fine art storage."}
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="rounded-md overflow-hidden border border-border/70 shadow-soft">
            <img
              src={storageImg}
              alt={lang === "es" ? "Instalación de almacenamiento de bellas artes con clima controlado" : "Climate-controlled fine art storage facility"}
              loading="lazy"
              width={1600}
              height={1024}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-6">
            <p className="text-ink/80 text-lg leading-relaxed">
              {lang === "es"
                ? "Ofrecemos servicios gestionados de almacenamiento de bellas artes para obras de arte de alto valor, antigüedades y colecciones personales en nuestras instalaciones con clima controlado."
                : "We offer managed fine art storage services for high-value artworks, antiques and personal collections in our climate-controlled facilities."}
            </p>
            <p className="text-ink/70 leading-relaxed">
              {lang === "es"
                ? "Nuestras instalaciones de almacenamiento de bellas artes han sido diseñadas para proporcionar un entorno altamente seguro para la protección de las obras de arte sensibles y valiosas."
                : "Our fine art storage facilities are designed to provide a highly secure environment for the protection of sensitive and valuable artworks."}
            </p>

            <div className="grid sm:grid-cols-3 gap-4 pt-4">
              <div className="rounded-md border border-border/70 bg-card p-4">
                <Thermometer className="h-5 w-5 text-clay mb-2" />
                <div className="text-sm font-medium text-ink">
                  {lang === "es" ? "Clima controlado" : "Climate controlled"}
                </div>
              </div>
              <div className="rounded-md border border-border/70 bg-card p-4">
                <ShieldCheck className="h-5 w-5 text-clay mb-2" />
                <div className="text-sm font-medium text-ink">
                  {lang === "es" ? "Alta seguridad" : "High security"}
                </div>
              </div>
              <div className="rounded-md border border-border/70 bg-card p-4">
                <Lock className="h-5 w-5 text-clay mb-2" />
                <div className="text-sm font-medium text-ink">
                  {lang === "es" ? "Acceso restringido" : "Restricted access"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
