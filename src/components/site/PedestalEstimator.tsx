import { useEffect, useMemo, useState } from "react";
import { useLang } from "./LangContext";
import { t } from "@/i18n/translations";
import { useReveal } from "@/hooks/useReveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "./CartContext";
import { ShoppingCart, ZoomIn, Box as BoxIcon, Image as ImageIcon } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pedestal3DViewer } from "./Pedestal3DViewer";
import plywoodNatural from "@/assets/pedestal-plywood-natural.jpg";
import plywoodPaintWhite from "@/assets/pedestal-plywood-paint-white.jpg";
import plywoodPaintBlack from "@/assets/pedestal-plywood-paint-black.jpg";
import plywoodPaintGray from "@/assets/pedestal-plywood-paint-gray.jpg";
import plywoodLacquerBlack from "@/assets/pedestal-plywood-lacquer-black.jpg";
import plywoodLacquerWhite from "@/assets/pedestal-plywood-lacquer-white.jpg";
import plywoodLacquerGold from "@/assets/pedestal-plywood-lacquer-gold.jpg";
import plywoodLacquerSilver from "@/assets/pedestal-plywood-lacquer-silver.jpg";
import acrylicClear from "@/assets/pedestal-acrylic-clear.jpg";
import acrylicBlack from "@/assets/pedestal-acrylic-black.jpg";
import acrylicWhite from "@/assets/pedestal-acrylic-white.jpg";
import marbleWhite from "@/assets/pedestal-marble-white.jpg";
import marbleBlack from "@/assets/pedestal-marble-black.jpg";

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
  const [h, setH] = useState<number>(0);
  const [w, setW] = useState<number>(0);
  const [d, setD] = useState<number>(0);
  const [material, setMaterial] = useState<Material>("plywood");
  const [finish, setFinish] = useState<Finish>("paint");
  const [acrylicThickness, setAcrylicThickness] = useState<AcrylicThickness>("1/4");
  const [lacquerColor, setLacquerColor] = useState<LacquerColor>("black");
  const [paintColor, setPaintColor] = useState<PaintColor>("white");
  const [qty, setQty] = useState(1);
  const [urgency, setUrgency] = useState<Urgency>("standard");
  const [previewMode, setPreviewMode] = useState<"select" | "photo" | "3d">("select");
  const { add } = useCart();
  const ref = useReveal<HTMLDivElement>();

  // Choose preview image based on material + finish (+ color when applicable)
  const previewImage = (() => {
    if (material === "marble") {
      return finish === "black" ? marbleBlack : marbleWhite;
    }
    if (material === "acrylic") {
      if (finish === "black") return acrylicBlack;
      if (finish === "white") return acrylicWhite;
      return acrylicClear;
    }
    // plywood
    if (finish === "raw") return plywoodNatural;
    if (finish === "paint") {
      if (paintColor === "black") return plywoodPaintBlack;
      if (paintColor === "gray") return plywoodPaintGray;
      return plywoodPaintWhite;
    }
    if (finish === "lacquer") {
      if (lacquerColor === "white") return plywoodLacquerWhite;
      if (lacquerColor === "gold") return plywoodLacquerGold;
      if (lacquerColor === "silver") return plywoodLacquerSilver;
      return plywoodLacquerBlack;
    }
    return plywoodNatural;
  })();
  const previewKey = `${material}-${finish}-${finish === "lacquer" ? lacquerColor : finish === "paint" ? paintColor : ""}`;

  // Derive 3D viewer color + finish style
  const viewerColor = (() => {
    if (material === "marble") return finish === "black" ? "#1a1a1a" : "#f2efe8";
    if (material === "acrylic") {
      if (finish === "black") return "#181818";
      if (finish === "white") return "#f5f5f2";
      return "#cfe6ea";
    }
    // plywood
    if (finish === "raw") return "#c9a877";
    if (finish === "paint") {
      if (paintColor === "black") return "#1a1a1a";
      if (paintColor === "gray") return "#7a7a78";
      return "#f2efe8";
    }
    if (finish === "lacquer") {
      if (lacquerColor === "white") return "#f5f5f2";
      if (lacquerColor === "gold") return "#c9a44c";
      if (lacquerColor === "silver") return "#bfc2c7";
      return "#0e0e0e";
    }
    return "#c9a877";
  })();
  const viewerFinish: "matte" | "lacquer" | "acrylic" | "marble" | "natural" =
    material === "marble"
      ? "marble"
      : material === "acrylic"
      ? "acrylic"
      : finish === "lacquer"
      ? "lacquer"
      : finish === "raw"
      ? "natural"
      : "matte";

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
    // Reference rates for 36x14x14:
    // - Acrylic 1/4": $700
    // - Plywood + matte paint: $400 (any color)
    // - Plywood + lacquered: $550 ($150 more than matte paint)
    // - Other materials: $1,200
    // - Plywood + natural: $220
    const isPlywoodPaint = material === "plywood" && finish === "paint";
    const isPlywoodLacquer = material === "plywood" && finish === "lacquer";
    const isPlywoodRaw = material === "plywood" && finish === "raw";
    const PRICE_PER_CUIN =
      material === "acrylic"
        ? 700 / REF_VOLUME
        : isPlywoodPaint
        ? 400 / REF_VOLUME
        : isPlywoodLacquer
        ? 550 / REF_VOLUME
        : isPlywoodRaw
        ? 220 / REF_VOLUME
        : 1200 / REF_VOLUME;
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

        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Pedestal preview */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24">
            <div className="bg-secondary/40 rounded-md border border-border/60 overflow-hidden">
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    aria-label={lang === "es" ? "Ampliar vista previa" : "Zoom preview"}
                    className="group relative block w-full aspect-square bg-cream overflow-hidden cursor-zoom-in"
                  >
                    <img
                      key={previewKey}
                      src={previewImage}
                      alt={`${MATERIAL[material][lang]} · ${FINISH[finish][lang]}`}
                      loading="lazy"
                      width={1024}
                      height={1024}
                      className="w-full h-full object-cover animate-fade-in transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-ink/80 text-cream text-[10px] uppercase tracking-[0.18em] px-2.5 py-1 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      <ZoomIn className="h-3 w-3" />
                      {lang === "es" ? "Ampliar" : "Zoom"}
                    </span>
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl p-0 bg-cream border-border/60">
                  <DialogTitle className="sr-only">
                    {`${MATERIAL[material][lang]} · ${FINISH[finish][lang]}`}
                  </DialogTitle>
                  <DialogDescription className="sr-only">
                    {lang === "es"
                      ? "Vista previa ampliada del pedestal con vista 3D interactiva"
                      : "Enlarged pedestal preview with interactive 3D view"}
                  </DialogDescription>
                  <Tabs defaultValue="3d" className="w-full">
                    <div className="flex items-center justify-between gap-4 px-4 pt-4">
                      <div className="text-xs uppercase tracking-[0.2em] text-ink/60">
                        {MATERIAL[material][lang]} · {FINISH[finish][lang]}
                        {finish === "lacquer" ? ` · ${LACQUER_COLOR[lacquerColor][lang]}` : finish === "paint" ? ` · ${PAINT_COLOR[paintColor][lang]}` : ""}
                      </div>
                      <TabsList className="bg-secondary/60">
                        <TabsTrigger value="3d" className="text-xs gap-1.5">
                          <BoxIcon className="h-3.5 w-3.5" />
                          {lang === "es" ? "Vista 3D" : "3D View"}
                        </TabsTrigger>
                        <TabsTrigger value="photo" className="text-xs gap-1.5">
                          <ImageIcon className="h-3.5 w-3.5" />
                          {lang === "es" ? "Foto" : "Photo"}
                        </TabsTrigger>
                      </TabsList>
                    </div>
                    <TabsContent value="3d" className="m-0 p-4 pt-3">
                      <Pedestal3DViewer
                        height={h || 36}
                        width={w || 14}
                        depth={d || 14}
                        color={viewerColor}
                        finish={viewerFinish}
                      />
                      <p className="mt-3 text-center text-xs text-ink/60">
                        {lang === "es"
                          ? "Arrastra con el dedo o el puntero para rotar el pedestal y ver todos sus lados."
                          : "Drag with your finger or pointer to rotate the pedestal and see every side."}
                      </p>
                    </TabsContent>
                    <TabsContent value="photo" className="m-0 p-0">
                      <img
                        src={previewImage}
                        alt={`${MATERIAL[material][lang]} · ${FINISH[finish][lang]}`}
                        width={1024}
                        height={1024}
                        className="w-full h-auto object-contain rounded-b-md"
                      />
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>
              <div className="p-4 border-t border-border/60">
                <div className="text-[11px] uppercase tracking-[0.2em] text-ink/50 mb-1">
                  {lang === "es" ? "Vista previa" : "Preview"}
                </div>
                <div className="font-display text-xl text-ink leading-tight">
                  {MATERIAL[material][lang]}
                </div>
                <div className="text-xs text-ink/60 mt-1">
                  {FINISH[finish][lang]}
                  {finish === "lacquer" ? ` · ${LACQUER_COLOR[lacquerColor][lang]}` : finish === "paint" ? ` · ${PAINT_COLOR[paintColor][lang]}` : ""}
                </div>
                <div className="text-xs text-ink/60 mt-1 tabular-nums">
                  {h || "—"}×{w || "—"}×{d || "—"} in
                </div>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-5 bg-secondary/40 rounded-md p-6 md:p-10 border border-border/60">
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
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
          <div className="lg:col-span-3 lg:sticky lg:top-24">
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
                onClick={() => {
                  if (calc.total <= 0) return;
                  const finishLabel = `${FINISH[finish][lang]}${finish === "lacquer" ? ` · ${LACQUER_COLOR[lacquerColor][lang]}` : finish === "paint" ? ` · ${PAINT_COLOR[paintColor][lang]}` : ""}`;
                  const details = `${h}×${w}×${d} in · ${MATERIAL[material][lang]} · ${finishLabel}${material === "acrylic" ? ` · ${ACRYLIC_THICKNESS[acrylicThickness][lang]}` : ""} · ${urgency === "rush" ? t.pedestal.rush[lang] : t.pedestal.standard[lang]}`;
                  add({
                    type: "pedestal",
                    title: lang === "es" ? "Pedestal a medida" : "Custom pedestal",
                    details,
                    qty,
                    unitPrice: calc.perUnit,
                  });
                }}
                disabled={calc.total <= 0}
                className="mt-6 w-full bg-cream text-ink hover:bg-ink hover:text-cream rounded-full py-6 inline-flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ShoppingCart className="h-4 w-4" />
                {lang === "es" ? "Agregar al carrito" : "Add to cart"}
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
  const [text, setText] = useState(value > 0 ? String(value) : "");

  // Keep local text in sync if parent value changes externally
  useEffect(() => {
    setText((prev) => {
      const prevN = prev === "" ? 0 : Number(prev);
      return prevN === value ? prev : value > 0 ? String(value) : "";
    });
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
        placeholder=""
        onChange={(e) => {
          const v = e.target.value;
          setText(v);
          if (v === "") {
            onChange(0);
            return;
          }
          const n = Number(v);
          if (!Number.isNaN(n) && n >= 0 && n <= 120) {
            onChange(n);
          }
        }}
        onBlur={() => {
          if (text === "") {
            onChange(0);
            return;
          }
          const n = Math.max(0, Math.min(120, Number(text) || 0));
          setText(n > 0 ? String(n) : "");
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
