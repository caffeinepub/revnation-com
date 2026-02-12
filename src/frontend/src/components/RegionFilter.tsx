import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Region } from '../backend';

interface RegionFilterProps {
  selectedRegion: Region | 'all';
  onRegionChange: (region: Region | 'all') => void;
}

export default function RegionFilter({ selectedRegion, onRegionChange }: RegionFilterProps) {
  return (
    <Tabs value={selectedRegion} onValueChange={(value) => onRegionChange(value as Region | 'all')}>
      <TabsList className="bg-muted/50">
        <TabsTrigger value="all">All Regions</TabsTrigger>
        <TabsTrigger value="asia">Asia</TabsTrigger>
        <TabsTrigger value="europe">Europe</TabsTrigger>
        <TabsTrigger value="usa">USA</TabsTrigger>
        <TabsTrigger value="middleEast">Middle East</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
