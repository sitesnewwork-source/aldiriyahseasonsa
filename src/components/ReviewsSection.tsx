import { useState } from "react";
import { motion } from "framer-motion";
import { Star, ThumbsUp, MessageSquare } from "lucide-react";
import { Review, generateAvatarUrl, getAverageRating } from "@/data/reviews";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface ReviewsSectionProps {
  reviews: Review[];
  title?: string;
}

const StarRating = ({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) => {
  const s = size === "lg" ? "w-5 h-5" : "w-3.5 h-3.5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${s} ${star <= rating ? "text-gold fill-gold" : "text-border"}`}
        />
      ))}
    </div>
  );
};

const ReviewCard = ({ review, index }: { review: Review; index: number }) => {
  const [helpful, setHelpful] = useState(review.helpful);
  const [voted, setVoted] = useState(false);
  const { initial, color } = generateAvatarUrl(review.userName, index);

  const handleHelpful = () => {
    if (!voted) {
      setHelpful((h) => h + 1);
      setVoted(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="border border-border rounded-lg p-4 sm:p-5 bg-card"
    >
      <div className="flex items-start gap-3 mb-3">
        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-cream font-bold text-sm flex-shrink-0"
          style={{ backgroundColor: color }}
        >
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-bold text-foreground truncate">{review.userName}</h4>
            <span className="text-[10px] text-muted-foreground flex-shrink-0">
              {format(new Date(review.date), "d MMM yyyy", { locale: ar })}
            </span>
          </div>
          <div className="mt-0.5">
            <StarRating rating={review.rating} />
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed mb-3">
        {review.comment}
      </p>

      <button
        onClick={handleHelpful}
        disabled={voted}
        className={`flex items-center gap-1.5 text-xs transition-colors ${
          voted
            ? "text-gold cursor-default"
            : "text-muted-foreground hover:text-foreground cursor-pointer"
        }`}
      >
        <ThumbsUp className="w-3.5 h-3.5" />
        <span>مفيد ({helpful})</span>
      </button>
    </motion.div>
  );
};

const ReviewsSection = ({ reviews, title = "تقييمات الزوار" }: ReviewsSectionProps) => {
  const [showAll, setShowAll] = useState(false);
  const avg = getAverageRating(reviews);
  const displayedReviews = showAll ? reviews : reviews.slice(0, 3);

  if (reviews.length === 0) return null;

  // Rating distribution
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct: (reviews.filter((r) => r.rating === star).length / reviews.length) * 100,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-card rounded-lg border border-border p-5 sm:p-8"
    >
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-gold" />
        <h2 className="font-display text-lg sm:text-xl font-bold text-foreground">{title}</h2>
      </div>
      <div className="h-px bg-border mb-5" />

      {/* Summary */}
      <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 mb-6">
        {/* Average */}
        <div className="text-center sm:text-right flex-shrink-0">
          <div className="text-4xl font-bold text-foreground">{avg.toFixed(1)}</div>
          <StarRating rating={Math.round(avg)} size="lg" />
          <p className="text-xs text-muted-foreground mt-1">{reviews.length} تقييم</p>
        </div>

        {/* Distribution bars */}
        <div className="flex-1 space-y-1.5">
          {distribution.map((d) => (
            <div key={d.star} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-3 text-center">{d.star}</span>
              <Star className="w-3 h-3 text-gold fill-gold" />
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${d.pct}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="h-full bg-gold rounded-full"
                />
              </div>
              <span className="text-[10px] text-muted-foreground w-6 text-left">{d.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-border mb-5" />

      {/* Reviews list */}
      <div className="space-y-3">
        {displayedReviews.map((review, i) => (
          <ReviewCard key={review.id} review={review} index={i} />
        ))}
      </div>

      {/* Show more */}
      {reviews.length > 3 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-4 w-full text-center text-sm text-gold hover:text-gold/80 font-medium transition-colors"
        >
          عرض جميع التقييمات ({reviews.length})
        </button>
      )}
    </motion.div>
  );
};

export default ReviewsSection;
