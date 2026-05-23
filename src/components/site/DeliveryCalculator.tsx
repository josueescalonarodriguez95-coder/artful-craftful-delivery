import { useMemo, useState } from "react";
import { useLang } from "./LangContext";
import { useReveal } from "@/hooks/useReveal";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Check, Info } from "lucide-react";
import { useCart } from "./CartContext";
import { CrateGallery } from "./CrateGallery";
import { computeCratePrice } from "@/lib/pricingEngine";
import foamWhite from "@/assets/foam-white-styrofoam.jpg";
import foamBlackPolylam from "@/assets/foam-black-polylam.jpg";
import foamBlackFirm from "@/assets/foam-black-firm-2in.jpg";

type FoamId = "white-styro-1" | "black-polylam-1" | "black-firm-2";

const FOAM_OPTIONS: {
  id: FoamId;
  image: string;
  price: number;
  name: { es: string; en: string };
  desc: { es: string; en: string };
}[] = [
  {
    id: "white-styro-1",
    image: foamWhite,
    price: 0,
    name: { es: 'Estereofón blanco 1"', en: 'White styrofoam 1"' },
    desc: { es: "Espuma blanca de 1 pulgada", en: "1-inch white foam" },
  },
  {
    id: "black-polylam-1",
    image: foamBlackPolylam,
    price: 80,
    name: { es: 'Polylam negro 1"', en: 'Black polylam 1"' },
    desc: { es: "Polylam foam negro de 1 pulgada", en: "1-inch black polylam foam" },
  },
  {
    id: "black-firm-2",
    image: foamBlackFirm,
    price: 180,
    name: { es: 'Polietileno firme negro 2"', en: 'Firm black polyethylene 2"' },
    desc: { es: "Espuma firme negra de 2 pulgadas", en: "2-inch firm black foam" },
  },
];

