import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLang } from "@/components/site/LangContext";
import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { Marquee } from "@/components/site/Marquee";
import { Services } from "@/components/site/Services";
import { DeliveryCalculator } from "@/components/site/DeliveryCalculator";
import { PedestalEstimator } from "@/components/site/PedestalEstimator";
import { FineArtStorage } from "@/components/site/FineArtStorage";
import { ArtInstallation } from "@/components/site/ArtInstallation";
import { ShippingOptions } from "@/components/site/ShippingOptions";
import { Contact } from "@/components/site/Contact";
import { Footer } from "@/components/site/Footer";
import { RevealSection } from "@/components/site/RevealSection";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { ScrollToTop } from "@/components/site/ScrollToTop";

const SEO = () => {
  const { lang } = useLang();
  useEffect(() => {
    document.title = lang === "es"
      ? "Ramos Delivery Enterprise — Fine Art Delivery, Huacales y Pedestales"
      : "Ramos Delivery Enterprise — Fine Art Delivery, Crates & Pedestals";

    const desc = lang === "es"
      ? "Servicio especializado de fine art delivery, fabricación de huacales a medida y construcción de pedestales museísticos."
      : "Specialized fine art delivery, custom crate fabrication and museum-grade pedestal construction.";

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
  const { hash } = useLocation();
  useEffect(() => {
    const allowed = sessionStorage.getItem("rde-scroll-hash");
    if (allowed && hash && allowed === hash) {
      sessionStorage.removeItem("rde-scroll-hash");
      const el = document.querySelector(hash);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
      }
    } else {
      // Cargas directas (bookmark, refresh, link compartido) siempre inician arriba.
      window.scrollTo({ top: 0, behavior: "auto" });
      if (window.location.hash && window.history.replaceState) {
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    }
  }, [hash]);
  return (
    <>
      <SEO />
      <div className="min-h-screen bg-cream text-ink">
        <Nav />
        <main>
          <Hero />
          <RevealSection><Marquee /></RevealSection>
          <RevealSection><Services /></RevealSection>
          <RevealSection><DeliveryCalculator /></RevealSection>
          <RevealSection><PedestalEstimator /></RevealSection>
          <RevealSection><FineArtStorage /></RevealSection>
          <RevealSection><ArtInstallation /></RevealSection>
          <RevealSection><ShippingOptions /></RevealSection>
          <RevealSection><Contact /></RevealSection>
        </main>
        <Footer />
        <WhatsAppFloat />
        <ScrollToTop />
      </div>
    </>
  );
};

export default Index;
