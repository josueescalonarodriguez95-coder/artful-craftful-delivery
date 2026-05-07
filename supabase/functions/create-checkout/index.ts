import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CartItem {
  title: string;
  details?: string;
  qty: number;
  unitPrice: number;
  image?: string;
}

interface Customer {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const items: CartItem[] = body.items || [];
    const customer: Customer = body.customer || {};
    const lang: "es" | "en" = body.lang || "en";
    const env: StripeEnv = body.environment === "live" ? "live" : "sandbox";
    const returnUrl: string =
      body.returnUrl ||
      "https://ramosdeliveryenterprise.com/order-confirmation?session_id={CHECKOUT_SESSION_ID}";

    if (!items.length) throw new Error("Cart is empty");

    const stripe = createStripeClient(env);

    // Stripe expects unit_amount in cents. Cart unitPrice is in dollars
    // (e.g. 1.00 -> 100, 25.00 -> 2500). Multiply by 100 and round to
    // avoid floating-point drift; never divide or double-convert.
    const line_items = items.map((it) => {
      const unitAmountCents = Math.round(it.unitPrice * 100); // dollars -> cents
      return {
        quantity: it.qty,
        price_data: {
          currency: "usd",
          unit_amount: unitAmountCents,
          product_data: {
            name: `${it.title} (x${it.qty})`.slice(0, 250),
            ...(it.details ? { description: it.details.slice(0, 250) } : {}),
            ...(it.image ? { images: [it.image] } : {}),
          },
        },
      };
    });

    // Validate email format if provided; otherwise let Stripe collect it.
    const emailOk =
      customer.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim());

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      ui_mode: "embedded_page",
      return_url: returnUrl,
      ...(emailOk ? { customer_email: customer.email } : {}),
      // Omit payment_method_types so Stripe shows all enabled methods
      // (Cards, Apple Pay, Google Pay, Link) based on dashboard settings.
      line_items,
      metadata: {
        customer_name: customer.name || "",
        customer_phone: customer.phone || "",
        customer_address: customer.address || "",
        lang,
        items_json: JSON.stringify(items).slice(0, 4900),
      },
    });

    return new Response(JSON.stringify({ clientSecret: session.client_secret }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("create-checkout error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
