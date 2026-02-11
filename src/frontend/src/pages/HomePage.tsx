import { Link } from '@tanstack/react-router';
import { useGetAllReviews, useGetAllBikes, useGetAllArticles } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import LatestLaunchesCarousel from '../components/LatestLaunchesCarousel';
import CategoryGrid from '../components/CategoryGrid';
import { Star, TrendingUp, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const { data: reviews, isLoading: reviewsLoading } = useGetAllReviews();
  const { data: bikes, isLoading: bikesLoading } = useGetAllBikes();
  const { data: articles, isLoading: articlesLoading } = useGetAllArticles();

  // Get trending bikes (top rated reviews)
  const trendingReviews = reviews
    ?.sort((a, b) => {
      const avgA = (a.score.performance + a.score.design + a.score.comfort + a.score.value) / 4;
      const avgB = (b.score.performance + b.score.design + b.score.comfort + b.score.value) / 4;
      return avgB - avgA;
    })
    .slice(0, 6);

  // Get latest launches (recent articles in news/electric categories)
  const latestLaunches = articles
    ?.filter((a) => a.category === 'news' || a.category === 'electric')
    .sort((a, b) => Number(b.createdAt - a.createdAt))
    .slice(0, 8);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background via-muted/20 to-background overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 dark:opacity-5 bg-cover bg-center"
          style={{ backgroundImage: 'url(/assets/generated/hero-bg.dim_1920x1080.png)' }}
        />
        <div className="container relative py-20 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Global Motorcycle News & Reviews
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Professional, data-driven insights on the latest bikes, technology, and racing from around the world.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link to="/category/$categoryId" params={{ categoryId: 'reviews' }}>
                  Explore Reviews
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/compare">
                  Compare Bikes
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Launches Carousel */}
      <section className="container py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Latest Launches</h2>
            <p className="text-muted-foreground mt-2">Stay updated with the newest motorcycles</p>
          </div>
          <Button variant="ghost" asChild>
            <Link to="/category/$categoryId" params={{ categoryId: 'news' }}>
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        {articlesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : (
          <LatestLaunchesCarousel launches={latestLaunches || []} />
        )}
      </section>

      {/* Trending Bikes */}
      <section className="bg-muted/30 py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <TrendingUp className="h-8 w-8" />
                Trending Bikes
              </h2>
              <p className="text-muted-foreground mt-2">Top-rated motorcycles this month</p>
            </div>
            <Button variant="ghost" asChild>
              <Link to="/category/$categoryId" params={{ categoryId: 'reviews' }}>
                All Reviews <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          {reviewsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-80" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingReviews?.map((review) => {
                const bike = bikes?.find((b) => b.id === review.bikeId);
                const avgScore = (review.score.performance + review.score.design + review.score.comfort + review.score.value) / 4;
                return (
                  <Card key={review.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="line-clamp-2">{review.title}</CardTitle>
                          {bike && (
                            <p className="text-sm text-muted-foreground mt-1">{bike.brand} • {bike.name}</p>
                          )}
                        </div>
                        <Badge variant="secondary" className="ml-2 gap-1">
                          <Star className="h-3 w-3 fill-current" />
                          {avgScore.toFixed(1)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                        {review.content.substring(0, 150)}...
                      </p>
                      <Button variant="outline" size="sm" asChild className="w-full">
                        <Link to="/review/$reviewId" params={{ reviewId: review.id.toString() }}>
                          Read Review
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="container py-16">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Explore Categories</h2>
          <p className="text-muted-foreground mt-2">Discover content tailored to your interests</p>
        </div>
        <CategoryGrid />
      </section>
    </div>
  );
}
