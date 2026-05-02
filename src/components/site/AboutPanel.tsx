import { useEffect, useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useLang } from "./LangContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Phone,
  MessageCircle,
  Instagram,
  Facebook,
  MapPin,
  Mail,
  Star,
  ExternalLink,
  Hammer,
  Truck,
  Archive,
  Wrench,
  Loader2,
} from "lucide-react";

// Real Google Place ID for Ramos Delivery Enterprise
// Replace if a different listing should be used.
export const RAMOS_PLACE_ID = "ChIJN1t_tDeuEmsRUsoyG83frY4"; // placeholder — overrideable

const PHONE_DISPLAY = "+1 (786) 426-2444";
const PHONE_TEL = "+17864262444";
const PHONE_WA = "17864262444";
const EMAIL = "ramosdeliverye@gmail.com";
const IG_URL = "https://www.instagram.com/ramos_delivery_enterprise";
const FB_URL = "https://www.facebook.com/share/1P9s1y3cDh/?mibextid=wwXIfr";

type Review = {
  author: string;
  photo: string | null;
  rating: number;
  text: string;
  relative: string;
};

type ReviewsData = {
  name: string | null;
  rating: number | null;
  total: number | null;
  mapsUrl: string | null;
  reviews: Review[];
};

const Stars = ({ value, size = 16 }: { value: number; size?: number }) => {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <div className="inline-flex items-center gap-0.5" aria-label={`${value} de 5`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < full || (i === full && half);
        return (
          <Star
            key={i}
            style={{ width: size, height: size }}
            className={filled ? "fill-[hsl(45,85%,55%)] text-[hsl(45,85%,55%)]" : "text-ink/20"}
          />
        );
      })}
    </div>
  );
};

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  placeId?: string;
}

