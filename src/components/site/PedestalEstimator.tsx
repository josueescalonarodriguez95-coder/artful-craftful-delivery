import { useEffect, useMemo, useState } from "react";
import { useLang } from "./LangContext";
import { t } from "@/i18n/translations";
import { useReveal } from "@/hooks/useReveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type Material = "plywood" | "acrylic" | "marble";
type Finish = "raw" | "paint" | "lacquer" | "white" | "black" | "clear";
type Urgency = "standard" | "rush";
type AcrylicThickness = "1/4" | "1/2" | "1";
type LacquerColor = "black" | "white" | "gold" | "silver";
type PaintColor = "white" | "black" | "gray";

const LACQUER_COLOR: Record<LacquerColor, { es: string; en: string }> = {
  black: { es: "Negro", en: "Black" },
  white: { es: "Blanco", en: "White" },
  gold: { es: "Dorado", en: "Gold" },
  silver: { es: "Plateado", en: "Silver" },
};

const PAINT_COLOR: Record<PaintColor, { es: string; en: string }> = {
  white: { es: "Blanca", en: "White" },
  black: { es: "Negra", en: "Black" },
  gray: { es: "Gris", en: "Gray" },
};

const ACRYLIC_THICKNESS: Record<AcrylicThickness, { es: string; en: string; mult: number }> = {
  "1/4": { es: '1/4 de pulgada', en: '1/4 inch', mult: 1 },
  "1/2": { es: '1/2 pulgada', en: '1/2 inch', mult: 1500 / 700 / 2 + 0.5 / 2 }, // ~1.57, promedio entre 1/4" y 1"
  "1": { es: '1 pulgada', en: '1 inch', mult: 1500 / 700 }, // ~2.143 → 36x14x14 = $1500
};

const MATERIAL: Record<Material, { es: string; en: string; rate: number }> = {
  plywood: { es: 'Plywood natural 3/4"', en: 'Natural plywood 3/4"', rate: 0.022 },
  acrylic: { es: "Acrílico", en: "Acrylic", rate: 0.055 },
  marble: { es: "Mármol", en: "Marble", rate: 0.085 },
};

const FINISH: Record<Finish, { es: string; en: string; mult: number }> = {
  raw: { es: "Natural", en: "Natural", mult: 0 },
  paint: { es: "Pintura mate", en: "Matte paint", mult: 0.18 },
  lacquer: { es: "Laqueado", en: "Lacquered", mult: 0.35 },
  white: { es: "Blanco", en: "White", mult: 0.2 },
  black: { es: "Negro", en: "Black", mult: 0.2 },
  clear: { es: "Transparente", en: "Clear", mult: 0.15 },
};

const MARBLE_FINISHES: Finish[] = ["white", "black"];
const ACRYLIC_FINISHES: Finish[] = ["clear", "black", "white"];
const DEFAULT_FINISHES: Finish[] = ["raw", "paint", "lacquer"];

const SERVICE_BASE = { new: 120 };

