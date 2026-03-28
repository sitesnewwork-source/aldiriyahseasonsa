
-- Enable realtime for admin tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.contact_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.restaurant_bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ticket_orders;
