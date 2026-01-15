import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AdminVideo {
  id: string;
  title: string;
  description: string | null;
  video_path: string;
  thumbnail_path: string | null;
  category: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export function useAdminVideos() {
  const [videos, setVideos] = useState<AdminVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const { data, error } = await supabase
          .from('admin_videos')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (error) throw error;
        setVideos(data as AdminVideo[]);
      } catch (err) {
        console.error('Error fetching admin videos:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const getVideoUrl = (path: string) => {
    const { data } = supabase.storage.from('admin-videos').getPublicUrl(path);
    return data.publicUrl;
  };

  return { videos, loading, error, getVideoUrl };
}
