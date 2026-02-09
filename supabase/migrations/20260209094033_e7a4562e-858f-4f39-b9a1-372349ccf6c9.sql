
-- Cold email template settings (single row, admin-editable)
CREATE TABLE public.cold_email_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_items jsonb NOT NULL DEFAULT '[
    {"name": "Play Store App Publishing", "desc": "End-to-end app listing optimization & publishing on Google Play Store"},
    {"name": "ASO Optimization", "desc": "Keyword research, screenshot design & listing optimization for maximum visibility"},
    {"name": "CGI Ad Creation", "desc": "High-quality CGI advertisements that drive engagement & conversions"},
    {"name": "App Store Strategy", "desc": "Complete strategy for app growth, ratings & user acquisition"}
  ]'::jsonb,
  team_members jsonb NOT NULL DEFAULT '[
    {"name": "Paras Gupta", "role": "Founder & Lead Developer"},
    {"name": "Sanchit Saggi", "role": "Co-Founder & Business Strategist"}
  ]'::jsonb,
  cta_text text NOT NULL DEFAULT 'Let''s Talk Growth →',
  cta_url text NOT NULL DEFAULT 'https://quantamesh.lovable.app/contact',
  tagline text NOT NULL DEFAULT 'DIGITAL GROWTH PARTNER',
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

ALTER TABLE public.cold_email_settings ENABLE ROW LEVEL SECURITY;

-- Admins can read
CREATE POLICY "Admins can read cold email settings"
  ON public.cold_email_settings FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update
CREATE POLICY "Admins can update cold email settings"
  ON public.cold_email_settings FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can insert (for initial seed)
CREATE POLICY "Admins can insert cold email settings"
  ON public.cold_email_settings FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Insert default row
INSERT INTO public.cold_email_settings (id) VALUES (gen_random_uuid());

-- Add clicked_at to cold_outreach
ALTER TABLE public.cold_outreach ADD COLUMN IF NOT EXISTS clicked_at timestamptz;
