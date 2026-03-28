CREATE POLICY "Admin can delete contact_messages" ON public.contact_messages FOR DELETE TO authenticated USING (is_admin());
CREATE POLICY "Admin can delete restaurant_bookings" ON public.restaurant_bookings FOR DELETE TO authenticated USING (is_admin());
CREATE POLICY "Admin can delete ticket_orders" ON public.ticket_orders FOR DELETE TO authenticated USING (is_admin());