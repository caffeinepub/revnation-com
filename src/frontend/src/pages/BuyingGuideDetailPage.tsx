import { useParams, Link } from '@tanstack/react-router';
import { useGetAllArticles } from '../hooks/useQueries';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BuyingGuideDetailPage() {
  const { guideId } = useParams({ from: '/guide/$guideId' });
  const { data: articles, isLoading } = useGetAllArticles();

  const guide = articles?.find((a) => a.id.toString() === guideId && a.category === 'buyingGuides');

  if (isLoading) {
    return (
      <div className="container py-12">
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-64 mb-8" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Guide not found</h1>
        <Button asChild>
          <Link to="/category/$categoryId" params={{ categoryId: 'buyingGuides' }}>
            Back to Buying Guides
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link to="/category/$categoryId" params={{ categoryId: 'buyingGuides' }}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Buying Guides
        </Link>
      </Button>

      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline">Buying Guide</Badge>
            <Badge variant="outline">{guide.region}</Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{guide.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>By {guide.author}</span>
            <span>•</span>
            <span>{new Date(Number(guide.createdAt) / 1000000).toLocaleDateString()}</span>
          </div>
        </div>

        <Card className="mb-8 bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Quick Checklist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>Determine your riding style and primary use case</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>Set a realistic budget including insurance and maintenance</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>Consider seat height and weight for your comfort</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>Research reliability and maintenance costs</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>Test ride multiple options before deciding</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Separator className="mb-8" />

        <div className="prose prose-lg prose-neutral dark:prose-invert max-w-none">
          <p className="leading-relaxed whitespace-pre-wrap">{guide.content}</p>
        </div>
      </div>
    </div>
  );
}
