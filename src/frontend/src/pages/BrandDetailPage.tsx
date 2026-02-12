import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetAllBikes } from '../hooks/useQueries';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo } from 'react';
import BikeCard from '../components/BikeCard';

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
  
  const brandLogo = useMemo(() => {
    if (brandBikes.length === 0 || !brandBikes[0].brandLogo) return undefined;
    const logo = brandBikes[0].brandLogo;
    if (logo.__kind__ === 'uploaded') {
      return logo.uploaded.getDirectURL();
    } else {
      return logo.linked;
    }
  }, [brandBikes]);

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
          <Button variant="ghost" onClick={() => navigate({ to: '/brands' })} className="gap-2 hover:gap-3 transition-all">
            <ArrowLeft className="h-4 w-4" />
            Back to Brands
          </Button>
          <Card className="border-dashed">
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
        <Button variant="ghost" onClick={() => navigate({ to: '/brands' })} className="gap-2 hover:gap-3 transition-all">
          <ArrowLeft className="h-4 w-4" />
          Back to Brands
        </Button>

        {/* Header with Logo */}
        <div className="flex items-center gap-6">
          {brandLogo && (
            <div className="w-24 h-24 rounded-xl border-2 border-border overflow-hidden bg-muted flex items-center justify-center p-3 shadow-sm">
              <img
                src={brandLogo}
                alt={`${brandName} logo`}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{brandName}</h1>
            <p className="text-lg text-muted-foreground">
              {brandBikes.length} {brandBikes.length === 1 ? 'model' : 'models'} available
            </p>
          </div>
        </div>

        {/* Bikes Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {brandBikes.map((bike) => (
            <BikeCard key={bike.id.toString()} bike={bike} />
          ))}
        </div>
      </div>
    </div>
  );
}
