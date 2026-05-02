import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useLang } from "./LangContext";
import { Button } from "@/components/ui/button";
import { Star, Wrench, Truck, Archive, Hammer, MapPin, ExternalLink, Phone } from "lucide-react";
import truckImg from "@/assets/about-truck.jpg";
import logoRamosPacking from "@/assets/logo-ramos-packing.png";
import logoEmpireArt from "@/assets/logo-empire-art.png";

const GOOGLE_REVIEWS_URL = "https://www.google.com/search?q=Ramos+Delivery+Enterprise+reviews";
const RATING = 5.0;
const TOTAL_REVIEWS = 47;

const reviews = [
  {
    name: "María González",
    when: "hace 2 semanas",
    stars: 5,
    text: "Servicio impecable. Transportaron una escultura delicada desde Miami a New York con un cuidado excepcional. Profesionales, puntuales y muy atentos.",
  },
  {
    name: "Carlos Rivera",
    when: "hace 1 mes",
    stars: 5,
    text: "El equipo de Ramos restauró una pieza de mármol de mi colección. El resultado superó mis expectativas. Verdaderos artesanos.",
  },
  {
    name: "Andrea Pérez",
    when: "hace 2 meses",
    stars: 5,
    text: "La instalación de las obras en mi galería fue precisa y elegante. Excelente comunicación de principio a fin. Muy recomendados.",
  },
];

const services = [
  { icon: Wrench, key: "restore" },
  { icon: Truck, key: "transport" },
  { icon: Archive, key: "store" },
  { icon: Hammer, key: "install" },
];

const locations = [
  "Miami, FL",
  "South Florida",
  "West Palm Beach, FL",
  "New York, NY",
];

