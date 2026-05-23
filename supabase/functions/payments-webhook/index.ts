import { createClient } from "npm:@supabase/supabase-js@2";
import { type StripeEnv, createStripeClient, verifyWebhook } from "../_shared/stripe.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const url = new URL(req.url);
  const rawEnv = url.searchParams.get("env");
  if (rawEnv !== "sandbox" && rawEnv !== "live") {
    console.error("payments-webhook: invalid or missing env query parameter:", rawEnv);
    return new Response(
      JSON.stringify({ error: "Invalid env" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
  const env: StripeEnv = rawEnv;

  // CRITICAL: signature verification BEFORE any database write.
  // Without this, anyone can POST a fake `checkout.session.completed`
  // event and create a "paid" order in our DB.
  let event: { type: string; data: { object: any } };
  try {
    event = await verifyWebhook(req, env);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid signature";
    console.error("payments-webhook signature verification failed:", msg);
    return new Response(JSON.stringify({ error: "Invalid signature" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    console.log("payments-webhook event:", event.type, "env:", env);

    const isCheckoutComplete =
      event.type === "checkout.session.completed" ||
      event.type === "transaction.completed";

    if (!isCheckoutComplete) {
      return new Response(
        JSON.stringify({ received: true, ignored: event.type }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = event.data?.object || {};
    const sessionId: string | undefined = data.id;
    const metadata = data.metadata || {};
    const customerEmail =
      data.customer_email || data.customer_details?.email || metadata.customer_email;
    let amountTotal: number = (data.amount_total ?? 0) / 100;
    let paymentIntentId: string | undefined = data.payment_intent;
    let paymentMethod = "card";

    // Re-fetch the session through the Stripe SDK (gateway-routed) to
    // resolve payment_intent and payment_method_types authoritatively.
    if (sessionId) {
      try {
        const stripe = createStripeClient(env);
        const full = await stripe.checkout.sessions.retrieve(sessionId, {
          expand: ["payment_intent"],
        });
        amountTotal = (full.amount_total ?? amountTotal * 100) / 100;
        paymentIntentId =
          typeof full.payment_intent === "string"
            ? full.payment_intent
            : full.payment_intent?.id || paymentIntentId;
        const types = full.payment_method_types || [];
        paymentMethod = types[0] || "card";
      } catch (e) {
        console.warn("Could not expand session:", e);
      }
    }

    const items = metadata.items_json ? safeParse(metadata.items_json) : [];

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error } = await supabase.from("orders").upsert(
      {
        stripe_session_id: sessionId,
        stripe_payment_intent_id: paymentIntentId,
        customer_name: metadata.customer_name || data.customer_details?.name || "",
        customer_email: customerEmail || "",
        customer_phone: metadata.customer_phone || data.customer_details?.phone || "",
        customer_address: metadata.customer_address || "",
        items,
        amount_total: amountTotal,
        currency: data.currency || "usd",
        status: "paid",
        payment_method: paymentMethod,
        metadata,
      },
      { onConflict: "stripe_session_id" },
    );

    if (error) console.error("order upsert error:", error);

    return new Response(JSON.stringify({ received: true, sessionId }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown";
    console.error("payments-webhook error:", msg);
    // Return 200 so Stripe doesn't retry on our internal bugs (signature
    // was already verified above; replay is not a concern here).
    return new Response(JSON.stringify({ received: true, error: msg }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function safeParse(s: string): any[] {
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
