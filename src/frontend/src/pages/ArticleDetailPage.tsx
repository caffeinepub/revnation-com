import { useParams, Link } from '@tanstack/react-router';
import { useGetAllArticles } from '../hooks/useQueries';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ArticleDetailPage() {
  const { articleId } = useParams({ from: '/article/$articleId' });
  const { data: articles, isLoading } = useGetAllArticles();

  const article = articles?.find((a) => a.id.toString() === articleId);

  if (isLoading) {
    return (
      <div className="container py-12">
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-64 mb-8" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Article not found</h1>
        <Button asChild>
          <Link to="/">Back to Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link to="/category/$categoryId" params={{ categoryId: article.category }}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to {article.category}
        </Link>
      </Button>

      <article className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline">{article.category}</Badge>
            <Badge variant="outline">{article.region}</Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{article.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>By {article.author}</span>
            <span>•</span>
            <span>{new Date(Number(article.createdAt) / 1000000).toLocaleDateString()}</span>
          </div>
        </div>

        <Separator className="mb-8" />

        <div className="prose prose-lg prose-neutral dark:prose-invert max-w-none">
          <p className="leading-relaxed whitespace-pre-wrap">{article.content}</p>
        </div>
      </article>
    </div>
  );
}
