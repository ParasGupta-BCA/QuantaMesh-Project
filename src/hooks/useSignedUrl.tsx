import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Cache for signed URLs to avoid regenerating unnecessarily
const urlCache = new Map<string, { url: string; expiresAt: number }>();

export function useSignedUrl(filePath: string | null | undefined) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!filePath) {
      setSignedUrl(null);
      return;
    }

    // Check if it's already a full URL (legacy data) - return as-is
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      setSignedUrl(filePath);
      return;
    }

    // Check cache
    const cached = urlCache.get(filePath);
    if (cached && cached.expiresAt > Date.now() + 60000) { // 1 min buffer
      setSignedUrl(cached.url);
      return;
    }

    const generateSignedUrl = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const { data, error: signError } = await supabase.storage
          .from('chat-attachments')
          .createSignedUrl(filePath, 3600); // 1 hour expiry

        if (signError) throw signError;

        const expiresAt = Date.now() + 3600 * 1000;
        urlCache.set(filePath, { url: data.signedUrl, expiresAt });
        setSignedUrl(data.signedUrl);
      } catch (err) {
        console.error('Error generating signed URL:', err);
        setError(err as Error);
        setSignedUrl(null);
      } finally {
        setLoading(false);
      }
    };

    generateSignedUrl();
  }, [filePath]);

  return { signedUrl, loading, error };
}

// Utility function to get signed URL synchronously (for immediate use)
export async function getSignedUrl(filePath: string): Promise<string | null> {
  if (!filePath) return null;
  
  // Check if it's already a full URL (legacy data)
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }

  // Check cache
  const cached = urlCache.get(filePath);
  if (cached && cached.expiresAt > Date.now() + 60000) {
    return cached.url;
  }

  try {
    const { data, error } = await supabase.storage
      .from('chat-attachments')
      .createSignedUrl(filePath, 3600);

    if (error) throw error;

    const expiresAt = Date.now() + 3600 * 1000;
    urlCache.set(filePath, { url: data.signedUrl, expiresAt });
    return data.signedUrl;
  } catch (err) {
    console.error('Error generating signed URL:', err);
    return null;
  }
}
