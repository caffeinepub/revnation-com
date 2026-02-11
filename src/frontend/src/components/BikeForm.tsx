import { useState, useEffect } from 'react';
import { useCreateBike, useEditBike } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Bike } from '../backend';
import { Region } from '../backend';

interface BikeFormProps {
  bike?: Bike | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const regionOptions: { value: Region; label: string }[] = [
  { value: Region.asia, label: 'Asia' },
  { value: Region.europe, label: 'Europe' },
  { value: Region.usa, label: 'USA' },
  { value: Region.middleEast, label: 'Middle East' },
];

export default function BikeForm({ bike, onSuccess, onCancel }: BikeFormProps) {
  const createBike = useCreateBike();
  const editBike = useEditBike();
  
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [specs, setSpecs] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [images, setImages] = useState('');
  const [details, setDetails] = useState('');
  const [region, setRegion] = useState<Region>(Region.usa);

  useEffect(() => {
    if (bike) {
      setName(bike.name);
      setBrand(bike.brand);
      setSpecs(bike.specs);
      setMinPrice(bike.priceRange.min.toString());
      setMaxPrice(bike.priceRange.max.toString());
      setImages(bike.images.join('\n'));
      setDetails(bike.details);
      setRegion(bike.region);
    }
  }, [bike]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const imageArray = images
      .split('\n')
      .map((img) => img.trim())
      .filter((img) => img.length > 0);

    const priceRange = {
      min: BigInt(minPrice || '0'),
      max: BigInt(maxPrice || '0'),
    };

    try {
      if (bike) {
        await editBike.mutateAsync({
          bikeId: bike.id,
          name,
          brand,
          specs,
          priceRange,
          images: imageArray,
          details,
          region,
        });
      } else {
        await createBike.mutateAsync({
          name,
          brand,
          specs,
          priceRange,
          images: imageArray,
          details,
          region,
        });
      }
      onSuccess();
    } catch (error) {
      // Error handling is done in the mutation hooks
    }
  };

  const isSubmitting = createBike.isPending || editBike.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="brand">Brand *</Label>
          <Input
            id="brand"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="e.g., Yamaha, Honda, Ducati"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Model Name *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., YZF-R1, CBR1000RR"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="specs">Specifications *</Label>
        <Textarea
          id="specs"
          value={specs}
          onChange={(e) => setSpecs(e.target.value)}
          placeholder="Engine, power, torque, weight, etc."
          rows={4}
          required
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="minPrice">Minimum Price (USD)</Label>
          <Input
            id="minPrice"
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="0"
            min="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxPrice">Maximum Price (USD)</Label>
          <Input
            id="maxPrice"
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="0"
            min="0"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="images">Image URLs (one per line)</Label>
        <Textarea
          id="images"
          value={images}
          onChange={(e) => setImages(e.target.value)}
          placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
          rows={4}
        />
        <p className="text-xs text-muted-foreground">
          Enter image URLs, one per line. Leave empty to use placeholder image.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="details">Details</Label>
        <Textarea
          id="details"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Additional information, features, history, etc."
          rows={6}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="region">Region *</Label>
        <Select value={region} onValueChange={(value) => setRegion(value as Region)}>
          <SelectTrigger id="region">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {regionOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : bike ? 'Update Bike' : 'Create Bike'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
