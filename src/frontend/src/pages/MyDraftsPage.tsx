import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, FileText, Star, Loader2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useGetMyDraftArticles, useGetMyDraftReviews, usePublishArticle, usePublishReview } from '../hooks/useQueries';
import { useCurrentUser } from '../hooks/useCurrentUser';

export default function MyDraftsPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useCurrentUser();
  const { data: draftArticles = [], isLoading: articlesLoading } = useGetMyDraftArticles();
  const { data: draftReviews = [], isLoading: reviewsLoading } = useGetMyDraftReviews();
  const publishArticle = usePublishArticle();
  const publishReview = usePublishReview();

  if (!isAuthenticated) {
    return (
      <div className="container max-w-4xl py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Sign In Required</h1>
        <p className="text-muted-foreground mb-6">
          You must be signed in to view your drafts.
        </p>
        <Button onClick={() => navigate({ to: '/' })}>Go Home</Button>
      </div>
    );
  }

  const isLoading = articlesLoading || reviewsLoading;
  const totalDrafts = draftArticles.length + draftReviews.length;

  const handlePublishArticle = async (articleId: bigint) => {
    try {
      await publishArticle.mutateAsync(articleId);
    } catch (error) {
      console.error('Failed to publish article:', error);
    }
  };

  const handlePublishReview = async (reviewId: bigint) => {
    try {
      await publishReview.mutateAsync(reviewId);
    } catch (error) {
      console.error('Failed to publish review:', error);
    }
  };

  return (
    <div className="container max-w-6xl py-8">
      <Button
        variant="ghost"
        size="sm"
        className="mb-6 gap-2"
        onClick={() => navigate({ to: '/' })}
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">My Drafts</h1>
        <p className="text-muted-foreground">
          Manage your unpublished articles and reviews
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : totalDrafts === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No drafts yet</h3>
            <p className="text-muted-foreground mb-6">
              Start creating content and save it as a draft to work on later.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => navigate({ to: '/create-article' })}>
                Create Article
              </Button>
              <Button variant="outline" onClick={() => navigate({ to: '/create-review' })}>
                Create Review
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Draft Articles */}
          {draftArticles.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5" />
                <h2 className="text-2xl font-bold">Draft Articles</h2>
                <Badge variant="secondary">{draftArticles.length}</Badge>
              </div>
              <div className="grid gap-4">
                {draftArticles.map((article) => (
                  <Card key={article.id.toString()}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">Draft</Badge>
                            <Badge>{article.category}</Badge>
                            <Badge variant="secondary">{article.region}</Badge>
                          </div>
                          <CardTitle className="text-xl mb-1">{article.title}</CardTitle>
                          <CardDescription>
                            By {article.author} • {new Date(Number(article.createdAt) / 1000000).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate({ to: '/article/$articleId', params: { articleId: article.id.toString() } })}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handlePublishArticle(article.id)}
                            disabled={publishArticle.isPending}
                          >
                            {publishArticle.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Publish'
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {article.content.substring(0, 200)}...
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {draftArticles.length > 0 && draftReviews.length > 0 && (
            <Separator />
          )}

          {/* Draft Reviews */}
          {draftReviews.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Star className="h-5 w-5" />
                <h2 className="text-2xl font-bold">Draft Reviews</h2>
                <Badge variant="secondary">{draftReviews.length}</Badge>
              </div>
              <div className="grid gap-4">
                {draftReviews.map((review) => {
                  const avgScore = Math.round(
                    (review.score.performance + review.score.design + review.score.comfort + review.score.value) / 4
                  );
                  return (
                    <Card key={review.id.toString()}>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">Draft</Badge>
                              <Badge variant="secondary">{review.region}</Badge>
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-primary text-primary" />
                                <span className="text-sm font-medium">{avgScore}/100</span>
                              </div>
                            </div>
                            <CardTitle className="text-xl mb-1">{review.title}</CardTitle>
                            <CardDescription>
                              By {review.author} • {new Date(Number(review.createdAt) / 1000000).toLocaleDateString()}
                            </CardDescription>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate({ to: '/review/$reviewId', params: { reviewId: review.id.toString() } })}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Preview
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handlePublishReview(review.id)}
                              disabled={publishReview.isPending}
                            >
                              {publishReview.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                'Publish'
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {review.content.substring(0, 200)}...
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
