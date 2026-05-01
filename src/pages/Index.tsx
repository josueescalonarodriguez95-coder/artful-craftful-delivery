import { useEffect } from "react";
import { LangProvider, useLang } from "@/components/site/LangContext";
import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { Marquee } from "@/components/site/Marquee";
import { Services } from "@/components/site/Services";
import { DeliveryCalculator } from "@/components/site/DeliveryCalculator";
import { PedestalEstimator } from "@/components/site/PedestalEstimator";
import { Contact } from "@/components/site/Contact";
import { Footer } from "@/components/site/Footer";

const SEO = () => {
  const { lang } = useLang();
  useEffect(() => {
    document.title = lang === "es"
      ? "Ramos Delivery Enterprise — Fine Art Delivery, Guacales y Pedestales"
      : "Ramos Delivery Enterprise — Fine Art Delivery, Crates & Pedestals";

    const desc = lang === "es"
      ? "Servicio especializado de fine art delivery, fabricación de guacales a medida y restauración de pedestales museísticos."
      : "Specialized fine art delivery, custom crate fabrication and museum-grade pedestal restoration.";

    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", desc);

    document.documentElement.lang = lang;
  }, [lang]);
  return null;
};

const Index = () => {
  return (
    <LangProvider>
      <SEO />
      <div className="min-h-screen bg-cream text-ink">
        <Nav />
        <main>
          <Hero />
          <Marquee />
          <Services />
          <DeliveryCalculator />
          <PedestalEstimator />
          <Contact />
        </main>
        <Footer />
      </div>
    </LangProvider>
  );
};

export default Index;
