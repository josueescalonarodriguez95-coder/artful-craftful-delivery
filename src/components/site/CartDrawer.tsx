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

const CONTACT_EMAIL = "ramosdeliverye@gmail.com";
const ZELLE_EMAIL = "radent86@gmail.com";
const PAYPAL_EMAIL = "ramosdeliverye@gmail.com";
const VENMO_URL = "https://venmo.com/Rafael-Ramos-23";
const CASHAPP_URL = "https://cash.app/$ramosdelivery";

export const CartDrawer = () => {
  const { items, remove, total, open, setOpen, clear } = useCart();
  const { lang } = useLang();
  const [payOpen, setPayOpen] = useState(false);
  const [zelleOpen, setZelleOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
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

  const submitStripe = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error(lang === "es" ? "Nombre y email requeridos" : "Name and email required");
      return;
    }
    if (!pendingMethod) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          items: items.map((i) => ({
            title: i.title,
            details: i.details,
            qty: i.qty,
            unitPrice: i.unitPrice,
          })),
          customer: form,
          paymentMethod: pendingMethod,
          lang,
        },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL");
      }
    } catch (e: any) {
      console.error(e);
      toast.error(lang === "es" ? "Error al iniciar el pago" : "Payment error");
      setLoading(false);
    }
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
              onClick={() => { window.open(VENMO_URL, "_blank", "noopener,noreferrer"); }}
              className="w-full flex items-center gap-3 border border-border/70 rounded-md px-4 py-3 bg-background hover:bg-ink hover:text-cream transition text-left"
            >
              <DollarSign className="h-5 w-5 shrink-0" />
              <span className="text-sm">Venmo</span>
            </button>
            <button
              onClick={() => { window.open(CASHAPP_URL, "_blank", "noopener,noreferrer"); }}
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
    </>
  );
};
