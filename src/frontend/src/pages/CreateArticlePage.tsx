import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Loader2, Save, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import RequireAuthAction from '../components/RequireAuthAction';
import RichTextEditor from '../components/RichTextEditor';
import { useCreateOrSaveArticle } from '../hooks/useQueries';
import { Category, Region, ContentStatus, ContentType } from '../backend';
import { toast } from 'sonner';

const categoryOptions = [
  { value: 'news', label: 'News' },
  { value: 'electric', label: 'Electric' },
  { value: 'racing', label: 'Racing' },
  { value: 'concepts', label: 'Concepts' },
];

const regionOptions = [
  { value: 'asia', label: 'Asia' },
  { value: 'europe', label: 'Europe' },
  { value: 'usa', label: 'USA' },
  { value: 'middleEast', label: 'Middle East' },
];

const contentTypeOptions = [
  { value: 'news', label: 'News' },
  { value: 'review', label: 'Review' },
];

export default function CreateArticlePage() {
  const navigate = useNavigate();
  const createOrSaveArticle = useCreateOrSaveArticle();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState<string>('');
  const [region, setRegion] = useState<string>('');
  const [contentType, setContentType] = useState<string>('news');

  const handleSubmit = async (status: ContentStatus) => {
    if (!title.trim() || !content.trim() || !author.trim() || !category || !region) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const articleId = await createOrSaveArticle.mutateAsync({
        title: title.trim(),
        content: content.trim(),
        author: author.trim(),
        category: category as Category,
        region: region as Region,
        status,
        contentType: contentType as ContentType,
      });
      
      if (status === ContentStatus.published) {
        navigate({ to: '/article/$articleId', params: { articleId: articleId.toString() } });
      } else {
        navigate({ to: '/my-drafts' });
      }
    } catch (error: any) {
      console.error('Failed to save article:', error);
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      <Button
        variant="ghost"
        size="sm"
        className="mb-6 gap-2"
        onClick={() => navigate({ to: '/' })}
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <RequireAuthAction action="create articles">
        <Card>
          <CardHeader>
            <CardTitle>Create Article</CardTitle>
            <CardDescription>
              Share news, updates, or stories about motorcycles from around the world
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="contentType">Content Type</Label>
                <Select value={contentType} onValueChange={setContentType}>
                  <SelectTrigger id="contentType" className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {contentTypeOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter article title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  placeholder="Your name"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory} required>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="region">Region</Label>
                  <Select value={region} onValueChange={setRegion} required>
                    <SelectTrigger id="region">
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      {regionOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <RichTextEditor
                  content={content}
                  onUpdate={setContent}
                  placeholder="Write your article content here..."
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={() => handleSubmit(ContentStatus.draft)}
                  disabled={createOrSaveArticle.isPending}
                  variant="outline"
                  className="gap-2"
                >
                  {createOrSaveArticle.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  <Save className="h-4 w-4" />
                  Save Draft
                </Button>
                <Button
                  type="button"
                  onClick={() => handleSubmit(ContentStatus.published)}
                  disabled={createOrSaveArticle.isPending}
                  className="gap-2"
                >
                  {createOrSaveArticle.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  <Send className="h-4 w-4" />
                  Publish
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate({ to: '/' })}
                  disabled={createOrSaveArticle.isPending}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </RequireAuthAction>
    </div>
  );
}
