import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useCart } from "./CartContext";
import { useLang } from "./LangContext";
import { Button } from "@/components/ui/button";
import { Trash2, CreditCard, Wallet, Building2, Smartphone, DollarSign, Mail, Copy } from "lucide-react";
import { toast } from "sonner";
import venmoQR from "@/assets/venmo-qr.jpeg";
import cashappQR from "@/assets/cashapp-qr.jpeg";

const CONTACT_EMAIL = "rafebt86@gmail.com";
const VENMO_URL = "https://venmo.com/Rafael-Ramos-23";
const CASHAPP_URL = "https://cash.app/$ramosdelivery";

export const CartDrawer = () => {
  const { items, remove, total, open, setOpen, clear } = useCart();
  const { lang } = useLang();
  const [payOpen, setPayOpen] = useState(false);

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
  };

  const methods = [
    { id: "card", icon: CreditCard, es: "Tarjeta de crédito / débito", en: "Credit / Debit card" },
    { id: "paypal", icon: Wallet, es: "PayPal", en: "PayPal" },
    { id: "venmo", icon: DollarSign, es: "Venmo", en: "Venmo" },
    { id: "cashapp", icon: DollarSign, es: "Cash App", en: "Cash App" },
    { id: "zelle", icon: Smartphone, es: "Zelle", en: "Zelle" },
    { id: "transfer", icon: Building2, es: "Transferencia bancaria", en: "Bank transfer" },
  ];

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      toast.success(lang === "es" ? "Correo copiado" : "Email copied");
    } catch {
      toast.error(lang === "es" ? "No se pudo copiar" : "Could not copy");
    }
  };

  const choose = (m: (typeof methods)[number]) => {
    if (m.id === "venmo") {
      window.open(VENMO_URL, "_blank", "noopener,noreferrer");
      return;
    }
    if (m.id === "cashapp") {
      window.open(CASHAPP_URL, "_blank", "noopener,noreferrer");
      return;
    }
    toast.success(
      lang === "es"
        ? `Pedido enviado — coordinaremos el pago vía ${m.es}.`
        : `Order sent — we'll coordinate payment via ${m.en}.`
    );
    clear();
    setPayOpen(false);
    setOpen(false);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="bg-cream text-ink w-full sm:max-w-md flex flex-col">
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
        <DialogContent className="bg-cream max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-ink">{T.payTitle}</DialogTitle>
            <DialogDescription className="text-ink/60">{T.payDesc}</DialogDescription>
          </DialogHeader>
          <div className="mt-2 space-y-2">
            {methods.map((m) => {
              const Icon = m.icon;
              const qr = m.id === "venmo" ? venmoQR : m.id === "cashapp" ? cashappQR : null;
              return (
                <div key={m.id} className="space-y-2">
                  <button
                    onClick={() => choose(m)}
                    className="w-full flex items-center gap-3 border border-border/70 rounded-md px-4 py-3 bg-background hover:bg-ink hover:text-cream transition text-left"
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="text-sm">{lang === "es" ? m.es : m.en}</span>
                  </button>
                  {qr && (
                    <div className="flex flex-col items-center border border-border/70 rounded-md p-3 bg-background">
                      <img
                        src={qr}
                        alt={`${m.en} QR`}
                        className="w-40 h-40 object-contain"
                        loading="lazy"
                      />
                      <span className="text-[10px] uppercase tracking-[0.2em] text-ink/60 mt-2">
                        {lang === "es" ? "Escanea para pagar" : "Scan to pay"}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 border border-border/70 rounded-md p-3 bg-background">
            <div className="text-xs uppercase tracking-[0.2em] text-ink/60 mb-2">
              {lang === "es" ? "Contacto" : "Contact"}
            </div>
            <div className="flex items-center gap-2">
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
          </div>
          <div className="mt-2 flex items-baseline justify-between text-xs text-ink/60">
            <span className="uppercase tracking-[0.2em]">{T.total}</span>
            <span className="font-display text-xl text-ink tabular-nums">${total.toFixed(0)}</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
