import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign } from 'lucide-react';
import type { Bike } from '../backend';

const regionLabels: Record<string, string> = {
  asia: 'Asia',
  europe: 'Europe',
  usa: 'USA',
  middleEast: 'Middle East',
};

interface BikeCardProps {
  bike: Bike;
}

export default function BikeCard({ bike }: BikeCardProps) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate({ to: '/bike/$bikeId', params: { bikeId: bike.id.toString() } });
  };

  const handleLearnMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate({ to: '/bike/$bikeId', params: { bikeId: bike.id.toString() } });
  };

  const formatPrice = (price: bigint) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(Number(price));
  };

  const getImageUrl = () => {
    if (bike.mainImages && bike.mainImages.length > 0) {
      const firstImage = bike.mainImages[0];
      if (firstImage.__kind__ === 'uploaded') {
        return firstImage.uploaded.getDirectURL();
      } else {
        return firstImage.linked;
      }
    }
    return '/assets/generated/bike-placeholder.dim_1200x800.png';
  };

  return (
    <Card
      className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group border-border/60"
      onClick={handleCardClick}
    >
      <div className="aspect-video relative bg-muted overflow-hidden">
        <img
          src={getImageUrl()}
          alt={bike.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/assets/generated/bike-placeholder.dim_1200x800.png';
          }}
        />
      </div>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-xl group-hover:text-primary transition-colors">
            {bike.brand} {bike.name}
          </CardTitle>
          <Badge variant="outline" className="flex-shrink-0">
            {regionLabels[bike.region] || bike.region}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <p className="text-muted-foreground line-clamp-2">{bike.specs}</p>
          {bike.priceRange.min > BigInt(0) && (
            <div className="flex items-center gap-1.5 text-foreground font-medium">
              <DollarSign className="h-4 w-4" />
              <span>
                {formatPrice(bike.priceRange.min)} - {formatPrice(bike.priceRange.max)}
              </span>
            </div>
          )}
        </div>
        <Button
          variant="outline"
          className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
          onClick={handleLearnMoreClick}
        >
          Learn more
        </Button>
      </CardContent>
    </Card>
  );
}
