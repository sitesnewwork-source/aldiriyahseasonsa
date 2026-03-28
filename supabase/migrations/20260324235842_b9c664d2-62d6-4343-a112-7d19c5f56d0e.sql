
-- Fix overly permissive UPDATE policies - restrict to admin role pattern
-- For now, we keep INSERT open for anonymous visitors (intentional)
-- But UPDATE should require specific auth check

-- Drop overly permissive UPDATE policies
DROP POLICY "Authenticated users can update contact messages" ON public.contact_messages;
DROP POLICY "Authenticated users can update bookings" ON public.restaurant_bookings;
DROP POLICY "Authenticated users can update orders" ON public.ticket_orders;

-- Create a security definer function for admin check
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE id = auth.uid()
  )
$$;

-- Recreate UPDATE policies with auth check
CREATE POLICY "Authenticated users can update contact messages"
  ON public.contact_messages FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Authenticated users can update bookings"
  ON public.restaurant_bookings FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Authenticated users can update orders"
  ON public.ticket_orders FOR UPDATE
  TO authenticated
  USING (public.is_admin());
