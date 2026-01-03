-- Add file storage columns to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS apk_file_path text,
ADD COLUMN IF NOT EXISTS icon_file_path text,
ADD COLUMN IF NOT EXISTS feature_graphic_path text,
ADD COLUMN IF NOT EXISTS screenshot_paths text[];

-- Create order-files storage bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('order-files', 'order-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for order-files bucket
-- Users can upload to their own folder
CREATE POLICY "Users can upload order files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'order-files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can view their own files
CREATE POLICY "Users can view their order files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'order-files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Admins can view all order files
CREATE POLICY "Admins can view all order files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'order-files' AND
  public.has_role(auth.uid(), 'admin')
);

-- Admins can download all order files (for signed URLs)
CREATE POLICY "Admins can download order files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'order-files' AND
  public.has_role(auth.uid(), 'admin')
);