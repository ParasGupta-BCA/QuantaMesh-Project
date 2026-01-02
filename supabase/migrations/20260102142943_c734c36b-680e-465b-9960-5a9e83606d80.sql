-- Add file attachment columns to messages table
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS file_url TEXT,
ADD COLUMN IF NOT EXISTS file_name TEXT,
ADD COLUMN IF NOT EXISTS file_type TEXT,
ADD COLUMN IF NOT EXISTS file_size INTEGER;

-- Create storage bucket for chat attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('chat-attachments', 'chat-attachments', true, 52428800)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for chat attachments bucket

-- Anyone can view chat attachments (public bucket)
CREATE POLICY "Public can view chat attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'chat-attachments');

-- Authenticated users can upload to their own folder
CREATE POLICY "Authenticated users can upload chat attachments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'chat-attachments' 
  AND auth.role() = 'authenticated'
);

-- Users can update their own uploads
CREATE POLICY "Users can update own chat attachments"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'chat-attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own uploads
CREATE POLICY "Users can delete own chat attachments"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'chat-attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);