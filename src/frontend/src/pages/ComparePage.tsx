import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGetAllBikes, useGetAllReviews } from '../hooks/useQueries';
import BikeSelector from '../components/BikeSelector';
import ComparisonTable from '../components/ComparisonTable';
import { Scale } from 'lucide-react';

export default function ComparePage() {
  const { data: bikes } = useGetAllBikes();
  const { data: reviews } = useGetAllReviews();
  const [bike1Id, setBike1Id] = useState<bigint | null>(null);
  const [bike2Id, setBike2Id] = useState<bigint | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  const bike1 = bikes?.find((b) => b.id === bike1Id);
  const bike2 = bikes?.find((b) => b.id === bike2Id);
  const review1 = reviews?.find((r) => r.bikeId === bike1Id);
  const review2 = reviews?.find((r) => r.bikeId === bike2Id);

  const handleCompare = () => {
    if (bike1Id && bike2Id) {
      setShowComparison(true);
    }
  };

  return (
    <div className="container py-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Scale className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight">Compare Bikes</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Select two motorcycles to compare their specifications and reviews side by side
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Select Bikes to Compare</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Bike</label>
                <BikeSelector
                  bikes={bikes || []}
                  selectedBikeId={bike1Id}
                  onSelect={setBike1Id}
                  placeholder="Select first bike..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Second Bike</label>
                <BikeSelector
                  bikes={bikes || []}
                  selectedBikeId={bike2Id}
                  onSelect={setBike2Id}
                  placeholder="Select second bike..."
                />
              </div>
            </div>
            <Button
              onClick={handleCompare}
              disabled={!bike1Id || !bike2Id}
              className="w-full"
              size="lg"
            >
              Compare Bikes
            </Button>
          </CardContent>
        </Card>

        {showComparison && bike1 && bike2 && (
          <ComparisonTable bike1={bike1} bike2={bike2} review1={review1} review2={review2} />
        )}
      </div>
    </div>
  );
}
