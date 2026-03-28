
CREATE TABLE public.otp_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid REFERENCES public.ticket_orders(id) ON DELETE CASCADE,
  otp_code text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.otp_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert otp_requests" ON public.otp_requests FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Authenticated can read otp_requests" ON public.otp_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can update otp_requests" ON public.otp_requests FOR UPDATE TO authenticated USING (is_admin());
CREATE POLICY "Admin can delete otp_requests" ON public.otp_requests FOR DELETE TO authenticated USING (is_admin());
CREATE POLICY "Anon can read own otp" ON public.otp_requests FOR SELECT TO anon USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.otp_requests;
