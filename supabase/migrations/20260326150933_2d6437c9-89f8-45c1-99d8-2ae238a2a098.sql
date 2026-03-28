
CREATE TABLE public.event_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id TEXT NOT NULL,
  event_title TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  guests INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.event_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can book events" ON public.event_bookings FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Admin can read event bookings" ON public.event_bookings FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "Admin can update event bookings" ON public.event_bookings FOR UPDATE TO authenticated USING (is_admin());
CREATE POLICY "Admin can delete event bookings" ON public.event_bookings FOR DELETE TO authenticated USING (is_admin());
