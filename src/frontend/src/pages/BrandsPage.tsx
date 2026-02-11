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
    
    const brandMap = new Map<string, { name: string; count: number; bikes: typeof bikes }>();
    
    bikes.forEach((bike) => {
      const brandKey = bike.brand.toLowerCase();
      const existing = brandMap.get(brandKey);
      
      if (existing) {
        existing.count++;
        existing.bikes.push(bike);
      } else {
        brandMap.set(brandKey, {
          name: bike.brand,
          count: 1,
          bikes: [bike],
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
          <h1 className="text-4xl font-bold tracking-tight">Motorcycle Brands</h1>
          <p className="text-muted-foreground">
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
              <Skeleton key={i} className="h-32" />
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
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{brand.name}</span>
                      <Badge variant="secondary">{brand.count}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {brand.count} {brand.count === 1 ? 'model' : 'models'} available
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
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
