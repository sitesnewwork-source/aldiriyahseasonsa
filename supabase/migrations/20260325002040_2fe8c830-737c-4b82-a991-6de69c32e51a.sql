
-- Visitors table
CREATE TABLE public.visitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL UNIQUE,
  name text DEFAULT 'زائر جديد',
  email text,
  phone text,
  device text DEFAULT 'desktop',
  browser text DEFAULT 'unknown',
  country text DEFAULT 'غير معروف',
  current_page text DEFAULT '/',
  current_page_label text DEFAULT 'الصفحة الرئيسية',
  is_online boolean DEFAULT true,
  last_seen timestamp with time zone DEFAULT now(),
  total_visits integer DEFAULT 1,
  pages_viewed integer DEFAULT 1,
  session_start timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Visitor actions table
CREATE TABLE public.visitor_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id uuid REFERENCES public.visitors(id) ON DELETE CASCADE NOT NULL,
  action_type text NOT NULL,
  action_detail text,
  page text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_actions ENABLE ROW LEVEL SECURITY;

-- Public can insert/update visitors (for tracking)
CREATE POLICY "Anyone can insert visitors" ON public.visitors FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update own visitor" ON public.visitors FOR UPDATE USING (true);
CREATE POLICY "Authenticated can read visitors" ON public.visitors FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can delete visitors" ON public.visitors FOR DELETE TO authenticated USING (is_admin());

-- Public can insert actions
CREATE POLICY "Anyone can insert actions" ON public.visitor_actions FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can read actions" ON public.visitor_actions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can delete actions" ON public.visitor_actions FOR DELETE TO authenticated USING (is_admin());

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.visitors;
ALTER PUBLICATION supabase_realtime ADD TABLE public.visitor_actions;
