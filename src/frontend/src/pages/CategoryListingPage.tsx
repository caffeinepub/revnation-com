import { useParams } from '@tanstack/react-router';
import { useGetAllArticles, useGetAllReviews } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from '@tanstack/react-router';
import RegionFilter from '../components/RegionFilter';
import { useState } from 'react';
import type { Region } from '../backend';
import { Star } from 'lucide-react';

export default function CategoryListingPage() {
  const { categoryId } = useParams({ from: '/category/$categoryId' });
  const { data: articles, isLoading: articlesLoading } = useGetAllArticles();
  const { data: reviews, isLoading: reviewsLoading } = useGetAllReviews();
  const [selectedRegion, setSelectedRegion] = useState<Region | 'all'>('all');

  const isLoading = articlesLoading || reviewsLoading;

  // Filter content based on category and region
  const filteredContent = (() => {
    if (categoryId === 'reviews') {
      let filtered = reviews || [];
      if (selectedRegion !== 'all') {
        filtered = filtered.filter((r) => r.region === selectedRegion);
      }
      return filtered.sort((a, b) => Number(b.createdAt - a.createdAt));
    } else {
      let filtered = (articles || []).filter((a) => a.category === categoryId);
      if (selectedRegion !== 'all') {
        filtered = filtered.filter((a) => a.region === selectedRegion);
      }
      return filtered.sort((a, b) => Number(b.createdAt - a.createdAt));
    }
  })();

  const categoryLabels: Record<string, string> = {
    news: 'News',
    reviews: 'Reviews',
    electric: 'Electric',
    racing: 'Racing',
    concepts: 'Concepts',
    buyingGuides: 'Buying Guides',
  };

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          {categoryLabels[categoryId] || categoryId}
        </h1>
        <p className="text-muted-foreground">
          {categoryId === 'reviews'
            ? 'In-depth motorcycle reviews with expert analysis'
            : `Latest ${categoryLabels[categoryId]?.toLowerCase() || categoryId} from around the world`}
        </p>
      </div>

      <RegionFilter selectedRegion={selectedRegion} onRegionChange={setSelectedRegion} />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : filteredContent.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No content available in this category yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {filteredContent.map((item) => {
            const isReview = 'score' in item;
            const avgScore = isReview
              ? (item.score.performance + item.score.design + item.score.comfort + item.score.value) / 4
              : 0;

            return (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="line-clamp-2">{item.title}</CardTitle>
                    <div className="flex flex-col gap-1 shrink-0">
                      <Badge variant="outline">{item.region}</Badge>
                      {isReview && (
                        <Badge variant="secondary" className="gap-1">
                          <Star className="h-3 w-3 fill-current" />
                          {avgScore.toFixed(1)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {item.content.substring(0, 150)}...
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">By {item.author}</p>
                    <Button variant="outline" size="sm" asChild>
                      {isReview ? (
                        <Link to="/review/$reviewId" params={{ reviewId: item.id.toString() }}>
                          Read More
                        </Link>
                      ) : categoryId === 'buyingGuides' ? (
                        <Link to="/guide/$guideId" params={{ guideId: item.id.toString() }}>
                          Read More
                        </Link>
                      ) : (
                        <Link to="/article/$articleId" params={{ articleId: item.id.toString() }}>
                          Read More
                        </Link>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
