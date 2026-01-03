import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ApprovedReview {
  id: string;
  customer_name: string;
  rating: number;
  review_text: string;
  created_at: string;
}

export function useApprovedReviews() {
  const [reviews, setReviews] = useState<ApprovedReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("id, customer_name, rating, review_text, created_at")
        .eq("is_approved", true)
        .order("created_at", { ascending: false })
        .limit(10);

      if (!error && data) {
        setReviews(data);
      }
      setLoading(false);
    };

    fetchReviews();
  }, []);

  return { reviews, loading };
}