export const AboutPanel = ({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) => {
  const { lang } = useLang();
  const tr = (es: string, en: string) => (lang === "es" ? es : en);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-3xl p-0 overflow-y-auto bg-cream border-l-0"
      >
        {/* TOP — dark hero */}
        <section className="relative bg-[hsl(0,0%,7%)] text-white">
          <div className="grid md:grid-cols-2 gap-0">
            <div className="relative p-8 md:p-12 pr-6">
              <div className="absolute left-0 top-12 bottom-12 w-[3px] bg-[hsl(0,75%,50%)] rounded-r" />
              <div className="pl-5">
                <p className="text-[11px] tracking-[0.3em] text-[hsl(0,75%,55%)] font-semibold uppercase mb-4">
                  {tr("¿Quiénes somos nosotros?", "Who we are")}
                </p>
                <h2 className="font-display text-3xl md:text-4xl leading-[1.1] tracking-tight">
                  {tr("Somos más que transporte,", "More than transport,")}
                  <br />
                  <span className="italic text-white/85">{tr("somos confianza.", "we are trust.")}</span>
                </h2>
                <p className="mt-6 text-sm md:text-[15px] leading-relaxed text-white/70">
                  {tr(
                    "Somos una empresa radicada en el sur de la Florida con sucursales en Miami, West Palm Beach, New York, y en crecimiento en otros estados, dedicados a restaurar, transportar, almacenar e instalar arte con profesionalismo, precisión y cuidado. Contamos con excelentes reseñas en Google, donde puedes ver las opiniones reales de nuestros clientes.",
                    "We are a South Florida–based company with branches in Miami, West Palm Beach, New York, and growing in other states. We restore, transport, store and install fine art with professionalism, precision and care."
                  )}
                </p>
              </div>
            </div>
            <div className="relative min-h-[260px] md:min-h-full">
              <img
                src={truckImg}
                alt="Ramos Delivery truck"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-black/10 to-[hsl(0,0%,7%)]/60 md:bg-gradient-to-r md:from-[hsl(0,0%,7%)]/80 md:via-transparent md:to-transparent" />
            </div>
          </div>
        </section>

        {/* MIDDLE — services + locations */}
        <section className="bg-white text-[hsl(0,0%,10%)] px-6 md:px-12 py-12">
        <section className="bg-cream text-ink px-6 md:px-12 py-12">
          {/* Brand logos row */}
          <div className="flex items-center justify-center gap-6 md:gap-10 mb-10 pb-10 border-b border-border">
            <img
              src={logoRamosPacking}
              alt="Ramos Delivery Packing"
              loading="lazy"
              className="h-16 md:h-20 w-auto rounded-full shadow-soft"
            />
            <div className="h-12 w-px bg-border" />
            <img
              src={logoEmpireArt}
              alt="Empire Art Logistics"
              loading="lazy"
              className="h-16 md:h-20 w-auto rounded-full shadow-soft"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            <div>
              <h3 className="text-[11px] tracking-[0.3em] font-bold text-clay uppercase mb-5">
                {tr("Lo que hacemos", "What we do")}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {services.map(({ icon: Icon, key }) => {
                  const labels: Record<string, [string, string]> = {
                    restore: ["Restauramos tu arte", "We restore your art"],
                    transport: ["Transportamos con cuidado", "We transport with care"],
                    store: ["Almacenamos de forma segura", "We store securely"],
                    install: ["Instalamos con precisión", "We install with precision"],
                  };
                  return (
                    <div
                      key={key}
                      className="group rounded-xl border border-border bg-card p-4 hover:shadow-soft hover:border-clay/40 transition"
                    >
                      <div className="h-9 w-9 rounded-lg bg-clay/10 text-clay flex items-center justify-center mb-3">
                        <Icon className="h-4 w-4" />
                      </div>
                      <p className="text-[13px] font-semibold leading-snug uppercase tracking-wide text-ink">
                        {labels[key][lang === "es" ? 0 : 1]}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-[11px] tracking-[0.3em] font-bold text-clay uppercase mb-5">
                {tr("¿Dónde estamos?", "Where we are")}
              </h3>
              <div className="rounded-xl border border-border p-5 bg-card">
                <ul className="space-y-2.5 mb-5">
                  {locations.map((loc) => (
                    <li key={loc} className="flex items-center gap-2.5 text-sm">
                      <MapPin className="h-4 w-4 text-clay shrink-0" />
                      <span className="text-ink">{loc}</span>
                    </li>
                  ))}
                  <li className="flex items-center gap-2.5 text-sm italic text-ink/55">
                    <span className="h-4 w-4 inline-block" />
                    {tr("En crecimiento en otros estados", "Growing in other states")}
                  </li>
                </ul>
                {/* Real US map (continental silhouette) with markers */}
                <div className="relative aspect-[16/10] rounded-lg bg-cream border border-border overflow-hidden">
                  <svg viewBox="0 0 959 593" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
                    <image
                      href="https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Blank_US_Map_%28states_only%29.svg/1280px-Blank_US_Map_%28states_only%29.svg.png"
                      x="0" y="0" width="959" height="593"
                      style={{ filter: "grayscale(1) opacity(0.45) contrast(0.9)" }}
                    />
                    {/* markers — approximate coords on 959x593 US map */}
                    {[
                      { x: 770, y: 510, label: "Miami" },
                      { x: 763, y: 488, label: "WPB" },
                      { x: 815, y: 200, label: "NY" },
                    ].map((m) => (
                      <g key={m.label}>
                        <circle cx={m.x} cy={m.y} r="14" fill="hsl(var(--clay))" opacity="0.18">
                          <animate attributeName="r" values="10;18;10" dur="2.4s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.25;0.05;0.25" dur="2.4s" repeatCount="indefinite" />
                        </circle>
                        <circle cx={m.x} cy={m.y} r="6" fill="hsl(var(--clay))" stroke="white" strokeWidth="2" />
                      </g>
                    ))}
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* REVIEWS */}
        <section className="bg-sand/40 px-6 md:px-12 py-12">
          <div className="rounded-2xl bg-card border border-border shadow-soft p-6 md:p-8">
            <h3 className="font-display text-2xl md:text-3xl text-ink tracking-tight">
              {tr("Nuestros clientes hablan por nosotros", "Our clients speak for us")}
            </h3>

            <div className="mt-5 flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                {/* Google G */}
                <svg viewBox="0 0 48 48" className="h-7 w-7" aria-label="Google">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                <span className="font-display text-3xl text-ink tabular-nums">{RATING.toFixed(1)}</span>
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-[hsl(45,95%,55%)] text-[hsl(45,95%,55%)]" />
                  ))}
                </div>
              </div>
              <span className="text-sm text-ink/60">
                {tr(`${TOTAL_REVIEWS} reseñas en Google`, `${TOTAL_REVIEWS} Google reviews`)}
              </span>
            </div>

            <div className="mt-6 grid md:grid-cols-3 gap-3">
              {reviews.map((r) => (
                <article
                  key={r.name}
                  className="rounded-xl border border-border p-4 bg-cream hover:border-clay/40 hover:shadow-soft transition flex flex-col"
                >
                  <header className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-ink">{r.name}</p>
                      <p className="text-[11px] text-ink/50">{r.when}</p>
                    </div>
                    <div className="flex">
                      {Array.from({ length: r.stars }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-[hsl(45,95%,55%)] text-[hsl(45,95%,55%)]" />
                      ))}
                    </div>
                  </header>
                  <p className="text-[13px] leading-relaxed text-ink/70">{r.text}</p>
                </article>
              ))}
            </div>

            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <Button
                asChild
                className="bg-clay hover:bg-clay-deep text-cream rounded-full px-6 h-11"
              >
                <a href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer">
                  {tr("Ver todas las reseñas en Google", "See all Google reviews")}
                  <ExternalLink className="h-4 w-4 ml-2" />
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-full px-6 h-11 border-border hover:bg-ink hover:text-cream"
                onClick={() => onOpenChange(false)}
              >
                <a href="#contact">
                  <Phone className="h-4 w-4 mr-2" />
                  {tr("Contáctanos", "Contact us")}
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* BOTTOM stripe */}
        <div className="bg-[hsl(0,0%,7%)] text-white py-5 px-6 text-center">
          <p className="text-[11px] md:text-xs tracking-[0.35em] font-semibold uppercase">
            {tr("Cuidamos tu arte", "We care for your art")}
            <span className="text-[hsl(0,75%,55%)] mx-3">·</span>
            {tr("Protegemos tu historia", "We protect your story")}
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};
