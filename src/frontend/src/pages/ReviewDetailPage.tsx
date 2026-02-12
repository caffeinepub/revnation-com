import { useParams, Link } from '@tanstack/react-router';
import { useGetAllReviews, useGetAllBikes } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import ScoreBreakdown from '../components/ScoreBreakdown';
import CommentsPanel from '../components/CommentsPanel';
import RatingWidget from '../components/RatingWidget';
import LongFormContent from '../components/LongFormContent';
import TableOfContents from '../components/TableOfContents';
import MobileToc from '../components/MobileToc';
import { useTableOfContents } from '../hooks/useTableOfContents';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRef } from 'react';

export default function ReviewDetailPage() {
  const { reviewId } = useParams({ from: '/review/$reviewId' });
  const { data: reviews, isLoading: reviewsLoading } = useGetAllReviews();
  const { data: bikes, isLoading: bikesLoading } = useGetAllBikes();
  const contentRef = useRef<HTMLDivElement>(null);
  const { headings, activeId, scrollToHeading } = useTableOfContents(contentRef);

  const review = reviews?.find((r) => r.id.toString() === reviewId);
  const bike = bikes?.find((b) => b.id === review?.bikeId);

  if (reviewsLoading || bikesLoading) {
    return (
      <div className="container py-12">
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-64 mb-8" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!review) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Review not found</h1>
        <Button asChild>
          <Link to="/category/$categoryId" params={{ categoryId: 'reviews' }}>
            Back to Reviews
          </Link>
        </Button>
      </div>
    );
  }

  const avgScore = (review.score.performance + review.score.design + review.score.comfort + review.score.value) / 4;

  return (
    <div className="container py-12">
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link to="/category/$categoryId" params={{ categoryId: 'reviews' }}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Reviews
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_250px_2fr_250px] gap-8">
        {/* Left spacer for desktop TOC */}
        <div className="hidden lg:block">
          <div className="sticky top-24">
            <TableOfContents headings={headings} activeId={activeId} onHeadingClick={scrollToHeading} />
          </div>
        </div>

        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Mobile TOC */}
          <MobileToc headings={headings} activeId={activeId} onHeadingClick={scrollToHeading} />

          {/* Header */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-4xl font-bold tracking-tight mb-2">{review.title}</h1>
                {bike && (
                  <p className="text-xl text-muted-foreground">
                    {bike.brand} {bike.name}
                  </p>
                )}
              </div>
              <Badge variant="outline" className="ml-4">
                {review.region}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>By {review.author}</span>
              <span>•</span>
              <span>{new Date(Number(review.createdAt) / 1000000).toLocaleDateString()}</span>
            </div>
          </div>

          <Separator />

          {/* Content */}
          <div ref={contentRef}>
            <LongFormContent content={review.content} />
          </div>

          {bike && (
            <>
              <Separator />
              <Card>
                <CardHeader>
                  <CardTitle>Specifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p>{bike.specs}</p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          <Separator />

          {/* Comments */}
          <CommentsPanel reviewId={review.id} />
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <div className="sticky top-24">
            <ScoreBreakdown score={review.score} overallScore={avgScore} />
            <div className="mt-6">
              <RatingWidget reviewId={review.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
