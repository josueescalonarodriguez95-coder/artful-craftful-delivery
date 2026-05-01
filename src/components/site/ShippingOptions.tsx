import { useLang } from "./LangContext";
import { useReveal } from "@/hooks/useReveal";
import { Mail, Phone, MessageSquare } from "lucide-react";

const EMAIL = "ramosdeliverye@gmail.com";
const PHONE_DISPLAY = "+1 (786) 426-2444";
const PHONE_TEL = "+17864262444";

export const ShippingOptions = () => {
  const { lang } = useLang();
  const ref = useReveal<HTMLDivElement>();

  const subject = lang === "es" ? "Consulta de envío" : "Shipping inquiry";
  const body =
    lang === "es"
      ? "Hola, quiero coordinar un envío. Detalles de la pieza:"
      : "Hi, I'd like to coordinate a shipment. Item details:";

  return (
    <section id="shipping" className="relative py-24 md:py-36 bg-cream">
      <div className="container">
        <div ref={ref} className="reveal max-w-2xl mb-12 md:mb-16">
          <span className="text-xs uppercase tracking-[0.25em] text-clay font-medium">
            {lang === "es" ? "Opciones de envío" : "Shipping options"}
          </span>
          <h2 className="mt-4 font-display text-4xl md:text-6xl text-ink leading-[1.05] text-balance">
            {lang === "es" ? "Coordina tu envío con nosotros." : "Coordinate your shipment with us."}
          </h2>
          <p className="mt-5 text-ink/70 max-w-lg">
            {lang === "es"
              ? "Escríbenos al correo o contáctanos por teléfono — llamada o mensaje de texto — para especificar lo que quieres enviar."
              : "Email us or reach out by phone — call or text — to tell us what you'd like to ship."}
          </p>
        </div>

        <div className="rounded-md border border-border/70 bg-card p-6 md:p-10 shadow-soft max-w-3xl">
          <div className="grid sm:grid-cols-3 gap-3">
            <a
              href={`mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`}
              className="flex items-center gap-2 px-4 py-3 rounded border border-border bg-background hover:border-ink/40 hover:bg-ink hover:text-cream transition-all duration-300 text-sm"
            >
              <Mail className="h-4 w-4" />
              <span>{lang === "es" ? "Correo" : "Email"}</span>
            </a>
            <a
              href={`tel:${PHONE_TEL}`}
              className="flex items-center gap-2 px-4 py-3 rounded border border-border bg-background hover:border-ink/40 hover:bg-ink hover:text-cream transition-all duration-300 text-sm"
            >
              <Phone className="h-4 w-4" />
              <span>{lang === "es" ? "Llamada" : "Call"}</span>
            </a>
            <a
              href={`sms:${PHONE_TEL}?body=${encodeURIComponent(body)}`}
              className="flex items-center gap-2 px-4 py-3 rounded border border-border bg-background hover:border-ink/40 hover:bg-ink hover:text-cream transition-all duration-300 text-sm"
            >
              <MessageSquare className="h-4 w-4" />
              <span>{lang === "es" ? "Mensaje" : "Text"}</span>
            </a>
          </div>
          <div className="mt-6 text-sm text-ink/70 space-y-2">
            <div>
              <span className="uppercase tracking-[0.18em] text-ink/45 text-xs">Email · </span>
              <a href={`mailto:${EMAIL}`} className="hairline">{EMAIL}</a>
            </div>
            <div>
              <span className="uppercase tracking-[0.18em] text-ink/45 text-xs">
                {lang === "es" ? "Teléfono · " : "Phone · "}
              </span>
              <a href={`tel:${PHONE_TEL}`} className="hairline">{PHONE_DISPLAY}</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
