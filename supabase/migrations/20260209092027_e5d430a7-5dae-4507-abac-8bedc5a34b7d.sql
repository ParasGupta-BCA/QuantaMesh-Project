
-- Cold outreach prospects table
CREATE TABLE public.cold_outreach (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  job_title text NOT NULL,
  company_name text NOT NULL,
  email text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  emails_sent integer NOT NULL DEFAULT 0,
  last_sent_at timestamptz,
  added_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cold_outreach ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage cold outreach"
ON public.cold_outreach
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_cold_outreach_status ON public.cold_outreach(status);
CREATE INDEX idx_cold_outreach_email ON public.cold_outreach(email);

CREATE TRIGGER update_cold_outreach_updated_at
BEFORE UPDATE ON public.cold_outreach
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
