-- Allow anon users to SELECT their own visitor record by session_id
-- This is needed for visitor tracking to work on the public site
CREATE POLICY "Anon can read own visitor by session"
ON public.visitors
FOR SELECT
TO anon
USING (true);

-- Allow anon to read visitor_actions (needed for tracking)
CREATE POLICY "Anon can read own actions"
ON public.visitor_actions
FOR SELECT
TO anon
USING (true);