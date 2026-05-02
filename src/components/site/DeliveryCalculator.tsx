import { useMemo, useState } from "react";
import { useLang } from "./LangContext";
import { useReveal } from "@/hooks/useReveal";
import { Switch } from "@/components/ui/switch";
import { CrateGallery } from "./CrateGallery";

const FRAGILE_PCT = 0.15;

// Costos de materiales y mano de obra para huacales personalizados
const PLYWOOD_SIZE_IN = 48 * 96; // 4608 in² por plywood (48×96)
const PLYWOOD_COST = 40;          // $40 cada plywood
const STAPLES_COST = 10;          // $10 presilla
const GLUE_COST = 10;             // $10 cola
const LABOR_COST = 25;            // $25/hora (≈1h por huacal)
const FOAM_COST = 34;             // $34 foam
const MARKUP = 3;                 // multiplicador final ×3

export const DeliveryCalculator = () => {
  const { lang } = useLang();
  const [height, setHeight] = useState<string>("");
  const [width, setWidth] = useState<string>("");
  const [depth, setDepth] = useState<string>("");
  const [qty, setQty] = useState(1);
  const [fragile, setFragile] = useState(false);
  const ref = useReveal<HTMLDivElement>();

  const hNum = Number(height) || 0;
  const wNum = Number(width) || 0;
  const dNum = Number(depth) || 0;
  const hasDims = hNum > 0 && wNum > 0 && dNum > 0;

  const calc = useMemo(() => {
    const volume = hNum * wNum * dNum;
    // Área total de las 6 caras del huacal (in²)
    const surface = hasDims ? 2 * (hNum * wNum + hNum * dNum + wNum * dNum) : 0;
    const plywoods = hasDims ? Math.ceil(surface / PLYWOOD_SIZE_IN) : 0;
    const plywoodCost = plywoods * PLYWOOD_COST;
    const materialsAndLabor = plywoodCost + STAPLES_COST + GLUE_COST + LABOR_COST + FOAM_COST;
    const unit = hasDims ? materialsAndLabor * MARKUP : 0;
    const subtotal = unit * qty;
    const fragileFee = fragile ? subtotal * FRAGILE_PCT : 0;
    const total = subtotal + fragileFee;
    return { volume, surface, plywoods, plywoodCost, materialsAndLabor, unit, subtotal, fragileFee, total };
  }, [hNum, wNum, dNum, hasDims, qty, fragile]);

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

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 items-start">
          {/* Controls */}
          <div className="bg-card rounded-md p-6 md:p-10 pb-10 md:pb-14 shadow-soft border border-border/60 lg:min-h-[640px] flex flex-col">
            <div className="space-y-8 flex-1">
              {/* Custom dimensions */}
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-ink/60 font-medium">
                  {lang === "es" ? "Medidas del huacal (in)" : "Crate dimensions (in)"}
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

              {/* Fragile toggle */}
              <div className="flex items-center justify-between p-4 bg-secondary/50 rounded">
                <span className="text-sm text-ink">
                  {lang === "es" ? "Manejo extra-frágil (+15%)" : "Extra-fragile handling (+15%)"}
                </span>
                <Switch checked={fragile} onCheckedChange={setFragile} />
              </div>

            </div>
          </div>

          {/* Breakdown */}
          <div>
            <div className="bg-ink text-cream rounded-md p-6 md:p-8 shadow-elegant">
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
                {fragile && (
                  <Row
                    label={lang === "es" ? "Recargo frágil" : "Fragile surcharge"}
                    value={fmt(calc.fragileFee)}
                    accent
                  />
                )}
              </div>
              <div className="mt-6 pt-6 border-t border-cream/20 flex items-end justify-between">
                <span className="text-xs uppercase tracking-[0.2em] text-cream/60">
                  {lang === "es" ? "Total estimado" : "Estimated total"}
                </span>
                <span className="font-display text-5xl tabular-nums">${calc.total.toFixed(0)}</span>
              </div>
              <p className="mt-6 text-[11px] text-cream/50 leading-relaxed">
                {lang === "es"
                  ? "* Precios estimados. La cotización final se confirma tras evaluar la pieza a empacar."
                  : "* Estimated pricing. Final quote confirmed after assessing the item to be packed."}
              </p>
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