export const AboutPanel = ({ open, onOpenChange, placeId = RAMOS_PLACE_ID }: Props) => {
  const { lang } = useLang();
  const [data, setData] = useState<ReviewsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || data) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const { data: res, error: err } = await supabase.functions.invoke("google-reviews", {
          body: null,
          method: "GET" as any,
        }).catch(async () => {
          // Fallback: invoke with query string via direct fetch
          const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-reviews?placeId=${encodeURIComponent(placeId)}`;
          const r = await fetch(url, {
            headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
          });
          const j = await r.json();
          return { data: r.ok ? j : null, error: r.ok ? null : j };
        });

        if (cancelled) return;
        if (err || !res) {
          setError(typeof err === "string" ? err : (err as any)?.error || "Error");
        } else {
          setData(res as ReviewsData);
        }
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, placeId, data]);

  // Always do a clean GET with placeId via fetch to avoid invoke quirks
  useEffect(() => {
    if (!open || data) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const base = import.meta.env.VITE_SUPABASE_URL;
        const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        const r = await fetch(`${base}/functions/v1/google-reviews?placeId=${encodeURIComponent(placeId)}`, {
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
          },
        });
        const j = await r.json();
        if (cancelled) return;
        if (!r.ok) setError(j?.error || `HTTP ${r.status}`);
        else setData(j as ReviewsData);
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, placeId]);

  const services = [
    { icon: Hammer, es: "Restauración", en: "Restoration" },
    { icon: Truck, es: "Transporte", en: "Transport" },
    { icon: Archive, es: "Almacenamiento", en: "Storage" },
    { icon: Wrench, es: "Instalación", en: "Installation" },
  ];

  const locations = [
    { city: "Miami", state: "FL" },
    { city: "West Palm Beach", state: "FL" },
    { city: "New York", state: "NY" },
    { city: lang === "es" ? "En crecimiento" : "Expanding", state: lang === "es" ? "otros estados" : "other states" },
  ];

  const mapsUrl = data?.mapsUrl || `https://www.google.com/maps/search/?api=1&query=Ramos+Delivery+Enterprise&query_place_id=${placeId}`;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl md:max-w-2xl bg-cream text-ink overflow-y-auto p-0 border-l border-border"
      >
        {/* Header band */}
        <div className="relative bg-ink text-cream px-6 md:px-10 py-10">
          <div className="absolute inset-0 opacity-[0.08] pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, hsl(45,85%,55%) 0, transparent 40%), radial-gradient(circle at 80% 60%, hsl(0,70%,45%) 0, transparent 45%)",
            }}
          />
          <div className="relative">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[hsl(45,85%,65%)]">
              Ramos · Delivery Enterprise
            </span>
            <h2 className="mt-3 font-display text-3xl md:text-4xl leading-tight">
              {lang === "es" ? "¿Quiénes somos?" : "Who we are"}
            </h2>
            <p className="mt-2 italic text-cream/70 text-sm">
              {lang === "es"
                ? "Somos más que transporte, somos confianza."
                : "More than transport — we are trust."}
            </p>
          </div>
        </div>

        <div className="px-6 md:px-10 py-8 space-y-10">
          {/* Description */}
          <p className="text-ink/80 leading-relaxed text-[15px]">
            {lang === "es"
              ? "Somos una empresa radicada en el sur de la Florida, con sucursales en West Palm Beach, New York y en crecimiento en otros estados. Nos dedicamos a restaurar, transportar, almacenar e instalar arte con profesionalismo, precisión y cuidado. Contamos con excelentes reseñas en Google, donde nuestros clientes comparten sus experiencias y opiniones reales sobre nuestro servicio."
              : "Based in South Florida with branches in West Palm Beach, New York and expanding to other states, we restore, transport, store and install fine art with professionalism, precision and care. Our work is backed by excellent reviews from real clients on Google."}
          </p>

          {/* Services */}
          <section>
            <h3 className="text-xs uppercase tracking-[0.25em] text-clay mb-4 font-medium">
              {lang === "es" ? "Servicios" : "Services"}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {services.map((s) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.es}
                    className="flex items-center gap-3 rounded-md border border-border bg-card/60 px-4 py-3 hover:border-clay/50 transition"
                  >
                    <div className="h-9 w-9 rounded-full bg-ink text-cream flex items-center justify-center">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">{lang === "es" ? s.es : s.en}</span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Locations */}
          <section>
            <h3 className="text-xs uppercase tracking-[0.25em] text-clay mb-4 font-medium">
              {lang === "es" ? "Ubicaciones" : "Locations"}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {locations.map((l) => (
                <div key={l.city} className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-clay mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium leading-tight">{l.city}</div>
                    <div className="text-ink/55 text-xs">{l.state}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Google Reviews */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs uppercase tracking-[0.25em] text-clay font-medium">Google Reviews</h3>
              <span className="text-[10px] uppercase tracking-wider text-ink/45">
                {lang === "es" ? "Sincronizado con Google" : "Synced with Google"}
              </span>
            </div>

            <div className="rounded-lg border border-border bg-gradient-to-br from-cream to-card/40 p-5">
              {loading && (
                <div className="flex items-center gap-2 text-ink/60 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {lang === "es" ? "Cargando reseñas reales…" : "Loading live reviews…"}
                </div>
              )}

              {!loading && error && (
                <div className="text-sm text-ink/70">
                  {lang === "es"
                    ? "No se pudieron cargar las reseñas en este momento."
                    : "Could not load reviews right now."}
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 underline text-clay"
                  >
                    {lang === "es" ? "Ver en Google" : "View on Google"}
                  </a>
                </div>
              )}

              {!loading && !error && data && (
                <>
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-display leading-none">
                      {data.rating?.toFixed(1) ?? "—"}
                    </div>
                    <div>
                      <Stars value={data.rating ?? 0} size={18} />
                      <div className="text-xs text-ink/60 mt-1">
                        {data.total ?? 0} {lang === "es" ? "reseñas en Google" : "Google reviews"}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3 max-h-72 overflow-y-auto pr-1">
                    {data.reviews.length === 0 && (
                      <p className="text-sm text-ink/60">
                        {lang === "es" ? "Aún no hay reseñas visibles." : "No reviews available yet."}
                      </p>
                    )}
                    {data.reviews.map((r, i) => (
                      <div key={i} className="rounded-md bg-cream border border-border/70 p-3">
                        <div className="flex items-center gap-2">
                          {r.photo ? (
                            <img src={r.photo} alt={r.author} className="h-7 w-7 rounded-full object-cover" loading="lazy" />
                          ) : (
                            <div className="h-7 w-7 rounded-full bg-ink/10 flex items-center justify-center text-[10px] font-medium">
                              {r.author?.[0] ?? "?"}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{r.author}</div>
                            <div className="flex items-center gap-2">
                              <Stars value={r.rating} size={12} />
                              <span className="text-[10px] text-ink/50">{r.relative}</span>
                            </div>
                          </div>
                        </div>
                        {r.text && <p className="mt-2 text-sm text-ink/75 leading-relaxed line-clamp-4">{r.text}</p>}
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between text-[11px] text-ink/50">
                    <span>{lang === "es" ? "Reseñas actualizadas automáticamente desde Google" : "Reviews updated automatically from Google"}</span>
                  </div>
                </>
              )}

              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-ink hover:text-clay transition"
              >
                {lang === "es" ? "Ver todas las reseñas en Google" : "View all reviews on Google"}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </section>

          {/* Contact buttons */}
          <section>
            <h3 className="text-xs uppercase tracking-[0.25em] text-clay mb-4 font-medium">
              {lang === "es" ? "Contacto" : "Contact"}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <a href={`tel:${PHONE_TEL}`} className="contact-btn">
                <Phone className="h-4 w-4" /> {lang === "es" ? "Llamar" : "Call"}
              </a>
              <a
                href={`https://wa.me/${PHONE_WA}`}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-btn"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
              <a href={`mailto:${EMAIL}`} className="contact-btn">
                <Mail className="h-4 w-4" /> Email
              </a>
              <a href={IG_URL} target="_blank" rel="noopener noreferrer" className="contact-btn">
                <Instagram className="h-4 w-4" /> Instagram
              </a>
              <a href={FB_URL} target="_blank" rel="noopener noreferrer" className="contact-btn">
                <Facebook className="h-4 w-4" /> Facebook
              </a>
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="contact-btn">
                <MapPin className="h-4 w-4" /> Google
              </a>
            </div>
            <a
              href="#contact"
              onClick={() => onOpenChange(false)}
              className="mt-3 block w-full text-center bg-ink text-cream rounded-full py-3 text-sm hover:bg-ink/90 transition"
            >
              {lang === "es" ? "Formulario de contacto" : "Contact form"}
            </a>
            <div className="mt-3 text-center text-[11px] text-ink/45">{PHONE_DISPLAY}</div>
          </section>
        </div>

        <style>{`
          .contact-btn {
            display: inline-flex; align-items: center; justify-content: center; gap: .5rem;
            font-size: .8rem; font-weight: 500;
            padding: .65rem .75rem;
            border-radius: 9999px;
            border: 1px solid hsl(var(--border));
            background: hsl(var(--card) / .6);
            color: hsl(var(--foreground));
            transition: all .2s ease;
          }
          .contact-btn:hover {
            border-color: hsl(var(--primary, var(--clay, 20 60% 50%)));
            background: hsl(var(--background));
            transform: translateY(-1px);
          }
        `}</style>
      </SheetContent>
    </Sheet>
  );
};
