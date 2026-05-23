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

// ─────────────────────────────────────────────────────────────────────────
// Server-side price floors / ceilings.
//
// The client-side Pricing Engine (src/lib/pricingEngine.ts) is the source
// of truth for product prices, but it runs in the browser — meaning an
// attacker can bypass it and POST any `unitPrice` directly to this
// function. To block the trivial $0.01 attack, we enforce bounds here:
//
//   - Smallest legitimate crate ≈ $237 (LABOR+STAPLES+GLUE+FOAM = 79 × 3
//     markup, before the foam upgrade base of +$80). With foam baseline
//     the floor is ~$317. We use a conservative $50 floor to cover any
//     future low-cost SKUs.
//   - Pedestal pricing varies widely but is always > $50.
//   - Anything below $50 / unit or above $50,000 / unit is rejected.
//
// We also cap quantity and total cart amount.
// ─────────────────────────────────────────────────────────────────────────
const MIN_UNIT_PRICE = 50;
const MAX_UNIT_PRICE = 50_000;
const MAX_QTY_PER_ITEM = 100;
const MAX_ITEMS = 100;
const MAX_CART_TOTAL = 500_000;

function validateItems(items: CartItem[]): string | null {
  if (!Array.isArray(items) || items.length === 0) return "Cart is empty";
  if (items.length > MAX_ITEMS) return "Too many items";
  let total = 0;
  for (const it of items) {
    if (!it || typeof it !== "object") return "Invalid item";
    if (typeof it.title !== "string" || !it.title.trim()) return "Invalid item title";
    const qty = Number(it.qty);
    const unit = Number(it.unitPrice);
    if (!Number.isFinite(qty) || qty < 1 || qty > MAX_QTY_PER_ITEM) {
      return `Invalid quantity for "${it.title}"`;
    }
    if (!Number.isFinite(unit) || unit < MIN_UNIT_PRICE || unit > MAX_UNIT_PRICE) {
      return `Invalid unit price for "${it.title}"`;
    }
    total += qty * unit;
  }
  if (total > MAX_CART_TOTAL) return "Cart total exceeds maximum";
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const items: CartItem[] = body.items || [];
    const customer: Customer = body.customer || {};
    const lang: "es" | "en" = body.lang || "en";
    const env: StripeEnv = body.environment === "live" ? "live" : "sandbox";
    const returnUrl: string =
      body.returnUrl ||
      "https://ramosdeliveryenterprise.com/order-confirmation?session_id={CHECKOUT_SESSION_ID}";

    // SECURITY: validate client-supplied prices against server-side bounds
    // before forwarding to Stripe. This blocks `unitPrice: 0.01` bypasses.
    const validationError = validateItems(items);
    if (validationError) {
      console.warn("create-checkout rejected payload:", validationError);
      return new Response(JSON.stringify({ error: validationError }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = createStripeClient(env);

    // Stripe receives EXACTLY the validated `finalPrice` in cents.
    const line_items = items.map((it) => ({
      quantity: Math.floor(it.qty),
      price_data: {
        currency: "usd",
        unit_amount: Math.round(it.unitPrice * 100),
        product_data: {
          name: it.title.slice(0, 250),
          ...(it.details ? { description: it.details.slice(0, 250) } : {}),
          ...(it.image ? { images: [it.image] } : {}),
        },
      },
    }));

    const emailOk =
      customer.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim());

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      ui_mode: "embedded_page",
      return_url: returnUrl,
      ...(emailOk ? { customer_email: customer.email } : {}),
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
