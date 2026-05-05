import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useCart } from "./CartContext";
import { useLang } from "./LangContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, CreditCard, Smartphone, DollarSign, Mail, Copy, Wallet, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { StripeEmbeddedCheckout } from "./StripeEmbeddedCheckout";

const CONTACT_EMAIL = "ramosdeliverye@gmail.com";
const ZELLE_EMAIL = "radent86@gmail.com";
const PAYPAL_USERNAME = "ramosdeliverye";
const VENMO_USERNAME = "Rafael-Ramos-23";
const VENMO_URL = `https://venmo.com/${VENMO_USERNAME}`;
const CASHAPP_USERNAME = "ramosdelivery";
const CASHAPP_URL = `https://cash.app/$${CASHAPP_USERNAME}`;

const isMobile = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
const isIOS = () => /iPhone|iPad|iPod/i.test(navigator.userAgent);

/**
 * Try to open a native payment app on mobile via deep link, fallback to web URL.
 * On desktop, just opens the web URL in a new tab.
 */
const openPaymentApp = (deepLink: string, webUrl: string) => {
  if (!isMobile()) {
    window.open(webUrl, "_blank", "noopener,noreferrer");
    return;
  }
  // On iOS, universal links (https://) open the app automatically if installed.
  // Custom schemes (venmo://, cashme://) also work but need fallback.
  const start = Date.now();
  const fallbackTimer = window.setTimeout(() => {
    // If the app didn't take focus, redirect to web.
    if (Date.now() - start < 2500 && !document.hidden) {
      window.location.href = webUrl;
    }
  }, 1200);
  const onVisibility = () => {
    if (document.hidden) window.clearTimeout(fallbackTimer);
  };
  document.addEventListener("visibilitychange", onVisibility, { once: true });
  // Trigger the deep link
  window.location.href = deepLink;
};

