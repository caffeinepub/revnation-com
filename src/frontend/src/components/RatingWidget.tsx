import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { useGetReviewRatings, useRateReview } from '../hooks/useQueries';
import { useCurrentUser } from '../hooks/useCurrentUser';
import RequireAuthAction from './RequireAuthAction';

interface RatingWidgetProps {
  reviewId: bigint;
}

export default function RatingWidget({ reviewId }: RatingWidgetProps) {
  const { data: ratings, isLoading } = useGetReviewRatings(reviewId);
  const rateReview = useRateReview();
  const { isAuthenticated } = useCurrentUser();
  const [hoveredRating, setHoveredRating] = useState(0);

  const avgRating = ratings && ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
    : 0;

  const handleRate = async (rating: number) => {
    await rateReview.mutateAsync({ reviewId, rating });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Rating</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-4xl font-bold">{avgRating.toFixed(1)}</div>
          <div className="flex items-center justify-center gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-5 w-5 ${star <= Math.round(avgRating) ? 'fill-primary text-primary' : 'text-muted-foreground'}`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {ratings?.length || 0} {ratings?.length === 1 ? 'rating' : 'ratings'}
          </p>
        </div>

        <RequireAuthAction action="rate">
          <div className="space-y-2">
            <p className="text-sm font-medium text-center">Rate this review</p>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRate(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  disabled={rateReview.isPending}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= (hoveredRating || 0)
                        ? 'fill-primary text-primary'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </RequireAuthAction>
      </CardContent>
    </Card>
  );
}
