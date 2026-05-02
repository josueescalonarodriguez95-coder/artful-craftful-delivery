export type Lang = "es" | "en";

export const t = {
  nav: {
    services: { es: "Servicios", en: "Services" },
    delivery: { es: "Delivery", en: "Delivery" },
    pedestals: { es: "Pedestales", en: "Pedestals" },
    contact: { es: "Contacto", en: "Contact" },
    quote: { es: "Cotizar", en: "Get a Quote" },
  },
  hero: {
    eyebrow: { es: "Fine Art Logistics", en: "Fine Art Logistics" },
    title: {
      es: "Manos expertas para el arte que importa.",
      en: "Expert hands for the art that matters.",
    },
    sub: {
      es: "Professional fine art handler — delivery especializado, huacales a medida y construcción de pedestales, con la precisión que tu obra merece.",
      en: "Professional fine art handler — specialized delivery, custom crates and pedestal construction, with the precision your work deserves.",
    },
    cta1: { es: "Cotizar ahora", en: "Get a quote" },
    cta2: { es: "Ver servicios", en: "Our services" },
  },
  marquee: {
    es: ["Galerías", "Coleccionistas", "Museos", "Estudios", "Subastas", "Diseñadores"],
    en: ["Galleries", "Collectors", "Museums", "Studios", "Auctions", "Designers"],
  },
  services: {
    eyebrow: { es: "Lo que hacemos", en: "What we do" },
    title: {
      es: "Tres servicios. Una sola obsesión: cuidar tu obra.",
      en: "Three services. One obsession: caring for your work.",
    },
    items: [
      {
        tag: { es: "01 — Delivery", en: "01 — Delivery" },
        title: { es: "Fine Art on Delivery", en: "Fine Art on Delivery" },
        body: {
          es: "Transporte climatizado, embalaje protector y manejo certificado puerta a puerta.",
          en: "Climate-controlled transport, protective packing and certified door-to-door handling.",
        },
      },
      {
        tag: { es: "02 — Huacales", en: "02 — Crates" },
        title: { es: "Huacales a medida", en: "Custom crates" },
        body: {
          es: "Diseñamos y construimos huacales de madera para envíos locales e internacionales.",
          en: "We design and build wooden crates for local and international shipping.",
        },
      },
      {
        tag: { es: "03 — Pedestales", en: "03 — Pedestals" },
        title: { es: "Pedestales", en: "Pedestals" },
        body: {
          es: "Fabricación de pedestales museísticos a medida, con acabados finos y precisión museística.",
          en: "Museum-grade custom pedestal fabrication with fine finishes and museum precision.",
        },
      },
    ],
  },
  delivery: {
    eyebrow: { es: "Calculadora de Delivery", en: "Delivery Calculator" },
    title: { es: "Estima tu envío en segundos.", en: "Estimate your shipment in seconds." },
    sub: {
      es: "Selecciona tu zona y cantidad de millas. El sistema desglosa el costo automáticamente.",
      en: "Select your zone and miles. The system breaks down the cost automatically.",
    },
    zone: { es: "Zona", en: "Zone" },
    miles: { es: "Millas totales", en: "Total miles" },
    pieces: { es: "Cantidad de piezas", en: "Number of pieces" },
    fragile: { es: "Manejo extra-frágil (+15%)", en: "Extra-fragile handling (+15%)" },
    breakdown: { es: "Desglose", en: "Breakdown" },
    base: { es: "Tarifa base de zona", en: "Zone base rate" },
    extraMiles: { es: "Millas extra", en: "Extra miles" },
    extraPieces: { es: "Piezas adicionales", en: "Additional pieces" },
    fragileFee: { es: "Recargo frágil", en: "Fragile surcharge" },
    total: { es: "Total estimado", en: "Estimated total" },
    request: { es: "Solicitar este servicio", en: "Request this service" },
    note: {
      es: "* Precios estimados. La cotización final se confirma tras evaluar la obra.",
      en: "* Estimated pricing. Final quote confirmed after assessing the artwork.",
    },
  },
  pedestal: {
    eyebrow: { es: "Cotizador de Pedestales", en: "Pedestal Estimator" },
    title: { es: "Diseña tu pedestal, paso a paso.", en: "Design your pedestal, step by step." },
    sub: {
      es: "Cada selección actualiza tu cotización en tiempo real. Sin sorpresas.",
      en: "Each selection updates your quote in real time. No surprises.",
    },
    service: { es: "Servicio", en: "Service" },
    new: { es: "Pedestal nuevo", en: "New pedestal" },
    restore: { es: "Restauración", en: "Restoration" },
    height: { es: "Alto (in)", en: "Height (in)" },
    width: { es: "Ancho (in)", en: "Width (in)" },
    depth: { es: "Profundidad (in)", en: "Depth (in)" },
    material: { es: "Material", en: "Material" },
    finish: { es: "Acabado", en: "Finish" },
    qty: { es: "Cantidad", en: "Quantity" },
    urgency: { es: "Urgencia", en: "Urgency" },
    standard: { es: "Estándar (2-3 sem)", en: "Standard (2-3 wks)" },
    rush: { es: "Express (1 sem) +25%", en: "Rush (1 wk) +25%" },
    estimate: { es: "Tu estimado", en: "Your estimate" },
    volume: { es: "Volumen", en: "Volume" },
    materialCost: { es: "Material y construcción", en: "Material & build" },
    finishCost: { es: "Acabado", en: "Finish" },
    rushCost: { es: "Recargo express", en: "Rush surcharge" },
    perUnit: { es: "por unidad", en: "per unit" },
    request: { es: "Solicitar esta cotización", en: "Request this quote" },
  },
  contact: {
    eyebrow: { es: "Hablemos", en: "Let's talk" },
    title: { es: "Cuéntanos sobre tu proyecto.", en: "Tell us about your project." },
    name: { es: "Nombre", en: "Name" },
    email: { es: "Email", en: "Email" },
    message: { es: "Mensaje", en: "Message" },
    send: { es: "Enviar mensaje", en: "Send message" },
    sent: { es: "Mensaje recibido — te contactaremos en breve.", en: "Message received — we'll be in touch shortly." },
  },
  footer: {
    rights: { es: "Todos los derechos reservados", en: "All rights reserved" },
    tag: {
      es: "Manejamos arte como manejaríamos el nuestro.",
      en: "We handle art the way we'd handle our own.",
    },
  },
};
