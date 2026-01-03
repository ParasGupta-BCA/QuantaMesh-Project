import { Star, Check, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Review } from "@/types/admin";
import { format } from "date-fns";

interface AdminReviewsProps {
  reviews: Review[];
  updateReviewApproval: (reviewId: string, approved: boolean) => Promise<void>;
  loading: boolean;
}

export function AdminReviews({ reviews, updateReviewApproval, loading }: AdminReviewsProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card rounded-xl p-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="glass-card rounded-xl p-12 text-center">
        <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
        <p className="text-muted-foreground">Reviews from customers will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="glass-card rounded-xl p-6 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold">{review.customer_name}</h3>
                <Badge
                  variant={review.is_approved ? "default" : "secondary"}
                  className={review.is_approved ? "bg-green-500/20 text-green-400" : ""}
                >
                  {review.is_approved ? (
                    <>
                      <Check className="w-3 h-3 mr-1" /> Approved
                    </>
                  ) : (
                    <>
                      <Clock className="w-3 h-3 mr-1" /> Pending
                    </>
                  )}
                </Badge>
              </div>
              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < review.rating ? "fill-primary text-primary" : "text-muted-foreground"}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                {format(new Date(review.created_at), "MMM d, yyyy 'at' h:mm a")}
              </p>
            </div>

            <div className="flex gap-2">
              {!review.is_approved && (
                <Button
                  size="sm"
                  onClick={() => updateReviewApproval(review.id, true)}
                  className="gap-1"
                >
                  <Check className="w-4 h-4" /> Approve
                </Button>
              )}
              {review.is_approved && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateReviewApproval(review.id, false)}
                  className="gap-1"
                >
                  <X className="w-4 h-4" /> Unapprove
                </Button>
              )}
            </div>
          </div>

          <p className="text-foreground/90">{review.review_text}</p>
        </div>
      ))}
    </div>
  );
}
