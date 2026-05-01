import { useMemo, useState } from "react";
import { useLang } from "./LangContext";
import { t } from "@/i18n/translations";
import { useReveal } from "@/hooks/useReveal";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type ZoneKey = "A" | "B" | "C" | "D";

const ZONES: Record<ZoneKey, { es: string; en: string; base: number; included: number; perMile: number }> = {
  A: { es: "Zona A · Local (0–10 mi)", en: "Zone A · Local (0–10 mi)", base: 45, included: 10, perMile: 2.5 },
  B: { es: "Zona B · Metro (10–25 mi)", en: "Zone B · Metro (10–25 mi)", base: 85, included: 25, perMile: 2.25 },
  C: { es: "Zona C · Regional (25–75 mi)", en: "Zone C · Regional (25–75 mi)", base: 165, included: 75, perMile: 1.95 },
  D: { es: "Zona D · Larga distancia (75+ mi)", en: "Zone D · Long haul (75+ mi)", base: 295, included: 150, perMile: 1.65 },
};

const PIECE_FEE = 18;
const FRAGILE_PCT = 0.15;

export const DeliveryCalculator = () => {
  const { lang } = useLang();
  const [zone, setZone] = useState<ZoneKey>("A");
  const [miles, setMiles] = useState(8);
  const [pieces, setPieces] = useState(1);
  const [fragile, setFragile] = useState(false);
  const ref = useReveal<HTMLDivElement>();

  const calc = useMemo(() => {
    const z = ZONES[zone];
    const base = z.base;
    const extraMiles = Math.max(0, miles - z.included);
    const extraMilesCost = extraMiles * z.perMile;
    const extraPiecesCost = Math.max(0, pieces - 1) * PIECE_FEE;
    const subtotal = base + extraMilesCost + extraPiecesCost;
    const fragileFee = fragile ? subtotal * FRAGILE_PCT : 0;
    const total = subtotal + fragileFee;
    return { base, extraMiles, extraMilesCost, extraPiecesCost, fragileFee, total };
  }, [zone, miles, pieces, fragile]);

  const fmt = (n: number) => `$${n.toFixed(2)}`;

  return (
    <section id="delivery" className="relative py-24 md:py-36 bg-gradient-warm overflow-hidden grain">
      <div className="container relative">
        <div ref={ref} className="reveal max-w-2xl mb-12 md:mb-16">
          <span className="text-xs uppercase tracking-[0.25em] text-clay font-medium">{t.delivery.eyebrow[lang]}</span>
          <h2 className="mt-4 font-display text-4xl md:text-6xl text-ink leading-[1.05] text-balance">
            {t.delivery.title[lang]}
          </h2>
          <p className="mt-5 text-ink/70 max-w-lg">{t.delivery.sub[lang]}</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6 lg:gap-10 items-start">
          {/* Controls */}
          <div className="lg:col-span-3 bg-card rounded-md p-6 md:p-10 shadow-soft border border-border/60">
            <div className="space-y-8">
              {/* Zone selector */}
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-ink/60 font-medium">{t.delivery.zone[lang]}</label>
                <div className="mt-3 grid sm:grid-cols-2 gap-2">
                  {(Object.keys(ZONES) as ZoneKey[]).map((k) => (
                    <button
                      key={k}
                      onClick={() => { setZone(k); if (miles < ZONES[k].included * 0.3) setMiles(Math.max(miles, Math.round(ZONES[k].included * 0.5))); }}
                      className={`text-left px-4 py-3 rounded border transition-all duration-300 ${
                        zone === k
                          ? "border-ink bg-ink text-cream shadow-soft"
                          : "border-border bg-background hover:border-ink/40"
                      }`}
                    >
                      <div className="text-sm font-medium">{ZONES[k][lang]}</div>
                      <div className={`text-xs mt-0.5 ${zone === k ? "text-cream/70" : "text-ink/55"}`}>
                        {lang === "es" ? "Base" : "Base"} {fmt(ZONES[k].base)} · {fmt(ZONES[k].perMile)}/mi
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Miles slider */}
              <div>
                <div className="flex items-baseline justify-between">
                  <label className="text-xs uppercase tracking-[0.2em] text-ink/60 font-medium">{t.delivery.miles[lang]}</label>
                  <span className="font-display text-3xl text-ink">{miles} <span className="text-base text-ink/50">mi</span></span>
                </div>
                <Slider
                  value={[miles]}
                  onValueChange={(v) => setMiles(v[0])}
                  min={1}
                  max={400}
                  step={1}
                  className="mt-4"
                />
              </div>

              {/* Pieces */}
              <div>
                <div className="flex items-baseline justify-between">
                  <label className="text-xs uppercase tracking-[0.2em] text-ink/60 font-medium">{t.delivery.pieces[lang]}</label>
                  <span className="font-display text-3xl text-ink">{pieces}</span>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={() => setPieces(Math.max(1, pieces - 1))}
                    className="h-10 w-10 rounded-full border border-border hover:bg-ink hover:text-cream transition"
                    aria-label="-"
                  >−</button>
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-clay transition-all duration-500" style={{ width: `${Math.min(100, pieces * 10)}%` }} />
                  </div>
                  <button
                    onClick={() => setPieces(Math.min(20, pieces + 1))}
                    className="h-10 w-10 rounded-full border border-border hover:bg-ink hover:text-cream transition"
                    aria-label="+"
                  >+</button>
                </div>
              </div>

              {/* Fragile toggle */}
              <div className="flex items-center justify-between p-4 bg-secondary/50 rounded">
                <span className="text-sm text-ink">{t.delivery.fragile[lang]}</span>
                <Switch checked={fragile} onCheckedChange={setFragile} />
              </div>
            </div>
          </div>

          {/* Breakdown */}
          <div className="lg:col-span-2 lg:sticky lg:top-24">
            <div className="bg-ink text-cream rounded-md p-6 md:p-8 shadow-elegant">
              <div className="text-xs uppercase tracking-[0.2em] text-cream/60 font-medium">{t.delivery.breakdown[lang]}</div>
              <div className="mt-6 space-y-3 text-sm">
                <Row label={t.delivery.base[lang]} value={fmt(calc.base)} />
                <Row label={`${t.delivery.extraMiles[lang]} (${calc.extraMiles} mi)`} value={fmt(calc.extraMilesCost)} />
                <Row label={`${t.delivery.extraPieces[lang]} (${Math.max(0, pieces - 1)})`} value={fmt(calc.extraPiecesCost)} />
                {fragile && <Row label={t.delivery.fragileFee[lang]} value={fmt(calc.fragileFee)} accent />}
              </div>
              <div className="mt-6 pt-6 border-t border-cream/20 flex items-end justify-between">
                <span className="text-xs uppercase tracking-[0.2em] text-cream/60">{t.delivery.total[lang]}</span>
                <span className="font-display text-5xl tabular-nums">${calc.total.toFixed(0)}</span>
              </div>
              <Button
                onClick={() => toast.success(lang === "es" ? "Solicitud enviada — te contactaremos." : "Request sent — we'll be in touch.")}
                className="mt-6 w-full bg-cream text-ink hover:bg-clay hover:text-cream rounded-full py-6"
              >
                {t.delivery.request[lang]}
              </Button>
              <p className="mt-4 text-[11px] text-cream/50 leading-relaxed">{t.delivery.note[lang]}</p>
            </div>
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
