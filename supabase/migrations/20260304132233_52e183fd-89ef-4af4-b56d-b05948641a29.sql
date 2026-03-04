
-- Service pricing table for admin-managed pricing
CREATE TABLE public.service_pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_type text NOT NULL,
  package_name text NOT NULL,
  description text,
  price numeric NOT NULL DEFAULT 0,
  features jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.service_pricing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active pricing" ON public.service_pricing
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage pricing" ON public.service_pricing
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add message_type and metadata to messages for order requests
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS message_type text DEFAULT 'text';
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS metadata jsonb;
