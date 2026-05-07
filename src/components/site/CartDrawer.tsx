import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useCart } from "./CartContext";
import { useLang } from "./LangContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Copy, Check, CreditCard } from "lucide-react";
import { StripeEmbeddedCheckout } from "./StripeEmbeddedCheckout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ZELLE_EMAIL = "radent86@gmail.com";
const PAYPAL_EMAIL = "duniagonzalez1986@yahoo.com";
const PAYPAL_LINK = `https://www.paypal.com/paypalme/`;
const VENMO_USERNAME = "@Rafael-Ramos-23";
const VENMO_LINK = `https://venmo.com/u/Rafael-Ramos-23`;

type Method = null | "card" | "zelle" | "paypal" | "venmo";

export const CartDrawer = () => {
  const { items, remove, total, open, setOpen, clear } = useCart();
  const { lang } = useLang();
  const { toast } = useToast();
  const [method, setMethod] = useState<Method>(null);
  const [copied, setCopied] = useState<string>("");
  const [txId, setTxId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const T = {
    title: lang === "es" ? "Tu carrito" : "Your cart",
    empty: lang === "es" ? "Aún no has agregado nada." : "Nothing added yet.",
    total: lang === "es" ? "Total" : "Total",
    checkout: lang === "es" ? "Proceder al pago" : "Proceed to payment",
    each: lang === "es" ? "c/u" : "ea",
    remove: lang === "es" ? "Eliminar" : "Remove",
    choose: lang === "es" ? "Elige un método de pago" : "Choose a payment method",
    card: lang === "es" ? "Tarjeta / Apple Pay / Google Pay" : "Card / Apple Pay / Google Pay",
    zelle: "Pay with Zelle",
    paypal: "Pay with PayPal",
    venmo: "Pay with Venmo",
    openVenmo: lang === "es" ? "Abrir Venmo" : "Open Venmo",
    instructions: lang === "es" ? "Instrucciones de pago" : "Payment instructions",
    sendTo: lang === "es" ? "Envía el pago a:" : "Send payment to:",
    copy: lang === "es" ? "Copiar" : "Copy",
    copied: lang === "es" ? "Copiado" : "Copied",
    afterPay: lang === "es" ? "Después de pagar, completa los datos:" : "After paying, fill in the details:",
    name: lang === "es" ? "Nombre completo" : "Full name",
    email: lang === "es" ? "Correo electrónico" : "Email",
    phone: lang === "es" ? "Teléfono" : "Phone",
    txId: lang === "es" ? "ID o número de confirmación de la transacción" : "Transaction ID / confirmation number",
    submit: lang === "es" ? "Enviar comprobante" : "Submit confirmation",
    pending: lang === "es"
      ? "Pedido recibido — Pendiente de verificación de pago. Te contactaremos al confirmar."
      : "Order received — Pending payment verification. We will contact you once confirmed.",
    back: lang === "es" ? "← Cambiar método" : "← Change method",
    amount: lang === "es" ? "Monto a pagar" : "Amount to pay",
    payTitle: lang === "es" ? "Pago" : "Payment",
    payDesc: lang === "es" ? "Selecciona cómo deseas pagar." : "Select how you want to pay.",
  };

  const reset = () => {
    setMethod(null);
    setTxId("");
    setName("");
    setEmail("");
    setPhone("");
  };

  const closeDialog = () => {
    reset();
  };

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 1500);
  };

  const submitManual = async () => {
    if (!txId.trim()) {
      toast({ title: lang === "es" ? "Falta el ID de transacción" : "Missing transaction ID", variant: "destructive" });
      return;
    }
    if (!name.trim() || !email.trim()) {
      toast({ title: lang === "es" ? "Nombre y correo son requeridos" : "Name and email are required", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("create-manual-order", {
        body: {
          method,
          transactionId: txId.trim(),
          amount: total,
          customer: { name, email, phone },
          items: items.map((i) => ({
            title: i.title,
            details: i.details,
            qty: i.qty,
            unitPrice: i.unitPrice,
          })),
          lang,
        },
      });
      if (error) throw error;
      toast({ title: T.pending });
      clear();
      reset();
      setOpen(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error";
      toast({ title: msg, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const dialogOpen = method !== null;

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
                      ${(i.qty * i.unitPrice).toFixed(2)}
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

          <div className="border-t border-border/60 pt-4 mt-4 space-y-2">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-xs uppercase tracking-[0.2em] text-ink/60">{T.total}</span>
              <span className="font-display text-4xl tabular-nums text-ink">${total.toFixed(0)}</span>
            </div>
            <Button
              disabled={items.length === 0}
              onClick={() => setMethod("card")}
              className="w-full bg-ink hover:bg-ink/90 text-cream rounded-full py-5"
            >
              <CreditCard className="h-4 w-4 mr-2" /> {T.card}
            </Button>
            <Button
              disabled={items.length === 0}
              onClick={() => setMethod("zelle")}
              variant="outline"
              className="w-full rounded-full py-5 border-ink/30"
            >
              {T.zelle}
            </Button>
            <Button
              disabled={items.length === 0}
              onClick={() => setMethod("paypal")}
              variant="outline"
              className="w-full rounded-full py-5 border-ink/30"
            >
              {T.paypal}
            </Button>
            <Button
              disabled={items.length === 0}
              onClick={() => setMethod("venmo")}
              variant="outline"
              className="w-full rounded-full py-5 border-ink/30"
            >
              {T.venmo}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={dialogOpen} onOpenChange={(v) => { if (!v) closeDialog(); }}>
        <DialogContent className="bg-cream max-w-2xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-ink">{T.payTitle}</DialogTitle>
            <DialogDescription className="text-ink/60">{T.payDesc}</DialogDescription>
          </DialogHeader>

          {method === "card" && items.length > 0 && (
            <StripeEmbeddedCheckout
              items={items.map((i) => ({
                title: i.title,
                details: i.details,
                qty: i.qty,
                unitPrice: i.unitPrice,
              }))}
              lang={lang}
              returnUrl={`${window.location.origin}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`}
            />
          )}

          {(method === "zelle" || method === "paypal" || method === "venmo") && (() => {
            const handle =
              method === "zelle" ? ZELLE_EMAIL : method === "paypal" ? PAYPAL_EMAIL : VENMO_USERNAME;
            const externalLink =
              method === "paypal" ? PAYPAL_LINK : method === "venmo" ? VENMO_LINK : null;
            const linkLabel = method === "venmo" ? T.openVenmo : "paypal.com →";
            return (
              <div className="space-y-5">
                <button onClick={reset} className="text-xs text-ink/60 hover:text-ink">{T.back}</button>

                <div className="rounded border border-ink/15 p-4 bg-background space-y-3">
                  <div className="text-xs uppercase tracking-[0.2em] text-ink/60">{T.instructions}</div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-ink/70">{T.amount}</span>
                    <span className="font-display text-3xl tabular-nums">${total.toFixed(2)}</span>
                  </div>
                  <div>
                    <div className="text-sm text-ink/70 mb-1">{T.sendTo}</div>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-3 py-2 bg-ink/5 rounded text-sm break-all">
                        {handle}
                      </code>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => copy(handle, method)}
                      >
                        {copied === method ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        <span className="ml-1">{copied === method ? T.copied : T.copy}</span>
                      </Button>
                    </div>
                    {externalLink && (
                      <a
                        href={externalLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-clay underline mt-2 inline-block"
                      >
                        {linkLabel}
                      </a>
                    )}
                  </div>
                </div>

              <div className="space-y-3">
                <div className="text-sm text-ink/70">{T.afterPay}</div>
                <div className="grid gap-3">
                  <div>
                    <Label htmlFor="m-name">{T.name}</Label>
                    <Input id="m-name" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="m-email">{T.email}</Label>
                      <Input id="m-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="m-phone">{T.phone}</Label>
                      <Input id="m-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="m-tx">{T.txId}</Label>
                    <Input id="m-tx" value={txId} onChange={(e) => setTxId(e.target.value)} />
                  </div>
                </div>
                <Button
                  onClick={submitManual}
                  disabled={submitting}
                  className="w-full bg-ink hover:bg-ink/90 text-cream rounded-full py-5"
                >
                  {submitting ? "..." : T.submit}
                </Button>
              </div>
            </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </>
  );
};
