
-- Re-add anon SELECT on visitors (needed for visitor tracking, trackVisitorAction, heartbeat)
DROP POLICY IF EXISTS "Anon can read own visitor" ON public.visitors;
CREATE POLICY "Anon can read own visitor"
  ON public.visitors
  FOR SELECT TO anon
  USING (true);

-- Re-add anon SELECT on visitor_actions
DROP POLICY IF EXISTS "Anon can read own actions" ON public.visitor_actions;
CREATE POLICY "Anon can read own actions"
  ON public.visitor_actions
  FOR SELECT TO anon
  USING (true);