export const DeliveryCalculator = () => {
  const { lang } = useLang();
  const { add } = useCart();
  const [height, setHeight] = useState<string>("");
  const [width, setWidth] = useState<string>("");
  const [depth, setDepth] = useState<string>("");
  const [qty, setQty] = useState(1);
  const [foamId, setFoamId] = useState<FoamId>("white-styro-1");
  const ref = useReveal<HTMLDivElement>();

  const hNum = Number(height) || 0;
  const wNum = Number(width) || 0;
  const dNum = Number(depth) || 0;
  const hasDims = hNum > 0 && wNum > 0 && dNum > 0;
  const foam = FOAM_OPTIONS.find((f) => f.id === foamId)!;

  // Foam base (estereofón blanco): +$80 incluido siempre. Las otras opciones
  // suman su delta encima del base. Total foam = 80 + foam.price (delta).
  const breakdown = useMemo(
    () => computeCratePrice({ length: dNum, width: wNum, height: hNum }, 80 + foam.price),
    [hNum, wNum, dNum, foam.price]
  );
  const calc = useMemo(() => {
    const volume = hNum * wNum * dNum;
    const unit = breakdown.finalPrice; // INMUTABLE
    const subtotal = unit * qty;       // suma simple, sin recálculo
    return { volume, unit, subtotal, total: subtotal };
  }, [hNum, wNum, dNum, qty, breakdown]);

  const fmt = (n: number) => `$${n.toFixed(2)}`;


  return (
    <section id="delivery" className="relative py-24 md:py-36 bg-gradient-warm overflow-hidden grain">
      <div className="container relative">
        <div ref={ref} className="reveal max-w-2xl mb-12 md:mb-16">
          <span className="text-xs uppercase tracking-[0.25em] text-clay font-medium">
            {lang === "es" ? "Huacales a medida" : "Custom crates"}
          </span>
          <h2 className="mt-4 font-display text-4xl md:text-6xl text-ink leading-[1.05] text-balance">
            {lang === "es" ? "Diseña tu huacal personalizado." : "Design your custom crate."}
          </h2>
          <p className="mt-5 text-ink/70 max-w-lg">
            {lang === "es"
              ? "Define las medidas exactas en pulgadas. Cuéntanos qué quieres enviar por correo, llamada o mensaje."
              : "Set exact dimensions in inches. Tell us what you'd like to ship by email, call, or text."}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 lg:gap-5 items-stretch">
          {/* Controls */}
          <div className="bg-card rounded-md p-6 md:p-10 pb-10 md:pb-14 shadow-soft border border-border/60 h-full flex flex-col">
            <div className="space-y-8 flex-1">
              {/* Custom dimensions */}
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-ink/60 font-medium">
                  {lang === "es" ? "Medidas del huacal" : "Crate dimensions"}
                </label>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {[
                    { label: lang === "es" ? "Alto" : "Height", value: height, set: setHeight },
                    { label: lang === "es" ? "Ancho" : "Width", value: width, set: setWidth },
                    { label: lang === "es" ? "Profundidad" : "Depth", value: depth, set: setDepth },
                  ].map((f, i) => (
                    <div key={i}>
                      <label className="text-[10px] uppercase tracking-[0.18em] text-ink/55 font-medium">
                        {f.label}
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={200}
                        placeholder="—"
                        value={f.value}
                        onChange={(e) => f.set(e.target.value)}
                        className="mt-1 w-full px-3 py-2 rounded border border-border bg-background text-ink text-sm focus:outline-none focus:border-ink"
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-xs text-ink/55">
                  {lang === "es" ? "Volumen" : "Volume"}: {calc.volume.toLocaleString()} in³
                </div>
              </div>

              {/* Quantity */}
              <div>
                <div className="flex items-baseline justify-between">
                  <label className="text-xs uppercase tracking-[0.2em] text-ink/60 font-medium">
                    {lang === "es" ? "Cantidad de huacales" : "Number of crates"}
                  </label>
                  <span className="font-display text-3xl text-ink">{qty}</span>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="h-10 w-10 rounded-full border border-border hover:bg-ink hover:text-cream transition"
                    aria-label="-"
                  >
                    −
                  </button>
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-clay transition-all duration-500"
                      style={{ width: `${Math.min(100, qty * 10)}%` }}
                    />
                  </div>
                  <button
                    onClick={() => setQty(Math.min(20, qty + 1))}
                    className="h-10 w-10 rounded-full border border-border hover:bg-ink hover:text-cream transition"
                    aria-label="+"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Foam selection */}
              <div>
                <div className="flex items-baseline justify-between">
                  <label className="text-xs uppercase tracking-[0.2em] text-ink/60 font-medium">
                    {lang === "es" ? "Tipo de foam" : "Foam type"}
                  </label>
                  <span className="text-xs text-ink/55">{foam.price > 0 ? `+${fmt(foam.price)}` : (lang === "es" ? "Incluido" : "Included")}</span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {FOAM_OPTIONS.map((f) => {
                    const active = f.id === foamId;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFoamId(f.id)}
                        className={`group relative text-left rounded-md overflow-hidden border transition ${
                          active
                            ? "border-clay ring-2 ring-clay/40"
                            : "border-border hover:border-ink/40"
                        }`}
                      >
                        <div className="aspect-square w-full overflow-hidden bg-secondary">
                          <img
                            src={f.image}
                            alt={f.name[lang]}
                            loading="lazy"
                            width={1024}
                            height={1024}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        {active && (
                          <span className="absolute top-2 right-2 h-6 w-6 rounded-full bg-clay text-cream flex items-center justify-center shadow-soft">
                            <Check className="h-3.5 w-3.5" />
                          </span>
                        )}
                        <div className="p-2.5">
                          <div className="text-[11px] font-medium text-ink leading-tight">
                            {f.name[lang]}
                          </div>
                          <div className="mt-1 text-[11px] tabular-nums text-clay font-medium">
                            {f.price > 0 ? `+$${f.price}` : (lang === "es" ? "Default" : "Default")}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Disclaimer */}
              <div className="flex items-start gap-3 rounded-md border border-clay/20 bg-clay/[0.07] p-4">
                <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-clay-deep text-cream shadow-glow animate-hint-bounce">
                  <Info className="h-3.5 w-3.5" />
                </span>
                <p className="text-[13px] leading-relaxed text-clay-deep">
                  {lang === "es"
                    ? "Cada huacal está sujeto a cambios en el precio final dependiendo de la dificultad del trabajo, materiales adicionales o requerimientos especiales."
                    : "Each crate is subject to final price changes depending on the difficulty of the build, additional materials, or special requirements."}
                </p>
              </div>

            </div>
          </div>

          {/* Breakdown */}
          <div className="lg:max-w-md lg:ml-auto w-full">
            <div className="bg-ink text-cream rounded-md p-6 md:p-7 shadow-elegant">
              <div className="text-xs uppercase tracking-[0.2em] text-cream/60 font-medium">
                {lang === "es" ? "Desglose" : "Breakdown"}
              </div>
              <div className="mt-6 space-y-3 text-sm">
                <Row
                  label={`${lang === "es" ? "Huacal" : "Crate"} (${height}×${width}×${depth} in)`}
                  value={fmt(calc.unit)}
                />
                <Row label={lang === "es" ? "Cantidad" : "Quantity"} value={`× ${qty}`} />
                <Row label={lang === "es" ? "Subtotal" : "Subtotal"} value={fmt(calc.subtotal)} />
              </div>
              <div className="mt-6 pt-6 border-t border-cream/20 flex items-end justify-between">
                <span className="text-xs uppercase tracking-[0.2em] text-cream/60">
                  {lang === "es" ? "Total" : "Total"}
                </span>
                <span className="font-display text-5xl tabular-nums">${calc.total.toFixed(2)}</span>
              </div>
              <Button
                onClick={() => {
                  if (!hasDims || calc.total <= 0) return;
                  const dims = `${hNum}×${wNum}×${dNum} in`;
                  // finalPrice ya viene del Pricing Engine — INMUTABLE.
                  add({
                    type: "crate",
                    title: lang === "es" ? `Huacal a medida (${dims})` : `Custom crate (${dims})`,
                    details: `${qty}u · ${foam.name[lang]}`,
                    qty,
                    unitPrice: breakdown.finalPrice,
                  });
                }}
                disabled={!hasDims}
                className="mt-5 w-full bg-clay hover:bg-clay/90 text-cream rounded-full"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {lang === "es" ? "Agregar al carrito" : "Add to cart"}
              </Button>
            </div>

            <CrateGallery />
          </div>
        </div>
      </div>
    </section>
  );
};

const Row = ({ label, value, accent }: { label: string; value: string; accent?: boolean }) => (
  <div className="flex items-baseline justify-between gap-4">
    <span className="text-cream/70">{label}</span>
    <span className={`tabular-nums ${accent ? "text-clay font-medium" : ""}`}>{value}</span>
  </div>
);
