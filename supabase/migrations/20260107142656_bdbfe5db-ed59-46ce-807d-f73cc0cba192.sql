-- Create leads table to store captured leads
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'popup', -- popup, google_search, manual
  status TEXT NOT NULL DEFAULT 'new', -- new, contacted, qualified, converted, unsubscribed
  niche TEXT, -- app_developers, startups, agencies
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_contacted_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT leads_email_unique UNIQUE (email)
);

-- Create email_sequences table to track automated emails
CREATE TABLE public.email_sequences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  sequence_type TEXT NOT NULL, -- welcome, follow_up_1, follow_up_2, follow_up_3
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'sent' -- sent, opened, clicked, bounced
);

-- Create ai_generated_leads table for leads found via Google search
CREATE TABLE public.ai_generated_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  search_query TEXT NOT NULL,
  results JSONB NOT NULL DEFAULT '[]'::jsonb,
  processed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generated_leads ENABLE ROW LEVEL SECURITY;

-- Admin-only policies for leads
CREATE POLICY "Admins can view all leads" 
  ON public.leads FOR SELECT 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert leads" 
  ON public.leads FOR INSERT 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update leads" 
  ON public.leads FOR UPDATE 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete leads" 
  ON public.leads FOR DELETE 
  USING (public.has_role(auth.uid(), 'admin'));

-- Public can insert leads (for popup capture - no auth required)
CREATE POLICY "Public can insert leads via popup" 
  ON public.leads FOR INSERT 
  WITH CHECK (true);

-- Admin-only policies for email_sequences
CREATE POLICY "Admins can view all email sequences" 
  ON public.email_sequences FOR SELECT 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert email sequences" 
  ON public.email_sequences FOR INSERT 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update email sequences" 
  ON public.email_sequences FOR UPDATE 
  USING (public.has_role(auth.uid(), 'admin'));

-- Admin-only policies for ai_generated_leads
CREATE POLICY "Admins can view all ai generated leads" 
  ON public.ai_generated_leads FOR SELECT 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert ai generated leads" 
  ON public.ai_generated_leads FOR INSERT 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update ai generated leads" 
  ON public.ai_generated_leads FOR UPDATE 
  USING (public.has_role(auth.uid(), 'admin'));

-- Add indexes for performance
CREATE INDEX idx_leads_email ON public.leads(email);
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_source ON public.leads(source);
CREATE INDEX idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX idx_email_sequences_lead_id ON public.email_sequences(lead_id);

-- Add trigger for updated_at
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();