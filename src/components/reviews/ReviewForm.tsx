import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { getSafeErrorMessage, logError } from "@/lib/errorMessages";

interface ReviewFormProps {
  orderId: string;
  customerName: string;
  onSuccess?: () => void;
}

export function ReviewForm({ orderId, customerName, onSuccess }: ReviewFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !reviewText.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from("reviews").insert({
        user_id: user.id,
        order_id: orderId,
        customer_name: customerName,
        rating,
        review_text: reviewText.trim(),
      });

      if (error) throw error;

      toast({
        title: "Review Submitted!",
        description: "Thank you! Your review will appear after approval.",
      });
      
      setReviewText("");
      setRating(5);
      onSuccess?.();
    } catch (error) {
      logError("Submit review", error);
      toast({
        title: "Error",
        description: getSafeErrorMessage(error, "Failed to submit review"),
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Your Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star
                size={28}
                className={`transition-colors ${
                  star <= (hoverRating || rating)
                    ? "fill-primary text-primary"
                    : "text-muted-foreground"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Your Review</label>
        <Textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Tell us about your experience..."
          rows={4}
          maxLength={500}
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          {reviewText.length}/500 characters
        </p>
      </div>

      <Button type="submit" disabled={submitting || !reviewText.trim()}>
        {submitting ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
}
