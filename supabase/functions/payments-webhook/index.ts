import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, stripe-signature',
}

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/stripe'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const url = new URL(req.url)
  const env = url.searchParams.get('env') || 'sandbox'

  try {
    const event = await req.json()
    console.log('payments-webhook event:', event.type, 'env:', env)

    const isCheckoutComplete =
      event.type === 'checkout.session.completed' ||
      event.type === 'transaction.completed'

    if (!isCheckoutComplete) {
      return new Response(JSON.stringify({ received: true, ignored: event.type }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const data = event.data?.object || event.data || {}
    const sessionId: string | undefined = data.id
    const metadata = data.metadata || {}
    const customerEmail =
      data.customer_email || data.customer_details?.email || metadata.customer_email
    let amountTotal: number = (data.amount_total ?? 0) / 100
    let paymentIntentId: string | undefined = data.payment_intent
    let paymentMethod = 'card'

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')!
    const STRIPE_API_KEY =
      env === 'live'
        ? Deno.env.get('STRIPE_LIVE_API_KEY') || ''
        : Deno.env.get('STRIPE_SANDBOX_API_KEY') || ''

    try {
      if (sessionId && STRIPE_API_KEY) {
        const r = await fetch(
          `${GATEWAY_URL}/v1/checkout/sessions/${sessionId}?expand[]=payment_intent`,
          {
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              'X-Connection-Api-Key': STRIPE_API_KEY,
            },
          },
        )
        if (r.ok) {
          const full = await r.json()
          amountTotal = (full.amount_total ?? amountTotal * 100) / 100
          paymentIntentId =
            typeof full.payment_intent === 'string'
              ? full.payment_intent
              : full.payment_intent?.id || paymentIntentId
          const types = full.payment_method_types || []
          paymentMethod = types[0] || 'card'
        }
      }
    } catch (e) {
      console.warn('Could not expand session:', e)
    }

    const items = metadata.items_json ? safeParse(metadata.items_json) : []

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Upsert by stripe_session_id to ensure idempotency on webhook retries.
    const { error } = await supabase
      .from('orders')
      .upsert(
        {
          stripe_session_id: sessionId,
          stripe_payment_intent_id: paymentIntentId,
          customer_name: metadata.customer_name || data.customer_details?.name || '',
          customer_email: customerEmail || '',
          customer_phone: metadata.customer_phone || data.customer_details?.phone || '',
          customer_address: metadata.customer_address || '',
          items,
          amount_total: amountTotal,
          currency: data.currency || 'usd',
          status: 'paid',
          payment_method: paymentMethod,
          metadata,
        },
        { onConflict: 'stripe_session_id' },
      )

    if (error) console.error('order upsert error:', error)

    return new Response(JSON.stringify({ received: true, sessionId }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown'
    console.error('payments-webhook error:', msg)
    return new Response(JSON.stringify({ error: msg }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

function safeParse(s: string): any[] {
  try {
    const v = JSON.parse(s)
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}
