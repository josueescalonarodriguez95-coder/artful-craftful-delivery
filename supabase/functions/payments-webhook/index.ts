import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/stripe'
const MERCHANT_EMAIL = 'ramosdeliverye@gmail.com'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const url = new URL(req.url)
  const env = url.searchParams.get('env') || 'sandbox'

  try {
    const event = await req.json()
    console.log('payments-webhook event:', event.type, 'env:', env)

    // Handle both Stripe-style (checkout.session.completed) and provider-mapped events
    const isCheckoutComplete =
      event.type === 'checkout.session.completed' ||
      event.type === 'transaction.completed'

    if (!isCheckoutComplete) {
      return new Response(JSON.stringify({ received: true, ignored: event.type }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Extract session details
    const data = event.data?.object || event.data || {}
    const sessionId: string | undefined = data.id
    const metadata = data.metadata || {}
    const customerEmail =
      data.customer_email || data.customer_details?.email || metadata.customer_email
    let amountTotal: number = (data.amount_total ?? 0) / 100

    // Fetch full session for line items + payment method via Stripe gateway
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')!
    const STRIPE_API_KEY =
      Deno.env.get('STRIPE_SANDBOX_API_KEY') || Deno.env.get('STRIPE_API_KEY') || ''

    let paymentMethod = 'Card'
    try {
      if (sessionId && STRIPE_API_KEY) {
        const r = await fetch(
          `${GATEWAY_URL}/v1/checkout/sessions/${sessionId}?expand[]=payment_intent`,
          {
            headers: {
              'Authorization': `Bearer ${LOVABLE_API_KEY}`,
              'X-Connection-Api-Key': STRIPE_API_KEY,
            },
          }
        )
        if (r.ok) {
          const full = await r.json()
          amountTotal = (full.amount_total ?? amountTotal * 100) / 100
          const types = full.payment_method_types || []
          if (types.includes('paypal')) paymentMethod = 'PayPal'
          else if (types.includes('card')) paymentMethod = 'Card'
        }
      }
    } catch (e) {
      console.warn('Could not expand session:', e)
    }

    const items = metadata.items_json ? safeParse(metadata.items_json) : []
    const customer = {
      name: metadata.customer_name || data.customer_details?.name || 'Customer',
      email: customerEmail,
      phone: metadata.customer_phone || data.customer_details?.phone || '',
      address: metadata.customer_address || '',
    }

    const invoiceNumber = `INV-${Date.now().toString().slice(-8)}`
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    })

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const baseData = {
      invoiceNumber,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      customerAddress: customer.address,
      paymentMethod,
      items,
      total: amountTotal,
      date,
    }

    // Send to customer
    if (customer.email) {
      await supabase.functions.invoke('send-transactional-email', {
        body: {
          templateName: 'order-invoice',
          recipientEmail: customer.email,
          idempotencyKey: `invoice-customer-${sessionId}`,
          templateData: { ...baseData, isMerchantCopy: false },
        },
      })
    }

    // Send to merchant
    await supabase.functions.invoke('send-transactional-email', {
      body: {
        templateName: 'order-invoice',
        recipientEmail: MERCHANT_EMAIL,
        idempotencyKey: `invoice-merchant-${sessionId}`,
        templateData: { ...baseData, isMerchantCopy: true },
      },
    })

    return new Response(JSON.stringify({ received: true, invoice: invoiceNumber }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown'
    console.error('payments-webhook error:', msg)
    return new Response(JSON.stringify({ error: msg }), {
      status: 200, // ack to avoid retries on parse errors
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
