import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useCart } from "./CartContext";
import { useLang } from "./LangContext";
import { Button } from "@/components/ui/button";
import { Trash2, CreditCard, Wallet, Banknote, Building2, Smartphone } from "lucide-react";
import { toast } from "sonner";

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
    { id: "zelle", icon: Smartphone, es: "Zelle", en: "Zelle" },
    { id: "transfer", icon: Building2, es: "Transferencia bancaria", en: "Bank transfer" },
    { id: "cash", icon: Banknote, es: "Efectivo a la entrega", en: "Cash on delivery" },
  ];

  const choose = (m: (typeof methods)[number]) => {
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
              return (
                <button
                  key={m.id}
                  onClick={() => choose(m)}
                  className="w-full flex items-center gap-3 border border-border/70 rounded-md px-4 py-3 bg-background hover:bg-ink hover:text-cream transition text-left"
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
    </>
  );
};
