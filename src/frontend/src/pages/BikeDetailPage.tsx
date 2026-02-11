import { useParams, Link, useNavigate } from '@tanstack/react-router';
import { useGetBikeById } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, DollarSign, MapPin } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const regionLabels: Record<string, string> = {
  asia: 'Asia',
  europe: 'Europe',
  usa: 'USA',
  middleEast: 'Middle East',
};

export default function BikeDetailPage() {
  const { bikeId } = useParams({ from: '/bike/$bikeId' });
  const navigate = useNavigate();
  const { data: bike, isLoading } = useGetBikeById(BigInt(bikeId));

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!bike) {
    return (
      <div className="container py-12">
        <div className="max-w-5xl mx-auto">
          <Card>
            <CardContent className="py-12 text-center space-y-4">
              <h2 className="text-2xl font-bold">Bike Not Found</h2>
              <p className="text-muted-foreground">
                The bike you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => navigate({ to: '/brands' })}>
                Browse Brands
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const formatPrice = (price: bigint) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(Number(price));
  };

  const hasImages = bike.images && bike.images.length > 0;
  const displayImages = hasImages ? bike.images : ['/assets/generated/bike-placeholder.dim_1200x800.png'];

  return (
    <div className="container py-12">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate({ to: '/brands' })} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Brands
        </Button>

        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight">
                {bike.brand} {bike.name}
              </h1>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  <MapPin className="h-3 w-3" />
                  {regionLabels[bike.region] || bike.region}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        <Card>
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
              {displayImages.map((image, index) => (
                <div
                  key={index}
                  className="relative aspect-video rounded-lg overflow-hidden bg-muted"
                >
                  <img
                    src={image}
                    alt={`${bike.brand} ${bike.name} - Image ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/assets/generated/bike-placeholder.dim_1200x800.png';
                    }}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Price Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Pricing
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bike.priceRange.min === 0n && bike.priceRange.max === 0n ? (
              <p className="text-muted-foreground">Price information not available</p>
            ) : (
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">
                    {formatPrice(bike.priceRange.min)}
                  </span>
                  {bike.priceRange.max > bike.priceRange.min && (
                    <>
                      <span className="text-muted-foreground">to</span>
                      <span className="text-3xl font-bold">
                        {formatPrice(bike.priceRange.max)}
                      </span>
                    </>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Price range may vary by region and configuration
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Specifications */}
        <Card>
          <CardHeader>
            <CardTitle>Specifications</CardTitle>
          </CardHeader>
          <CardContent>
            {bike.specs ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap">{bike.specs}</p>
              </div>
            ) : (
              <p className="text-muted-foreground">No specifications available</p>
            )}
          </CardContent>
        </Card>

        {/* Details */}
        {bike.details && (
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap">{bike.details}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Separator />

        {/* Actions */}
        <div className="flex gap-4">
          <Button asChild>
            <Link to="/compare">Compare with Other Bikes</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/brands/$brandId" params={{ brandId: encodeURIComponent(bike.brand.toLowerCase()) }}>
              View More from {bike.brand}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
