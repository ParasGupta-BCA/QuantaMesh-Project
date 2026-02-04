-- Ensure leads table doesn't allow unauthenticated SELECT access
-- First, verify RLS is enabled (it should be)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- The existing policies are:
-- 1. "Admins can delete leads" - DELETE for admins only
-- 2. "Admins can insert leads" - INSERT for admins only  
-- 3. "Admins can update leads" - UPDATE for admins only
-- 4. "Admins can view all leads" - SELECT for admins only
-- 5. "Public can insert leads via popup" - INSERT with true (needed for popup)

-- Since the leads table already has proper SELECT policies (only admins can view),
-- and there's no public SELECT policy, the data is secure.
-- The public INSERT is intentional for the lead capture popup.

-- However, let's add rate limiting protection by creating an index on created_at
-- to help with queries that might want to limit recent submissions
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);

-- Add index on email for faster duplicate checks
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);