export const PedestalEstimator = () => {
  const { lang } = useLang();
  const [h, setH] = useState(36);
  const [w, setW] = useState(14);
  const [d, setD] = useState(14);
  const [material, setMaterial] = useState<Material>("plywood");
  const [finish, setFinish] = useState<Finish>("paint");
  const [acrylicThickness, setAcrylicThickness] = useState<AcrylicThickness>("1/4");
  const [lacquerColor, setLacquerColor] = useState<LacquerColor>("black");
  const [paintColor, setPaintColor] = useState<PaintColor>("white");
  const [qty, setQty] = useState(1);
  const [urgency, setUrgency] = useState<Urgency>("standard");
  const ref = useReveal<HTMLDivElement>();

  const availableFinishes =
    material === "marble" ? MARBLE_FINISHES : material === "acrylic" ? ACRYLIC_FINISHES : DEFAULT_FINISHES;

  useEffect(() => {
    if (!availableFinishes.includes(finish)) {
      setFinish(availableFinishes[0]);
    }
  }, [material, finish, availableFinishes]);

  const calc = useMemo(() => {
    const volume = h * w * d; // cubic inches
    const REF_VOLUME = 36 * 14 * 14; // 7,056 in³
    // Acrylic reference: 36x14x14 @ 1/4" = $700  →  ~$0.0992 per in³
    // Other materials reference: 36x14x14 = $1,200  →  ~$0.17 per in³
    const PRICE_PER_CUIN = material === "acrylic" ? 700 / REF_VOLUME : 1200 / REF_VOLUME;
    let perUnit = volume * PRICE_PER_CUIN;
    // Black marble surcharge (extra labor)
    if (material === "marble" && finish === "black") {
      perUnit += 50;
    }
    // Acrylic thickness multiplier (1/4" is the base price)
    if (material === "acrylic") {
      perUnit *= ACRYLIC_THICKNESS[acrylicThickness].mult;
    }
    if (urgency === "rush") perUnit *= 1.25;
    const total = perUnit * qty;
    return { volume, perUnit, total };
  }, [h, w, d, material, finish, acrylicThickness, qty, urgency]);

  const fmt = (n: number) => `$${n.toFixed(2)}`;

  return (
    <section id="pedestals" className="relative py-24 md:py-36 bg-cream">
      <div className="container">
        <div ref={ref} className="reveal max-w-2xl mb-12 md:mb-16">
          <span className="text-xs uppercase tracking-[0.25em] text-clay font-medium">{t.pedestal.eyebrow[lang]}</span>
          <h2 className="mt-4 font-display text-4xl md:text-6xl text-ink leading-[1.05] text-balance">
            {t.pedestal.title[lang]}
          </h2>
          <p className="mt-5 text-ink/70 max-w-lg">{t.pedestal.sub[lang]}</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6 lg:gap-10 items-start">
          <div className="lg:col-span-3 bg-secondary/40 rounded-md p-6 md:p-10 border border-border/60">
            <div className="space-y-8">
              {/* Dimensions */}
              <Field label={lang === "es" ? "Dimensiones (pulgadas)" : "Dimensions (inches)"}>
                <div className="grid grid-cols-3 gap-3">
                  <Dim label={t.pedestal.height[lang]} value={h} onChange={setH} />
                  <Dim label={t.pedestal.width[lang]} value={w} onChange={setW} />
                  <Dim label={t.pedestal.depth[lang]} value={d} onChange={setD} />
                </div>
              </Field>

              {/* Material */}
              <Field label={t.pedestal.material[lang]}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(Object.keys(MATERIAL) as Material[]).map((m) => (
                    <Choice key={m} active={material === m} onClick={() => setMaterial(m)}>
                      {MATERIAL[m][lang]}
                    </Choice>
                  ))}
                </div>
              </Field>

              {/* Finish */}
              <Field label={t.pedestal.finish[lang]}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {availableFinishes.map((f) => (
                    <Choice key={f} active={finish === f} onClick={() => setFinish(f)}>
                      {FINISH[f][lang]}
                    </Choice>
                  ))}
                </div>
              </Field>

              {/* Lacquer color */}
              {finish === "lacquer" && (
                <Field label={lang === "es" ? "Color del laqueado" : "Lacquer color"}>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(LACQUER_COLOR) as LacquerColor[]).map((c) => (
                      <Choice key={c} active={lacquerColor === c} onClick={() => setLacquerColor(c)}>
                        {LACQUER_COLOR[c][lang]}
                      </Choice>
                    ))}
                  </div>
                </Field>
              )}

              {/* Paint color */}
              {finish === "paint" && (
                <Field label={lang === "es" ? "Color de la pintura" : "Paint color"}>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(PAINT_COLOR) as PaintColor[]).map((c) => (
                      <Choice key={c} active={paintColor === c} onClick={() => setPaintColor(c)}>
                        {PAINT_COLOR[c][lang]}
                      </Choice>
                    ))}
                  </div>
                </Field>
              )}

              {/* Acrylic thickness */}
              {material === "acrylic" && (
                <Field label={lang === "es" ? "Grosor del acrílico" : "Acrylic thickness"}>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(ACRYLIC_THICKNESS) as AcrylicThickness[]).map((tk) => (
                      <Choice key={tk} active={acrylicThickness === tk} onClick={() => setAcrylicThickness(tk)}>
                        {ACRYLIC_THICKNESS[tk][lang]}
                      </Choice>
                    ))}
                  </div>
                </Field>
              )}

              {/* Qty + urgency */}
              <div className="grid sm:grid-cols-2 gap-6">
                <Field label={t.pedestal.qty[lang]}>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setQty(Math.max(1, qty - 1))} className="h-10 w-10 rounded-full border border-border bg-background hover:bg-ink hover:text-cream transition">−</button>
                    <span className="font-display text-3xl tabular-nums w-10 text-center">{qty}</span>
                    <button onClick={() => setQty(Math.min(50, qty + 1))} className="h-10 w-10 rounded-full border border-border bg-background hover:bg-ink hover:text-cream transition">+</button>
                  </div>
                </Field>
                <Field label={t.pedestal.urgency[lang]}>
                  <div className="grid grid-cols-2 gap-2">
                    <Choice active={urgency === "standard"} onClick={() => setUrgency("standard")}>{t.pedestal.standard[lang]}</Choice>
                    <Choice active={urgency === "rush"} onClick={() => setUrgency("rush")}>{t.pedestal.rush[lang]}</Choice>
                  </div>
                </Field>
              </div>
            </div>
          </div>

          {/* Estimate panel */}
          <div className="lg:col-span-2 lg:sticky lg:top-24">
            <div className="bg-clay text-cream rounded-md p-6 md:p-8 shadow-elegant">
              <div className="text-xs uppercase tracking-[0.2em] text-cream/70 font-medium">{t.pedestal.estimate[lang]}</div>
              <div className="mt-6 space-y-3 text-sm">
                <Row label={`${t.pedestal.volume[lang]} (${h}×${w}×${d})`} value={`${calc.volume.toLocaleString()} in³`} />
              </div>

              {/* Resumen de selecciones */}
              <div className="mt-6 pt-6 border-t border-cream/20">
                <div className="text-xs uppercase tracking-[0.2em] text-cream/70 font-medium mb-3">
                  {lang === "es" ? "Resumen de tu selección" : "Your selection summary"}
                </div>
                <ul className="space-y-2 text-sm text-cream/90">
                  <li className="flex justify-between gap-4">
                    <span className="text-cream/70">{lang === "es" ? "Dimensiones" : "Dimensions"}</span>
                    <span className="tabular-nums">{h}×{w}×{d} in</span>
                  </li>
                  <li className="flex justify-between gap-4">
                    <span className="text-cream/70">{t.pedestal.material[lang]}</span>
                    <span>{MATERIAL[material][lang]}</span>
                  </li>
                  <li className="flex justify-between gap-4">
                    <span className="text-cream/70">{t.pedestal.finish[lang]}</span>
                    <span>{FINISH[finish][lang]}{finish === "lacquer" ? ` · ${LACQUER_COLOR[lacquerColor][lang]}` : finish === "paint" ? ` · ${PAINT_COLOR[paintColor][lang]}` : ""}</span>
                  </li>
                  {material === "acrylic" && (
                    <li className="flex justify-between gap-4">
                      <span className="text-cream/70">{lang === "es" ? "Grosor" : "Thickness"}</span>
                      <span>{ACRYLIC_THICKNESS[acrylicThickness][lang]}</span>
                    </li>
                  )}
                  <li className="flex justify-between gap-4">
                    <span className="text-cream/70">{t.pedestal.qty[lang]}</span>
                    <span className="tabular-nums">{qty}</span>
                  </li>
                  <li className="flex justify-between gap-4">
                    <span className="text-cream/70">{t.pedestal.urgency[lang]}</span>
                    <span>{urgency === "standard" ? t.pedestal.standard[lang] : t.pedestal.rush[lang]}</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-6 border-t border-cream/20">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs uppercase tracking-[0.2em] text-cream/70">Total · {qty}u</span>
                  <span className="font-display text-5xl tabular-nums">${calc.total.toFixed(0)}</span>
                </div>
              </div>
              <Button
                onClick={() => toast.success(lang === "es" ? "Cotización enviada — te contactaremos." : "Quote sent — we'll be in touch.")}
                className="mt-6 w-full bg-cream text-ink hover:bg-ink hover:text-cream rounded-full py-6"
              >
                {t.pedestal.request[lang]}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="text-xs uppercase tracking-[0.2em] text-ink/60 font-medium block mb-3">{label}</label>
    {children}
  </div>
);

