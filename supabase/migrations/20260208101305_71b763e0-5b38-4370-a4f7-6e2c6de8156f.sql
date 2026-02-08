
-- Add admin_name column to messages table so clients can see who replied
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS admin_name text;

-- Create AI settings table for admin customization
CREATE TABLE public.ai_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  personality text NOT NULL DEFAULT 'professional and friendly',
  knowledge_base text NOT NULL DEFAULT '',
  greeting_message text NOT NULL DEFAULT 'Hello! How can I help you today?',
  max_response_length integer NOT NULL DEFAULT 150,
  is_active boolean NOT NULL DEFAULT true,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings (edge function needs it)
CREATE POLICY "AI settings are readable by everyone"
  ON public.ai_settings FOR SELECT USING (true);

-- Only admins can update
CREATE POLICY "Admins can update AI settings"
  ON public.ai_settings FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can insert AI settings"
  ON public.ai_settings FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Insert default settings row
INSERT INTO public.ai_settings (personality, knowledge_base, greeting_message, max_response_length)
VALUES (
  'You are professional, friendly, and concise. You speak warmly but get to the point quickly.',
  'Quanta Mesh specializes in Android App Publishing to Google Play Store (starting at $25) and CGI Video Advertisement Production. Typical app publishing turnaround: 24-48 hours. CGI video ads are custom-quoted.',
  'Hello! Welcome to Quanta Mesh. How can I help you today?',
  150
);
