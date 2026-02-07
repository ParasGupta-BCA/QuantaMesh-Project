import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featured_image: string | null;
  category: string;
  tags: string[];
  author_name: string;
  is_published: boolean;
  published_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  reading_time_minutes: number;
  created_at: string;
  updated_at: string;
}

export function useBlogPosts(category?: string) {
  return useQuery({
    queryKey: ["blog-posts", category],
    queryFn: async () => {
      let query = supabase
        .from("blog_posts")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false });

      if (category && category !== "all") {
        query = query.eq("category", category);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as BlogPost[];
    },
  });
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();

      if (error) throw error;
      return data as BlogPost;
    },
    enabled: !!slug,
  });
}

export function useRecentBlogPosts(limit: number = 3) {
  return useQuery({
    queryKey: ["blog-posts-recent", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, slug, title, excerpt, featured_image, category, published_at, reading_time_minutes")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as Partial<BlogPost>[];
    },
  });
}

export const blogCategories = [
  { value: "all", label: "All Posts" },
  { value: "app-publishing", label: "App Publishing" },
  { value: "google-play", label: "Google Play Policies" },
  { value: "cgi-ads", label: "CGI & Video Ads" },
  { value: "industry-updates", label: "Industry Updates" },
  { value: "tutorials", label: "Tutorials & ASO" },
  { value: "app-monetization", label: "App Monetization" },
  { value: "app-security", label: "App Security" },
];
