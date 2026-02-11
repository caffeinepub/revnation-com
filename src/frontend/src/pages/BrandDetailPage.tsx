import { useParams, Link, useNavigate } from '@tanstack/react-router';
import { useGetAllBikes } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, DollarSign } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo } from 'react';

const regionLabels: Record<string, string> = {
  asia: 'Asia',
  europe: 'Europe',
  usa: 'USA',
  middleEast: 'Middle East',
};

export default function BrandDetailPage() {
  const { brandId } = useParams({ from: '/brands/$brandId' });
  const navigate = useNavigate();
  const { data: allBikes, isLoading } = useGetAllBikes();

  const brandBikes = useMemo(() => {
    if (!allBikes) return [];
    const decodedBrand = decodeURIComponent(brandId).toLowerCase();
    return allBikes.filter((bike) => bike.brand.toLowerCase() === decodedBrand);
  }, [allBikes, brandId]);

  const brandName = brandBikes.length > 0 ? brandBikes[0].brand : decodeURIComponent(brandId);

  const formatPrice = (price: bigint) => {
    if (price === 0n) return null;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(Number(price));
  };

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <Skeleton className="h-12 w-64" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-96" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (brandBikes.length === 0) {
    return (
      <div className="container py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <Button variant="ghost" onClick={() => navigate({ to: '/brands' })} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Brands
          </Button>
          <Card>
            <CardContent className="py-12 text-center space-y-4">
              <h2 className="text-2xl font-bold">No Bikes Found</h2>
              <p className="text-muted-foreground">
                No motorcycles found for this brand.
              </p>
              <Button onClick={() => navigate({ to: '/brands' })}>
                Browse All Brands
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate({ to: '/brands' })} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Brands
        </Button>

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">{brandName}</h1>
          <p className="text-muted-foreground">
            {brandBikes.length} {brandBikes.length === 1 ? 'model' : 'models'} available
          </p>
        </div>

        {/* Bikes Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {brandBikes.map((bike) => {
            const minPriceFormatted = formatPrice(bike.priceRange.min);
            const maxPriceFormatted = formatPrice(bike.priceRange.max);
            
            return (
              <Link key={bike.id.toString()} to="/bike/$bikeId" params={{ bikeId: bike.id.toString() }}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full overflow-hidden">
                  <div className="aspect-video relative bg-muted">
                    <img
                      src={
                        bike.images && bike.images.length > 0
                          ? bike.images[0]
                          : '/assets/generated/bike-placeholder.dim_1200x800.png'
                      }
                      alt={`${bike.brand} ${bike.name}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/assets/generated/bike-placeholder.dim_1200x800.png';
                      }}
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-1">{bike.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{regionLabels[bike.region] || bike.region}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {bike.specs || 'No specifications available'}
                    </p>
                    {(minPriceFormatted || maxPriceFormatted) && (
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <DollarSign className="h-4 w-4" />
                        {minPriceFormatted && maxPriceFormatted && bike.priceRange.min !== bike.priceRange.max
                          ? `${minPriceFormatted} - ${maxPriceFormatted}`
                          : minPriceFormatted || maxPriceFormatted}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
