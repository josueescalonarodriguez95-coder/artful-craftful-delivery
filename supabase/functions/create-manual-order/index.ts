import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = await req.json();
    const items = Array.isArray(body.items) ? body.items : [];
    const customer = body.customer || {};
    const method = body.method === "paypal" ? "paypal" : "zelle";
    const transactionId: string = (body.transactionId || "").toString().slice(0, 200);
    const amount = Number(body.amount) || 0;

    if (!items.length) throw new Error("Cart is empty");
    if (!transactionId) throw new Error("Transaction ID is required");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data, error } = await supabase
      .from("orders")
      .insert({
        customer_name: customer.name || null,
        customer_email: customer.email || null,
        customer_phone: customer.phone || null,
        customer_address: customer.address || null,
        items,
        amount_total: amount,
        currency: "usd",
        status: "pending_verification",
        payment_method: method,
        metadata: { transaction_id: transactionId, lang: body.lang || "en" },
      })
      .select("id")
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ orderId: data.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("create-manual-order error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
