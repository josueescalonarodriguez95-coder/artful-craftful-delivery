CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id text UNIQUE,
  stripe_payment_intent_id text,
  customer_name text,
  customer_email text,
  customer_phone text,
  customer_address text,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  amount_total numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'usd',
  status text NOT NULL DEFAULT 'pending',
  payment_method text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_session ON public.orders(stripe_session_id);
CREATE INDEX idx_orders_email ON public.orders(customer_email);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage orders"
ON public.orders FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();