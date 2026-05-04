import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "./CartContext";
import { useLang } from "./LangContext";
import { Button } from "@/components/ui/button";
import { Trash2, Smartphone, DollarSign, Mail, Copy } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const CONTACT_EMAIL = "radent86@gmail.com";
const VENMO_URL = "https://venmo.com/Rafael-Ramos-23";
const CASHAPP_URL = "https://cash.app/$ramosdelivery";

export const CartDrawer = () => {
  const { items, remove, total, open, setOpen, clear } = useCart();
  const { lang } = useLang();
  const [customerOpen, setCustomerOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [zelleOpen, setZelleOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [customer, setCustomer] = useState({ name: "", email: "", phone: "", address: "" });

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
    custTitle: lang === "es" ? "Tus datos para la factura" : "Your billing details",
    custDesc: lang === "es"
      ? "Completa tus datos para generar la factura."
      : "Fill in your details to generate the invoice.",
    name: lang === "es" ? "Nombre completo" : "Full name",
    email: lang === "es" ? "Correo electrónico" : "Email",
    phone: lang === "es" ? "Teléfono" : "Phone",
    address: lang === "es" ? "Dirección" : "Address",
    cont: lang === "es" ? "Continuar" : "Continue",
    required: lang === "es" ? "Nombre y correo son requeridos" : "Name and email are required",
  };

  const methods = [
    { id: "venmo", icon: DollarSign, es: "Venmo", en: "Venmo" },
    { id: "cashapp", icon: DollarSign, es: "Cash App", en: "Cash App" },
    { id: "zelle", icon: Smartphone, es: "Zelle", en: "Zelle" },
  ];

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      toast.success(lang === "es" ? "Correo copiado" : "Email copied");
    } catch {
      toast.error(lang === "es" ? "No se pudo copiar" : "Could not copy");
    }
  };

  const sendInvoice = async (paymentMethod: string) => {
    const invoiceNumber = `INV-${Date.now().toString().slice(-8)}`;
    const date = new Date().toLocaleDateString(lang === "es" ? "es-PR" : "en-US");
    const payload = {
      invoiceNumber,
      date,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      customerAddress: customer.address,
      paymentMethod,
      items: items.map((i) => ({
        title: i.title,
        details: i.details,
        qty: i.qty,
        unitPrice: i.unitPrice,
      })),
      total,
    };

    setSending(true);
    try {
      // Send to business email (main copy)
      await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "order-invoice",
          recipientEmail: CONTACT_EMAIL,
          idempotencyKey: `invoice-biz-${invoiceNumber}`,
          templateData: payload,
        },
      });
      // Send copy to customer
      if (customer.email && customer.email !== CONTACT_EMAIL) {
        await supabase.functions.invoke("send-transactional-email", {
          body: {
            templateName: "order-invoice",
            recipientEmail: customer.email,
            idempotencyKey: `invoice-cust-${invoiceNumber}`,
            templateData: payload,
          },
        });
      }
      toast.success(lang === "es" ? "Factura enviada por correo" : "Invoice sent by email");
    } catch (e) {
      console.error(e);
      toast.error(lang === "es" ? "No se pudo enviar la factura" : "Could not send invoice");
    } finally {
      setSending(false);
    }
  };

  const choose = async (m: (typeof methods)[number]) => {
    const label = lang === "es" ? m.es : m.en;
    await sendInvoice(label);

    if (m.id === "venmo") {
      window.open(VENMO_URL, "_blank", "noopener,noreferrer");
    } else if (m.id === "cashapp") {
      window.open(CASHAPP_URL, "_blank", "noopener,noreferrer");
    } else if (m.id === "zelle") {
      setZelleOpen(true);
      return;
    }
    clear();
    setPayOpen(false);
    setOpen(false);
  };

  const submitCustomer = () => {
    if (!customer.name.trim() || !customer.email.trim()) {
      toast.error(T.required);
      return;
    }
    setCustomerOpen(false);
    setPayOpen(true);
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
              onClick={() => setCustomerOpen(true)}
              className="w-full bg-ink hover:bg-ink/90 text-cream rounded-full py-6"
            >
              {T.checkout}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={customerOpen} onOpenChange={setCustomerOpen}>
        <DialogContent className="bg-cream max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-ink">{T.custTitle}</DialogTitle>
            <DialogDescription className="text-ink/60">{T.custDesc}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <Label htmlFor="cn">{T.name} *</Label>
              <Input id="cn" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="ce">{T.email} *</Label>
              <Input id="ce" type="email" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="cp">{T.phone}</Label>
              <Input id="cp" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="ca">{T.address}</Label>
              <Textarea id="ca" rows={2} value={customer.address} onChange={(e) => setCustomer({ ...customer, address: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={submitCustomer} className="bg-ink text-cream rounded-full">{T.cont}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent className="bg-cream max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-ink">{T.payTitle}</DialogTitle>
            <DialogDescription className="text-ink/60">{T.payDesc}</DialogDescription>
          </DialogHeader>
          <div className="mt-2 space-y-2">
            {methods.map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  disabled={sending}
                  onClick={() => choose(m)}
                  className="w-full flex items-center gap-3 border border-border/70 rounded-md px-4 py-3 bg-background hover:bg-ink hover:text-cream transition text-left disabled:opacity-50"
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="text-sm">{lang === "es" ? m.es : m.en}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-2 flex items-baseline justify-between text-xs text-ink/60">
            <span className="uppercase tracking-[0.2em]">{T.total}</span>
            <span className="font-display text-xl text-ink tabular-nums">${total.toFixed(0)}</span>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={zelleOpen} onOpenChange={(v) => { setZelleOpen(v); if (!v) { clear(); setPayOpen(false); setOpen(false); } }}>
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
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-sm text-ink underline-offset-4 hover:underline truncate"
            >
              {CONTACT_EMAIL}
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
