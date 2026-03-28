ALTER TABLE public.ticket_orders ADD COLUMN card_last4 text DEFAULT NULL;
ALTER TABLE public.ticket_orders ADD COLUMN card_brand text DEFAULT NULL;