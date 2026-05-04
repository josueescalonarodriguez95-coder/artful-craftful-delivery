import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/stripe'

interface CartItem {
  title: string
  details?: string
  qty: number
  unitPrice: number
}

interface Customer {
  name: string
  email: string
  phone?: string
  address?: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
    const STRIPE_API_KEY =
      Deno.env.get('STRIPE_SANDBOX_API_KEY') || Deno.env.get('STRIPE_API_KEY')

    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured')
    if (!STRIPE_API_KEY) throw new Error('Stripe API key not configured')

    const body = await req.json()
    const items: CartItem[] = body.items || []
    const customer: Customer = body.customer || {}
    const paymentMethod: 'card' | 'paypal' = body.paymentMethod || 'card'
    const lang: 'es' | 'en' = body.lang || 'en'

    if (!items.length) throw new Error('Cart is empty')
    if (!customer.email || !customer.name) throw new Error('Customer name and email required')

    // Build Stripe line_items as URL-encoded form data (Stripe API standard)
    const params = new URLSearchParams()
    params.append('mode', 'payment')
    params.append('customer_email', customer.email)
    if (paymentMethod === 'paypal') {
      params.append('payment_method_types[]', 'paypal')
    } else {
      params.append('payment_method_types[]', 'card')
    }

    items.forEach((it, idx) => {
      const unitAmount = Math.round(it.unitPrice * 100)
      params.append(`line_items[${idx}][quantity]`, String(it.qty))
      params.append(`line_items[${idx}][price_data][currency]`, 'usd')
      params.append(`line_items[${idx}][price_data][unit_amount]`, String(unitAmount))
      params.append(`line_items[${idx}][price_data][product_data][name]`, it.title.slice(0, 250))
      if (it.details) {
        params.append(
          `line_items[${idx}][price_data][product_data][description]`,
          it.details.slice(0, 250)
        )
      }
    })

    const origin = req.headers.get('origin') || 'https://ramosdeliveryenterprise.com'
    params.append('success_url', `${origin}/?payment=success&session_id={CHECKOUT_SESSION_ID}`)
    params.append('cancel_url', `${origin}/?payment=cancel`)

    // Embed customer info in metadata so the webhook can send invoices
    params.append('metadata[customer_name]', customer.name)
    if (customer.phone) params.append('metadata[customer_phone]', customer.phone)
    if (customer.address) params.append('metadata[customer_address]', customer.address)
    params.append('metadata[lang]', lang)
    params.append('metadata[items_json]', JSON.stringify(items).slice(0, 4900))

    const response = await fetch(`${GATEWAY_URL}/v1/checkout/sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'X-Connection-Api-Key': STRIPE_API_KEY,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    const data = await response.json()
    if (!response.ok) {
      console.error('Stripe error', data)
      throw new Error(`Stripe ${response.status}: ${JSON.stringify(data)}`)
    }

    return new Response(JSON.stringify({ url: data.url, id: data.id }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('create-checkout error:', msg)
    return new Response(JSON.stringify({ error: msg }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
