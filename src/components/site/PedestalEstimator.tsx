import { useEffect, useMemo, useState } from "react";
import { useLang } from "./LangContext";
import { t } from "@/i18n/translations";
import { useReveal } from "@/hooks/useReveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type Service = "new" | "restore";
type Material = "mdf" | "pine" | "oak" | "walnut";
type Finish = "raw" | "paint" | "lacquer" | "veneer";
type Urgency = "standard" | "rush";

const MATERIAL: Record<Material, { es: string; en: string; rate: number }> = {
  mdf: { es: "MDF", en: "MDF", rate: 0.012 },
  pine: { es: "Pino", en: "Pine", rate: 0.018 },
  oak: { es: "Roble", en: "Oak", rate: 0.032 },
  walnut: { es: "Nogal", en: "Walnut", rate: 0.048 },
};

const FINISH: Record<Finish, { es: string; en: string; mult: number }> = {
  raw: { es: "Crudo", en: "Raw", mult: 0 },
  paint: { es: "Pintura mate", en: "Matte paint", mult: 0.18 },
  lacquer: { es: "Laca pulida", en: "Polished lacquer", mult: 0.35 },
  veneer: { es: "Chapilla", en: "Veneer", mult: 0.55 },
};

const SERVICE_BASE = { new: 120, restore: 95 };
const RESTORE_DISCOUNT = 0.55; // material discount when restoring

export const PedestalEstimator = () => {
  const { lang } = useLang();
  const [service, setService] = useState<Service>("new");
  const [h, setH] = useState(36);
  const [w, setW] = useState(14);
  const [d, setD] = useState(14);
  const [material, setMaterial] = useState<Material>("pine");
  const [finish, setFinish] = useState<Finish>("paint");
  const [qty, setQty] = useState(1);
  const [urgency, setUrgency] = useState<Urgency>("standard");
  const ref = useReveal<HTMLDivElement>();

  const calc = useMemo(() => {
    const volume = h * w * d; // cubic inches
    const base = SERVICE_BASE[service];
    const matRate = MATERIAL[material].rate * (service === "restore" ? RESTORE_DISCOUNT : 1);
    const materialCost = volume * matRate;
    const finishCost = (base + materialCost) * FINISH[finish].mult;
    const subtotal = base + materialCost + finishCost;
    const rushCost = urgency === "rush" ? subtotal * 0.25 : 0;
    const perUnit = subtotal + rushCost;
    const serviceFee = 150;
    const total = perUnit * qty + serviceFee;
    return { volume, base, materialCost, finishCost, rushCost, perUnit, serviceFee, total };
  }, [service, h, w, d, material, finish, qty, urgency]);

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
              {/* Service */}
              <Field label={t.pedestal.service[lang]}>
                <div className="grid grid-cols-2 gap-2">
                  {(["new", "restore"] as Service[]).map((s) => (
                    <Choice key={s} active={service === s} onClick={() => setService(s)}>
                      {s === "new" ? t.pedestal.new[lang] : t.pedestal.restore[lang]}
                    </Choice>
                  ))}
                </div>
              </Field>

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
                  {(Object.keys(FINISH) as Finish[]).map((f) => (
                    <Choice key={f} active={finish === f} onClick={() => setFinish(f)}>
                      {FINISH[f][lang]}
                    </Choice>
                  ))}
                </div>
              </Field>

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
                <Row label={lang === "es" ? "Base de servicio" : "Service base"} value={fmt(calc.base)} />
                <Row label={t.pedestal.materialCost[lang]} value={fmt(calc.materialCost)} />
                <Row label={t.pedestal.finishCost[lang]} value={fmt(calc.finishCost)} />
                {urgency === "rush" && <Row label={t.pedestal.rushCost[lang]} value={fmt(calc.rushCost)} />}
                <Row label={lang === "es" ? "Cargo de servicio" : "Service fee"} value={fmt(calc.serviceFee)} />
              </div>
              <div className="mt-6 pt-6 border-t border-cream/20">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs uppercase tracking-[0.2em] text-cream/70">{t.pedestal.perUnit[lang]}</span>
                  <span className="font-display text-2xl tabular-nums">${calc.perUnit.toFixed(0)}</span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
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
