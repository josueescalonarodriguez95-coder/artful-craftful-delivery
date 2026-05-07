import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/site/CartContext";
import { useLang } from "@/components/site/LangContext";

export default function OrderConfirmation() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const { clear } = useCart();
  const { lang } = useLang();

  useEffect(() => {
    clear();
  }, [clear]);

  return (
    <main className="min-h-screen bg-cream text-ink flex items-center justify-center px-6 py-20">
      <div className="max-w-lg w-full text-center">
        <CheckCircle2 className="h-16 w-16 mx-auto text-clay mb-6" />
        <h1 className="font-display text-4xl mb-3">
          {lang === "es" ? "¡Pago confirmado!" : "Payment confirmed!"}
        </h1>
        <p className="text-ink/70 mb-6">
          {lang === "es"
            ? "Gracias por tu compra. Recibirás un correo de Stripe con tu recibo."
            : "Thank you for your purchase. You'll receive a receipt from Stripe by email."}
        </p>
        {sessionId && (
          <p className="text-xs text-ink/50 mb-8 break-all">
            {lang === "es" ? "Referencia:" : "Reference:"} {sessionId}
          </p>
        )}
        <Button asChild className="bg-ink hover:bg-ink/90 text-cream rounded-full px-8 py-6">
          <Link to="/">{lang === "es" ? "Volver al inicio" : "Back to home"}</Link>
        </Button>
      </div>
    </main>
  );
}
