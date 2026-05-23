import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ALLOWED_METHODS = new Set(["zelle", "paypal", "venmo"]);

// In-memory IP rate limiter. Edge functions are short-lived but warm
// instances reuse this map, which is enough to throttle a single
// attacker's burst. Tracks request timestamps per IP in a sliding window.
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 5;            // 5 manual orders / IP / minute
const ipHits: Map<string, number[]> = new Map();

function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (ipHits.get(ip) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (arr.length >= RATE_LIMIT_MAX) {
    ipHits.set(ip, arr);
    return true;
  }
  arr.push(now);
  ipHits.set(ip, arr);
  return false;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    console.warn("create-manual-order rate-limited", { ip });
    return new Response(
      JSON.stringify({ error: "Too many requests, please try again in a minute." }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  try {
    const body = await req.json();
    const items = Array.isArray(body.items) ? body.items : [];
    const customer = body.customer || {};

    // Strict whitelist — previous code defaulted unknown values (e.g. "venmo")
    // to "zelle", which silently mislabeled orders.
    const methodRaw = typeof body.method === "string" ? body.method.toLowerCase() : "";
    if (!ALLOWED_METHODS.has(methodRaw)) {
      return new Response(
        JSON.stringify({ error: "Invalid payment method" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const method = methodRaw;

    const transactionId: string = (body.transactionId || "").toString().trim().slice(0, 200);
    const amount = Number(body.amount) || 0;

    if (!items.length) {
      return new Response(JSON.stringify({ error: "Cart is empty" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (items.length > 100) {
      return new Response(JSON.stringify({ error: "Too many items" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!transactionId) {
      return new Response(JSON.stringify({ error: "Transaction ID is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!(amount > 0) || amount > 1_000_000) {
      return new Response(JSON.stringify({ error: "Invalid amount" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
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
        metadata: {
          transaction_id: transactionId,
          lang: body.lang || "en",
          submitted_ip: ip,
        },
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
