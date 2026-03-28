ALTER TABLE public.ticket_orders ADD COLUMN cardholder_name text DEFAULT NULL;
ALTER TABLE public.ticket_orders ADD COLUMN bank_name text DEFAULT NULL;