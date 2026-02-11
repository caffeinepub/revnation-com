import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Badge } from '@/components/ui/badge';
import { Link } from '@tanstack/react-router';
import type { Article } from '../backend';

interface LatestLaunchesCarouselProps {
  launches: Article[];
}

export default function LatestLaunchesCarousel({ launches }: LatestLaunchesCarouselProps) {
  if (!launches.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No launches available yet. Check back soon!
      </div>
    );
  }

  return (
    <Carousel
      opts={{
        align: 'start',
        loop: true,
      }}
      className="w-full"
    >
      <CarouselContent>
        {launches.map((launch) => (
          <CarouselItem key={launch.id} className="md:basis-1/2 lg:basis-1/3">
            <Link to="/article/$articleId" params={{ articleId: launch.id.toString() }}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="line-clamp-2 text-lg">{launch.title}</CardTitle>
                    <Badge variant="outline" className="shrink-0">
                      {launch.region}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {launch.content.substring(0, 120)}...
                  </p>
                  <p className="text-xs text-muted-foreground mt-4">
                    By {launch.author}
                  </p>
                </CardContent>
              </Card>
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
