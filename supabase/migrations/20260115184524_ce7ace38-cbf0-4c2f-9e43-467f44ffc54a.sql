-- Create a table for admin-uploaded videos
CREATE TABLE public.admin_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  video_path TEXT NOT NULL,
  thumbnail_path TEXT,
  category TEXT DEFAULT 'general',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.admin_videos ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (everyone can view active videos)
CREATE POLICY "Anyone can view active videos" 
ON public.admin_videos 
FOR SELECT 
USING (is_active = true);

-- Create policy for admin full access
CREATE POLICY "Admins can manage videos" 
ON public.admin_videos 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_admin_videos_updated_at
BEFORE UPDATE ON public.admin_videos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for admin videos
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('admin-videos', 'admin-videos', true, 104857600);

-- Storage policies for admin videos bucket
CREATE POLICY "Anyone can view admin videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'admin-videos');

CREATE POLICY "Admins can upload videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'admin-videos' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update videos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'admin-videos' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'admin-videos' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);