import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetBikeById } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, DollarSign, MapPin, Palette } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import BikeImageGallery from '../components/BikeImageGallery';
import ImageLightbox from '../components/ImageLightbox';
import { useState } from 'react';

const regionLabels: Record<string, string> = {
  asia: 'Asia',
  europe: 'Europe',
  usa: 'USA',
  middleEast: 'Middle East',
};

export default function BikeDetailPage() {
  const { bikeId } = useParams({ from: '/bike/$bikeId' });
  const navigate = useNavigate();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [selectedColorIndex, setSelectedColorIndex] = useState<number | null>(null);
  
  // Safely parse bikeId - validate it's a valid bigint string
  let parsedBikeId: bigint | null = null;
  let isInvalidId = false;
  
  try {
    // Check if bikeId contains only digits
    if (/^\d+$/.test(bikeId)) {
      parsedBikeId = BigInt(bikeId);
    } else {
      isInvalidId = true;
    }
  } catch (error) {
    isInvalidId = true;
  }

  const { data: bike, isLoading } = useGetBikeById(parsedBikeId);

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (isInvalidId) {
    return (
      <div className="container py-12">
        <div className="max-w-6xl mx-auto">
          <Card className="border-destructive/50">
            <CardContent className="py-12 text-center space-y-4">
              <h2 className="text-2xl font-bold">Invalid Link</h2>
              <p className="text-muted-foreground">
                The link you followed is not valid. Please check the URL and try again.
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

  if (!bike) {
    return (
      <div className="container py-12">
        <div className="max-w-6xl mx-auto">
          <Card className="border-muted">
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

  // Determine which images to display - convert ImageType to string URLs
  const getDisplayImages = (): string[] => {
    // If a color is selected and has images, use them
    if (selectedColorIndex !== null && bike.colorOptions[selectedColorIndex]?.images?.length > 0) {
      const colorImages = bike.colorOptions[selectedColorIndex].images;
      return colorImages.map(img => {
        if (img.__kind__ === 'uploaded') {
          return img.uploaded.getDirectURL();
        } else {
          return img.linked;
        }
      });
    }
    // Otherwise use main images or placeholder
    if (bike.mainImages && bike.mainImages.length > 0) {
      return bike.mainImages.map(img => {
        if (img.__kind__ === 'uploaded') {
          return img.uploaded.getDirectURL();
        } else {
          return img.linked;
        }
      });
    }
    return ['/assets/generated/bike-placeholder.dim_1200x800.png'];
  };

  const displayImages = getDisplayImages();

  const handleOpenLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const handleColorSelect = (index: number) => {
    setSelectedColorIndex(index);
  };

  return (
    <div className="container py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate({ to: '/brands' })} className="gap-2 hover:gap-3 transition-all">
          <ArrowLeft className="h-4 w-4" />
          Back to Brands
        </Button>

        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                {bike.brand} {bike.name}
              </h1>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="gap-1.5 px-3 py-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {regionLabels[bike.region] || bike.region}
                </Badge>
                {bike.priceRange.min > BigInt(0) && (
                  <Badge variant="secondary" className="gap-1.5 px-3 py-1">
                    <DollarSign className="h-3.5 w-3.5" />
                    {formatPrice(bike.priceRange.min)} - {formatPrice(bike.priceRange.max)}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        <Card className="overflow-hidden border-border/60 shadow-sm">
          <CardContent className="p-6">
            <BikeImageGallery images={displayImages} onImageClick={handleOpenLightbox} />
          </CardContent>
        </Card>

        {/* Color Options */}
        {bike.colorOptions && bike.colorOptions.length > 0 && (
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Palette className="h-5 w-5" />
                Available Colours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {bike.colorOptions.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => handleColorSelect(index)}
                    className={`group flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all hover:shadow-md ${
                      selectedColorIndex === index
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-full border-2 border-border shadow-sm"
                      style={{ backgroundColor: color.colorCode }}
                    />
                    <span className="font-medium text-sm">{color.name}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Specifications */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Specifications</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">{bike.specs}</p>
          </CardContent>
        </Card>

        {/* Details */}
        {bike.details && (
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Details</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">{bike.details}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Lightbox */}
      <ImageLightbox
        images={displayImages}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
}
