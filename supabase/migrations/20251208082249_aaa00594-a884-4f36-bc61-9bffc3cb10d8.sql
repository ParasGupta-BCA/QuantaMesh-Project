-- Allow admins to view all orders
CREATE POLICY "Admins can view all orders"
ON public.orders
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all contact messages
CREATE POLICY "Admins can view all messages"
ON public.contact_messages
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));