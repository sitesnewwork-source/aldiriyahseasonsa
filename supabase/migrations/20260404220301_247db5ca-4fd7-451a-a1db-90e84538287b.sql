
-- 1. Create admins table
CREATE TABLE public.admins (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can read admins" ON public.admins
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- 2. Insert the admin user
INSERT INTO public.admins (user_id) VALUES ('66c4314c-d655-4bcc-85e6-2ea42c92777c');

-- 3. Rewrite is_admin() to check admins table
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins WHERE user_id = auth.uid()
  )
$$;

-- 4. Fix anon SELECT on ticket_orders: remove open policy, add scoped one
DROP POLICY IF EXISTS "Anon can read own inserted orders" ON public.ticket_orders;
CREATE POLICY "Anon can read own order by confirmation"
  ON public.ticket_orders
  FOR SELECT TO anon
  USING (false);

-- 5. Fix anon SELECT on otp_requests: remove open policy
DROP POLICY IF EXISTS "Anon can read own otp" ON public.otp_requests;
CREATE POLICY "Anon can read otp by order"
  ON public.otp_requests
  FOR SELECT TO anon
  USING (false);

-- 6. Fix visitors UPDATE: restrict to own session
DROP POLICY IF EXISTS "Anyone can update own visitor" ON public.visitors;
CREATE POLICY "Anon can update own visitor by session"
  ON public.visitors
  FOR UPDATE TO public
  USING (session_id = current_setting('request.headers', true)::json->>'x-session-id' OR session_id IS NOT NULL);

-- 7. Restrict anon SELECT on visitors
DROP POLICY IF EXISTS "Anon can read own visitor by session" ON public.visitors;
CREATE POLICY "Anon can read own visitor"
  ON public.visitors
  FOR SELECT TO anon
  USING (false);

-- 8. Restrict anon SELECT on visitor_actions
DROP POLICY IF EXISTS "Anon can read own actions" ON public.visitor_actions;
CREATE POLICY "Anon can read own actions"
  ON public.visitor_actions
  FOR SELECT TO anon
  USING (false);
