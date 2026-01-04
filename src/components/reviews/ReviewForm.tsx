import { useState } from "react";
import { Star } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { getSafeErrorMessage, logError } from "@/lib/errorMessages";

// Zod schema for review validation
const reviewSchema = z.object({
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
  reviewText: z.string()
    .trim()
    .min(10, "Review must be at least 10 characters")
    .max(500, "Review must be less than 500 characters"),
  orderId: z.string().uuid("Invalid order ID"),
  customerName: z.string().trim().min(1, "Customer name is required").max(100, "Customer name must be less than 100 characters"),
});

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
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit a review.",
        variant: "destructive",
      });
      return;
    }

    // Validate with Zod schema
    const validationResult = reviewSchema.safeParse({
      rating,
      reviewText: reviewText.trim(),
      orderId,
      customerName: customerName || "Valued Customer",
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      setValidationError(firstError.message);
      toast({
        title: "Validation Error",
        description: firstError.message,
        variant: "destructive",
      });
      return;
    }

    const validatedData = validationResult.data;

    setSubmitting(true);
    try {
      const { data, error } = await supabase.from("reviews").insert({
        user_id: user.id,
        order_id: validatedData.orderId,
        customer_name: validatedData.customerName,
        rating: validatedData.rating,
        review_text: validatedData.reviewText,
      }).select();

      if (error) {
        logError("Supabase insert error", error);
        throw error;
      }

      // Send email notification to admins (fire and forget)
      supabase.functions.invoke("send-review-notification", {
        body: {
          customerName: validatedData.customerName,
          rating: validatedData.rating,
          reviewText: validatedData.reviewText,
          orderId: validatedData.orderId,
        },
      }).then(({ error: notifError }) => {
        if (notifError) {
          logError("Failed to send review notification", notifError);
        }
      });

      toast({
        title: "Review Submitted!",
        description: "Thank you! Your review will appear after approval.",
        variant: "default",
        className: "bg-green-500 text-white border-green-600",
      });

      setReviewText("");
      setRating(5);
      setValidationError(null);
      onSuccess?.();
    } catch (error: any) {
      logError("Submit review", error);
      toast({
        title: "Submission Failed",
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
                className={`transition-colors ${star <= (hoverRating || rating)
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
          onChange={(e) => {
            setReviewText(e.target.value);
            setValidationError(null);
          }}
          placeholder="Tell us about your experience (minimum 10 characters)..."
          rows={4}
          maxLength={500}
          required
        />
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-muted-foreground">
            {reviewText.length}/500 characters (min 10)
          </p>
          {validationError && (
            <p className="text-xs text-destructive">{validationError}</p>
          )}
        </div>
      </div>

      <Button type="submit" disabled={submitting || reviewText.trim().length < 10}>
        {submitting ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
}
