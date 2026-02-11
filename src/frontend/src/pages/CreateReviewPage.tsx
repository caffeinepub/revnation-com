import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Loader2, Save, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import RequireAuthAction from '../components/RequireAuthAction';
import BikeSelector from '../components/BikeSelector';
import { useCreateOrSaveReview, useGetAllBikes } from '../hooks/useQueries';
import { Region, ContentStatus } from '../backend';
import { toast } from 'sonner';

const regionOptions = [
  { value: 'asia', label: 'Asia' },
  { value: 'europe', label: 'Europe' },
  { value: 'usa', label: 'USA' },
  { value: 'middleEast', label: 'Middle East' },
];

export default function CreateReviewPage() {
  const navigate = useNavigate();
  const createOrSaveReview = useCreateOrSaveReview();
  const { data: bikes = [] } = useGetAllBikes();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [bikeId, setBikeId] = useState<bigint | null>(null);
  const [region, setRegion] = useState<string>('');
  
  const [performance, setPerformance] = useState(50);
  const [design, setDesign] = useState(50);
  const [comfort, setComfort] = useState(50);
  const [value, setValue] = useState(50);

  const handleSubmit = async (status: ContentStatus) => {
    if (!title.trim() || !content.trim() || !author.trim() || bikeId === null || !region) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const reviewId = await createOrSaveReview.mutateAsync({
        title: title.trim(),
        content: content.trim(),
        author: author.trim(),
        bikeId,
        region: region as Region,
        score: {
          performance,
          design,
          comfort,
          value,
        },
        status,
      });
      
      if (status === ContentStatus.published) {
        navigate({ to: '/review/$reviewId', params: { reviewId: reviewId.toString() } });
      } else {
        navigate({ to: '/my-drafts' });
      }
    } catch (error: any) {
      console.error('Failed to save review:', error);
    }
  };

  const selectedBike = bikes.find((b) => b.id === bikeId);

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

      <RequireAuthAction action="create reviews">
        <Card>
          <CardHeader>
            <CardTitle>Create Review</CardTitle>
            <CardDescription>
              Share your detailed review and ratings for a motorcycle
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Review Title</Label>
                <Input
                  id="title"
                  placeholder="Enter review title"
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
                  <Label>Motorcycle</Label>
                  <BikeSelector
                    bikes={bikes}
                    selectedBikeId={bikeId}
                    onSelect={setBikeId}
                  />
                  {selectedBike && (
                    <p className="text-sm text-muted-foreground">
                      {selectedBike.brand} {selectedBike.name}
                    </p>
                  )}
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

              <div className="space-y-4">
                <Label>Ratings (0-100)</Label>
                
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Performance</span>
                      <span className="text-sm text-muted-foreground">{performance}</span>
                    </div>
                    <Slider
                      value={[performance]}
                      onValueChange={(vals) => setPerformance(vals[0])}
                      max={100}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Design</span>
                      <span className="text-sm text-muted-foreground">{design}</span>
                    </div>
                    <Slider
                      value={[design]}
                      onValueChange={(vals) => setDesign(vals[0])}
                      max={100}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Comfort</span>
                      <span className="text-sm text-muted-foreground">{comfort}</span>
                    </div>
                    <Slider
                      value={[comfort]}
                      onValueChange={(vals) => setComfort(vals[0])}
                      max={100}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Value</span>
                      <span className="text-sm text-muted-foreground">{value}</span>
                    </div>
                    <Slider
                      value={[value]}
                      onValueChange={(vals) => setValue(vals[0])}
                      max={100}
                      step={1}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Review Content</Label>
                <Textarea
                  id="content"
                  placeholder="Write your detailed review here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={12}
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={() => handleSubmit(ContentStatus.draft)}
                  disabled={createOrSaveReview.isPending}
                  variant="outline"
                  className="gap-2"
                >
                  {createOrSaveReview.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  <Save className="h-4 w-4" />
                  Save Draft
                </Button>
                <Button
                  type="button"
                  onClick={() => handleSubmit(ContentStatus.published)}
                  disabled={createOrSaveReview.isPending}
                  className="gap-2"
                >
                  {createOrSaveReview.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  <Send className="h-4 w-4" />
                  Publish
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate({ to: '/' })}
                  disabled={createOrSaveReview.isPending}
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
