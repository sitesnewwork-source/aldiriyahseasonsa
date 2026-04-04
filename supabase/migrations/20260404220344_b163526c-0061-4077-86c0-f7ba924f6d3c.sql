
-- Fix ticket_orders: allow anon to read only via insert-returning (PostgREST needs SELECT for .select() after .insert())
DROP POLICY IF EXISTS "Anon can read own order by confirmation" ON public.ticket_orders;

-- Fix otp_requests: same pattern
DROP POLICY IF EXISTS "Anon can read otp by order" ON public.otp_requests;
