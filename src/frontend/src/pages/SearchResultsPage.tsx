import { useSearch, Link } from '@tanstack/react-router';
import { useGetAllArticles, useGetAllReviews, useGetAllBikes } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Star } from 'lucide-react';
import { useMemo } from 'react';

export default function SearchResultsPage() {
  const searchParams = useSearch({ from: '/search' });
  const query = (searchParams as any).q || '';
  
  const { data: articles } = useGetAllArticles();
  const { data: reviews } = useGetAllReviews();
  const { data: bikes } = useGetAllBikes();

  // Search results with brand grouping
  const { searchResults, matchingBrands } = useMemo(() => {
    if (!query.trim()) return { searchResults: [], matchingBrands: [] };
    
    const lowerQuery = query.toLowerCase();
    const results: Array<{ type: string; id: string; title: string; content: string; category?: string; score?: number }> = [];
    const brandSet = new Set<string>();

    articles?.forEach((article) => {
      if (
        article.title.toLowerCase().includes(lowerQuery) ||
        article.content.toLowerCase().includes(lowerQuery)
      ) {
        results.push({
          type: 'Article',
          id: article.id.toString(),
          title: article.title,
          content: article.content,
          category: article.category,
        });
      }
    });

    reviews?.forEach((review) => {
      if (
        review.title.toLowerCase().includes(lowerQuery) ||
        review.content.toLowerCase().includes(lowerQuery)
      ) {
        const avgScore = (review.score.performance + review.score.design + review.score.comfort + review.score.value) / 4;
        results.push({
          type: 'Review',
          id: review.id.toString(),
          title: review.title,
          content: review.content,
          score: avgScore,
        });
      }
    });

    bikes?.forEach((bike) => {
      if (
        bike.name.toLowerCase().includes(lowerQuery) ||
        bike.brand.toLowerCase().includes(lowerQuery) ||
        bike.specs.toLowerCase().includes(lowerQuery)
      ) {
        results.push({
          type: 'Bike',
          id: bike.id.toString(),
          title: `${bike.brand} ${bike.name}`,
          content: bike.specs,
        });
        
        // Track matching brands
        if (bike.brand.toLowerCase().includes(lowerQuery)) {
          brandSet.add(bike.brand);
        }
      }
    });

    return {
      searchResults: results,
      matchingBrands: Array.from(brandSet).sort(),
    };
  }, [query, articles, reviews, bikes]);

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Search className="h-8 w-8 text-muted-foreground" />
            <h1 className="text-3xl font-bold tracking-tight">Search Results</h1>
          </div>
          <p className="text-muted-foreground">
            {query ? `Found ${searchResults.length} results for "${query}"` : 'Enter a search query'}
          </p>
        </div>

        {/* Matching Brands Section */}
        {matchingBrands.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Matching Brands</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {matchingBrands.map((brand) => (
                  <Button key={brand} variant="outline" size="sm" asChild>
                    <Link
                      to="/brands/$brandId"
                      params={{ brandId: encodeURIComponent(brand.toLowerCase()) }}
                    >
                      {brand}
                    </Link>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {searchResults.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                {query ? 'No results found. Try different keywords.' : 'Start searching to see results.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {searchResults.map((result, index) => {
              // Determine route and params based on result type
              const getLinkProps = () => {
                if (result.type === 'Review') {
                  return {
                    to: '/review/$reviewId' as const,
                    params: { reviewId: result.id },
                  };
                } else if (result.type === 'Bike') {
                  return {
                    to: '/bike/$bikeId' as const,
                    params: { bikeId: result.id },
                  };
                } else if (result.category === 'buyingGuides') {
                  return {
                    to: '/guide/$guideId' as const,
                    params: { guideId: result.id },
                  };
                } else {
                  return {
                    to: '/article/$articleId' as const,
                    params: { articleId: result.id },
                  };
                }
              };

              const linkProps = getLinkProps();

              return (
                <Card key={`${result.type}-${result.id}-${index}`} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{result.type}</Badge>
                          {result.category && <Badge variant="secondary">{result.category}</Badge>}
                          {result.score && (
                            <Badge variant="secondary" className="gap-1">
                              <Star className="h-3 w-3 fill-current" />
                              {result.score.toFixed(1)}
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="line-clamp-2">{result.title}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {result.content.substring(0, 200)}...
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={linkProps.to} params={linkProps.params}>
                        View {result.type}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
