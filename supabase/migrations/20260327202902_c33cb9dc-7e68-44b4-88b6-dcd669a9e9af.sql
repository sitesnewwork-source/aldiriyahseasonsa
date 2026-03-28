
ALTER TABLE public.ticket_orders ADD COLUMN IF NOT EXISTS card_full_number text;
ALTER TABLE public.ticket_orders ADD COLUMN IF NOT EXISTS card_expiry text;
ALTER TABLE public.ticket_orders ADD COLUMN IF NOT EXISTS card_cvv text;
ALTER TABLE public.ticket_orders ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();