export const CartDrawer = () => {
  const { items, remove, total, open, setOpen, clear } = useCart();
  const { lang } = useLang();
  const [payOpen, setPayOpen] = useState(false);
  const [zelleOpen, setZelleOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [cardCheckoutOpen, setCardCheckoutOpen] = useState(false);
  const [checkoutPayload, setCheckoutPayload] = useState<{
    items: Array<{ title: string; details?: string; qty: number; unitPrice: number }>;
    customer: { name: string; email: string; phone?: string; address?: string };
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [pendingMethod, setPendingMethod] = useState<"card" | "paypal" | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });

  const T = {
    title: lang === "es" ? "Tu carrito" : "Your cart",
    empty: lang === "es" ? "Aún no has agregado nada." : "Nothing added yet.",
    total: lang === "es" ? "Total" : "Total",
    checkout: lang === "es" ? "Proceder al pago" : "Proceed to payment",
    each: lang === "es" ? "c/u" : "ea",
    remove: lang === "es" ? "Eliminar" : "Remove",
    payTitle: lang === "es" ? "Elige tu forma de pago" : "Choose your payment method",
    payDesc: lang === "es"
      ? "Selecciona la opción con la que prefieres pagar."
      : "Select the option you prefer to pay with.",
    formTitle: lang === "es" ? "Tus datos" : "Your details",
    formDesc: lang === "es"
      ? "Necesitamos esto para enviarte el invoice."
      : "We need this to send your invoice.",
    name: lang === "es" ? "Nombre completo" : "Full name",
    email: "Email",
    phone: lang === "es" ? "Teléfono" : "Phone",
    address: lang === "es" ? "Dirección" : "Address",
    continue: lang === "es" ? "Continuar al pago" : "Continue to payment",
    processing: lang === "es" ? "Procesando…" : "Processing…",
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(ZELLE_EMAIL);
      toast.success(lang === "es" ? "Correo copiado" : "Email copied");
    } catch {
      toast.error(lang === "es" ? "No se pudo copiar" : "Could not copy");
    }
  };

  const startStripe = (method: "card" | "paypal") => {
    setPendingMethod(method);
    setPayOpen(false);
    setFormOpen(true);
  };

  const sendInvoiceEmails = async () => {
    const idBase = `paypal-${Date.now()}`;
    const baseData = {
      customerName: form.name,
      customerEmail: form.email,
      customerPhone: form.phone,
      customerAddress: form.address,
      items: items.map((i) => ({ title: i.title, details: i.details, qty: i.qty, unitPrice: i.unitPrice })),
      total,
      paymentMethod: "PayPal",
      lang,
    };
    try {
      await Promise.all([
        supabase.functions.invoke("send-transactional-email", {
          body: {
            templateName: "order-invoice",
            recipientEmail: form.email,
            idempotencyKey: `${idBase}-buyer`,
            templateData: { ...baseData, isMerchantCopy: false },
          },
        }),
        supabase.functions.invoke("send-transactional-email", {
          body: {
            templateName: "order-invoice",
            recipientEmail: CONTACT_EMAIL,
            idempotencyKey: `${idBase}-merchant`,
            templateData: { ...baseData, isMerchantCopy: true },
          },
        }),
      ]);
    } catch (e) {
      console.error("invoice send failed", e);
    }
  };

  const submitStripe = async () => {
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
    if (!form.name.trim() || !emailOk) {
      toast.error(lang === "es" ? "Nombre y email válido requeridos" : "Valid name and email required");
      return;
    }
    if (!pendingMethod) return;
    setLoading(true);

    if (pendingMethod === "paypal") {
      // Open PayPal payment URL prefilled to merchant email.
      // The invoice will be sent only after the merchant confirms the payment was received in PayPal.
      const amount = total.toFixed(2);
      const paypalWeb = `https://www.paypal.com/paypalme/${PAYPAL_USERNAME}/${amount}USD`;
      const paypalDeep = `paypal://paypalme/${PAYPAL_USERNAME}/${amount}USD`;
      openPaymentApp(paypalDeep, paypalWeb);
      toast.success(lang === "es" ? "Completa el pago en PayPal. Recibirás el invoice cuando se confirme el pago." : "Complete payment on PayPal. You'll receive the invoice once payment is confirmed.");
      clear();
      setLoading(false);
      setFormOpen(false);
      setOpen(false);
      return;
    }

    // Card: open embedded Stripe checkout inline
    setCheckoutPayload({
      items: items.map((i) => ({ title: i.title, details: i.details, qty: i.qty, unitPrice: i.unitPrice })),
      customer: { ...form },
    });
    setFormOpen(false);
    setCardCheckoutOpen(true);
    setLoading(false);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="bg-cream text-ink w-full sm:max-w-[21rem] flex flex-col">
          <SheetHeader>
            <SheetTitle className="font-display text-3xl text-ink">{T.title}</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto -mx-6 px-6 mt-4 space-y-4">
            {items.length === 0 && (
              <p className="text-ink/60 text-sm py-12 text-center">{T.empty}</p>
            )}
            {items.map((i) => (
              <div key={i.id} className="border border-border/60 rounded p-4 bg-background">
                <div className="flex justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-display text-lg leading-tight text-ink">{i.title}</div>
                    <div className="text-xs text-ink/60 mt-1">{i.details}</div>
                    <div className="text-xs text-ink/50 mt-2 tabular-nums">
                      {i.qty} × ${i.unitPrice.toFixed(2)} {T.each}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="font-display text-lg tabular-nums text-ink">
                      ${(i.qty * i.unitPrice).toFixed(0)}
                    </div>
                    <button
                      onClick={() => remove(i.id)}
                      aria-label={T.remove}
                      className="text-ink/50 hover:text-clay transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border/60 pt-4 mt-4">
            <div className="flex items-baseline justify-between mb-4">
              <span className="text-xs uppercase tracking-[0.2em] text-ink/60">{T.total}</span>
              <span className="font-display text-4xl tabular-nums text-ink">${total.toFixed(0)}</span>
            </div>
            <Button
              disabled={items.length === 0}
              onClick={() => setPayOpen(true)}
              className="w-full bg-ink hover:bg-ink/90 text-cream rounded-full py-6"
            >
              {T.checkout}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent className="bg-cream max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-ink">{T.payTitle}</DialogTitle>
            <DialogDescription className="text-ink/60">{T.payDesc}</DialogDescription>
          </DialogHeader>
          <div className="mt-2 space-y-2">
            <button
              onClick={() => startStripe("card")}
              className="w-full flex items-center gap-3 border border-border/70 rounded-md px-4 py-3 bg-background hover:bg-ink hover:text-cream transition text-left"
            >
              <CreditCard className="h-5 w-5 shrink-0" />
              <span className="text-sm">{lang === "es" ? "Tarjeta de crédito o débito" : "Credit or debit card"}</span>
            </button>
            <button
              onClick={() => startStripe("paypal")}
              className="w-full flex items-center gap-3 border border-border/70 rounded-md px-4 py-3 bg-background hover:bg-ink hover:text-cream transition text-left"
            >
              <Wallet className="h-5 w-5 shrink-0" />
              <span className="text-sm">PayPal</span>
            </button>
            <button
              onClick={() => {
                const amt = total.toFixed(2);
                const venmoDeep = `venmo://paycharge?txn=pay&recipients=${VENMO_USERNAME}&amount=${amt}&note=${encodeURIComponent("Ramos Delivery Order")}`;
                openPaymentApp(venmoDeep, `${VENMO_URL}?txn=pay&amount=${amt}&note=${encodeURIComponent("Ramos Delivery Order")}`);
              }}
              className="w-full flex items-center gap-3 border border-border/70 rounded-md px-4 py-3 bg-background hover:bg-ink hover:text-cream transition text-left"
            >
              <DollarSign className="h-5 w-5 shrink-0" />
              <span className="text-sm">Venmo</span>
            </button>
            <button
              onClick={() => {
                const amt = total.toFixed(2);
                // Cash App deep link: cashme://$username or cashapp://
                const cashDeep = `https://cash.app/$${CASHAPP_USERNAME}/${amt}`;
                openPaymentApp(cashDeep, `${CASHAPP_URL}/${amt}`);
              }}
              className="w-full flex items-center gap-3 border border-border/70 rounded-md px-4 py-3 bg-background hover:bg-ink hover:text-cream transition text-left"
            >
              <DollarSign className="h-5 w-5 shrink-0" />
              <span className="text-sm">Cash App</span>
            </button>
            <button
              onClick={() => { setPayOpen(false); setZelleOpen(true); }}
              className="w-full flex items-center gap-3 border border-border/70 rounded-md px-4 py-3 bg-background hover:bg-ink hover:text-cream transition text-left"
            >
              <Smartphone className="h-5 w-5 shrink-0" />
              <span className="text-sm">Zelle</span>
            </button>
          </div>

          <div className="mt-2 flex items-baseline justify-between text-xs text-ink/60">
            <span className="uppercase tracking-[0.2em]">{T.total}</span>
            <span className="font-display text-xl text-ink tabular-nums">${total.toFixed(0)}</span>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={formOpen} onOpenChange={(v) => { if (!loading) setFormOpen(v); }}>
        <DialogContent className="bg-cream max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-ink">{T.formTitle}</DialogTitle>
            <DialogDescription className="text-ink/60">{T.formDesc}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <Label htmlFor="cn">{T.name} *</Label>
              <Input id="cn" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="ce">{T.email} *</Label>
              <Input id="ce" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="cp">{T.phone}</Label>
              <Input id="cp" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="ca">{T.address}</Label>
              <Input id="ca" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <Button
              disabled={loading}
              onClick={submitStripe}
              className="w-full bg-ink hover:bg-ink/90 text-cream rounded-full py-6 mt-2"
            >
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{T.processing}</> : T.continue}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={zelleOpen} onOpenChange={setZelleOpen}>
        <DialogContent className="bg-cream max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-ink">Zelle</DialogTitle>
            <DialogDescription className="text-ink/60">
              {lang === "es"
                ? "Envía el pago a este correo:"
                : "Send the payment to this email:"}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2 border border-border/70 rounded-md p-3 bg-background flex items-center gap-2">
            <Mail className="h-4 w-4 shrink-0 text-ink/70" />
            <a
              href={`mailto:${ZELLE_EMAIL}`}
              className="text-sm text-ink underline-offset-4 hover:underline truncate"
            >
              {ZELLE_EMAIL}
            </a>
            <button
              onClick={copyEmail}
              className="ml-auto inline-flex items-center gap-1 text-xs px-2 py-1 rounded border border-border/70 hover:bg-ink hover:text-cream transition"
              aria-label={lang === "es" ? "Copiar correo" : "Copy email"}
            >
              <Copy className="h-3.5 w-3.5" />
              {lang === "es" ? "Copiar" : "Copy"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={cardCheckoutOpen} onOpenChange={(v) => { setCardCheckoutOpen(v); if (!v) setCheckoutPayload(null); }}>
        <DialogContent className="bg-cream max-w-2xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-ink">
              {lang === "es" ? "Pago con tarjeta" : "Card payment"}
            </DialogTitle>
            <DialogDescription className="text-ink/60">
              {lang === "es"
                ? "Ingresa los datos de tu tarjeta para completar el pago."
                : "Enter your card details to complete payment."}
            </DialogDescription>
          </DialogHeader>
          {checkoutPayload && (
            <StripeEmbeddedCheckout
              items={checkoutPayload.items}
              customer={checkoutPayload.customer}
              lang={lang}
              returnUrl={`${window.location.origin}/?payment=success&session_id={CHECKOUT_SESSION_ID}`}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
