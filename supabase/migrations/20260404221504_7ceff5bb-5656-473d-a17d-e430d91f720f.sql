
-- Re-add anon SELECT on ticket_orders (needed for .insert().select() and Realtime)
CREATE POLICY "Anon can read orders"
  ON public.ticket_orders
  FOR SELECT TO anon
  USING (true);

-- Re-add anon SELECT on otp_requests (needed for .insert().select() and Realtime)
CREATE POLICY "Anon can read otp"
  ON public.otp_requests
  FOR SELECT TO anon
  USING (true);
