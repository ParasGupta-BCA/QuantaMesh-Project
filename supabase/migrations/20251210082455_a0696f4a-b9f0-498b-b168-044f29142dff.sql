-- Drop the existing permissive INSERT policy
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;

-- Create new INSERT policy requiring authentication
CREATE POLICY "Authenticated users can create orders" 
ON public.orders 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Make user_id non-nullable to ensure all orders are associated with a user
ALTER TABLE public.orders ALTER COLUMN user_id SET NOT NULL;