const Choice = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    className={`px-3 py-2.5 rounded text-sm border transition-all duration-300 ${
      active ? "bg-ink text-cream border-ink shadow-soft" : "bg-background border-border hover:border-ink/40"
    }`}
  >
    {children}
  </button>
);

const Dim = ({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) => {
  const [text, setText] = useState(String(value));

  // Keep local text in sync if parent value changes externally
  useEffect(() => {
    setText((prev) => (Number(prev) === value ? prev : String(value)));
  }, [value]);

  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-ink/50 mb-1.5">{label}</div>
      <Input
        type="number"
        inputMode="numeric"
        value={text}
        min={1}
        max={120}
        onChange={(e) => {
          const v = e.target.value;
          setText(v);
          const n = Number(v);
          if (v !== "" && !Number.isNaN(n) && n >= 1 && n <= 120) {
            onChange(n);
          }
        }}
        onBlur={() => {
          const n = Math.max(1, Math.min(120, Number(text) || 1));
          setText(String(n));
          onChange(n);
        }}
        onFocus={(e) => e.target.select()}
        className="bg-background border-border focus-visible:ring-clay font-display text-xl h-12"
      />
    </div>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-baseline justify-between gap-4">
    <span className="text-cream/80">{label}</span>
    <span className="tabular-nums">{value}</span>
  </div>
);
