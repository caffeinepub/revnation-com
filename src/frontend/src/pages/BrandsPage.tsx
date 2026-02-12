import { useState, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { useGetAllBikes } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function BrandsPage() {
  const { data: bikes, isLoading } = useGetAllBikes();
  const [searchQuery, setSearchQuery] = useState('');

  const brands = useMemo(() => {
    if (!bikes) return [];
    
    const brandMap = new Map<string, { name: string; count: number; bikes: typeof bikes; logo?: string }>();
    
    bikes.forEach((bike) => {
      const brandKey = bike.brand.toLowerCase();
      const existing = brandMap.get(brandKey);
      
      // Get logo URL from ImageType union
      let logoUrl: string | undefined = undefined;
      if (bike.brandLogo) {
        if (bike.brandLogo.__kind__ === 'uploaded') {
          logoUrl = bike.brandLogo.uploaded.getDirectURL();
        } else {
          logoUrl = bike.brandLogo.linked;
        }
      }
      
      if (existing) {
        existing.count++;
        existing.bikes.push(bike);
        // Use the first logo found
        if (!existing.logo && logoUrl) {
          existing.logo = logoUrl;
        }
      } else {
        brandMap.set(brandKey, {
          name: bike.brand,
          count: 1,
          bikes: [bike],
          logo: logoUrl,
        });
      }
    });
    
    return Array.from(brandMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [bikes]);

  const filteredBrands = useMemo(() => {
    if (!searchQuery.trim()) return brands;
    
    const lowerQuery = searchQuery.toLowerCase();
    return brands.filter((brand) => brand.name.toLowerCase().includes(lowerQuery));
  }, [brands, searchQuery]);

  return (
    <div className="container py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Motorcycle Brands</h1>
          <p className="text-lg text-muted-foreground">
            Browse motorcycles by manufacturer
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search brands..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Brands Grid */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        ) : filteredBrands.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredBrands.map((brand) => (
              <Link
                key={brand.name}
                to="/brands/$brandId"
                params={{ brandId: encodeURIComponent(brand.name.toLowerCase()) }}
              >
                <Card className="hover:shadow-xl hover:border-primary/30 transition-all duration-300 cursor-pointer h-full group">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-3">
                      {brand.logo ? (
                        <div className="w-16 h-16 rounded-lg border-2 border-border overflow-hidden bg-muted flex items-center justify-center p-2">
                          <img
                            src={brand.logo}
                            alt={`${brand.name} logo`}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.currentTarget.src = '/assets/generated/bike-placeholder.dim_1200x800.png';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-lg border-2 border-dashed border-border bg-muted flex items-center justify-center">
                          <span className="text-2xl font-bold text-muted-foreground">
                            {brand.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <Badge variant="secondary" className="text-base px-3 py-1">
                        {brand.count}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {brand.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {brand.count} {brand.count === 1 ? 'model' : 'models'} available
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                {searchQuery ? 'No brands found matching your search.' : 'No brands available yet.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
