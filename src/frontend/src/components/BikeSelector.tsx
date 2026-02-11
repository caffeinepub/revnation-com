import { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { Bike } from '../backend';

interface BikeSelectorProps {
  bikes: Bike[];
  selectedBikeId: bigint | null;
  onSelect: (bikeId: bigint) => void;
  placeholder?: string;
}

export default function BikeSelector({ bikes, selectedBikeId, onSelect, placeholder = 'Select bike...' }: BikeSelectorProps) {
  const [open, setOpen] = useState(false);

  const selectedBike = bikes.find((b) => b.id === selectedBikeId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedBike ? `${selectedBike.brand} ${selectedBike.name}` : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search bikes..." />
          <CommandList>
            <CommandEmpty>No bike found.</CommandEmpty>
            <CommandGroup>
              {bikes.map((bike) => (
                <CommandItem
                  key={bike.id.toString()}
                  value={`${bike.brand} ${bike.name}`}
                  onSelect={() => {
                    onSelect(bike.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selectedBikeId === bike.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {bike.brand} {bike.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
