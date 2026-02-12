import { useState, useEffect } from 'react';
import { useCreateBike, useEditBike } from '../hooks/useQueries';
import { useActor } from '../hooks/useActor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, Upload, Plus, AlertCircle, Palette } from 'lucide-react';
import type { Bike, ColorOption, ImageType } from '../backend';
import { Region, ExternalBlob } from '../backend';
import { toast } from 'sonner';
import { parseMarkdownTableEnhanced, isMarkdownTable } from '../utils/markdownSpecs';
import { extractHexColors, extractColorNames, validateHexColor } from '../utils/sectionPalette';

interface BikeFormProps {
  bike?: Bike | null;
  onSuccess: () => void;
  onCancel: () => void;
}

interface ImageEntry {
  type: 'uploaded' | 'linked';
  uploaded?: ExternalBlob;
  linked?: string;
}

interface ColorOptionForm {
  name: string;
  colorCode: string;
  images: ImageEntry[];
}

const regionOptions: { value: Region; label: string }[] = [
  { value: Region.asia, label: 'Asia' },
  { value: Region.europe, label: 'Europe' },
  { value: Region.usa, label: 'USA' },
  { value: Region.middleEast, label: 'Middle East' },
];

export default function BikeForm({ bike, onSuccess, onCancel }: BikeFormProps) {
  const { actor, isFetching: actorFetching } = useActor();
  const createBike = useCreateBike();
  const editBike = useEditBike();
  
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [specs, setSpecs] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [mainImages, setMainImages] = useState<ImageEntry[]>([]);
  const [details, setDetails] = useState('');
  const [region, setRegion] = useState<Region>(Region.usa);
  const [colorOptions, setColorOptions] = useState<ColorOptionForm[]>([]);
  const [newColorName, setNewColorName] = useState('');
  const [newColorCode, setNewColorCode] = useState('#000000');
  const [brandLogo, setBrandLogo] = useState<ImageEntry | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [formError, setFormError] = useState<string>('');
  
  // Paste Specs state
  const [pasteSpecsText, setPasteSpecsText] = useState('');
  const [pasteSpecsError, setPasteSpecsError] = useState('');

  useEffect(() => {
    if (bike) {
      setName(bike.name);
      setBrand(bike.brand);
      setSpecs(bike.specs);
      setMinPrice(bike.priceRange.min.toString());
      setMaxPrice(bike.priceRange.max.toString());
      
      // Convert ImageType[] to ImageEntry[]
      const imageEntries: ImageEntry[] = bike.mainImages.map(img => {
        if (img.__kind__ === 'uploaded') {
          return { type: 'uploaded', uploaded: img.uploaded };
        } else {
          return { type: 'linked', linked: img.linked };
        }
      });
      setMainImages(imageEntries);
      
      setDetails(bike.details);
      setRegion(bike.region);
      
      // Convert ColorOption[] to ColorOptionForm[]
      const colorOptionsForm: ColorOptionForm[] = bike.colorOptions.map(color => ({
        name: color.name,
        colorCode: color.colorCode,
        images: color.images.map(img => {
          if (img.__kind__ === 'uploaded') {
            return { type: 'uploaded', uploaded: img.uploaded };
          } else {
            return { type: 'linked', linked: img.linked };
          }
        }),
      }));
      setColorOptions(colorOptionsForm);
      
      // Convert brand logo
      if (bike.brandLogo) {
        if (bike.brandLogo.__kind__ === 'uploaded') {
          setBrandLogo({ type: 'uploaded', uploaded: bike.brandLogo.uploaded });
        } else {
          setBrandLogo({ type: 'linked', linked: bike.brandLogo.linked });
        }
      } else {
        setBrandLogo(null);
      }
    }
  }, [bike]);

  const handlePasteSpecsAutoParse = (pastedText: string) => {
    setPasteSpecsError('');
    
    if (!pastedText.trim()) {
      return;
    }

    if (!isMarkdownTable(pastedText)) {
      setPasteSpecsError('The pasted text does not appear to be a valid Markdown table. Please check the format.');
      return;
    }

    try {
      const parsed = parseMarkdownTableEnhanced(pastedText);
      
      // Apply specs text
      setSpecs(parsed.specsText);
      
      // Apply price range if present
      if (parsed.minPrice !== undefined) {
        setMinPrice(parsed.minPrice.toString());
      }
      if (parsed.maxPrice !== undefined) {
        setMaxPrice(parsed.maxPrice.toString());
      }
      
      // Detect colors from the entire pasted text
      const hexColors = extractHexColors(pastedText);
      const namedColors = extractColorNames(pastedText);
      
      // Combine with colors from the Colors row
      const allDetectedColors: Array<{ name: string; hex: string }> = [];
      
      // Add hex colors detected in text
      hexColors.forEach(hex => {
        allDetectedColors.push({ name: hex, hex });
      });
      
      // Add named colors detected in text
      namedColors.forEach(hex => {
        // Try to find the color name from the mapping
        const colorName = Object.entries({
          red: '#FF0000', green: '#00FF00', blue: '#0000FF', yellow: '#FFFF00',
          orange: '#FFA500', purple: '#800080', pink: '#FFC0CB', brown: '#A52A2A',
          black: '#000000', white: '#FFFFFF', gray: '#808080', grey: '#808080',
          cyan: '#00FFFF', magenta: '#FF00FF', lime: '#00FF00', maroon: '#800000',
          navy: '#000080', olive: '#808000', teal: '#008080', aqua: '#00FFFF',
          silver: '#C0C0C0', gold: '#FFD700', indigo: '#4B0082', violet: '#EE82EE',
          turquoise: '#40E0D0', coral: '#FF7F50', salmon: '#FA8072', khaki: '#F0E68C',
          crimson: '#DC143C', lavender: '#E6E6FA', beige: '#F5F5DC', ivory: '#FFFFF0',
          tan: '#D2B48C', peach: '#FFDAB9', mint: '#98FF98', sky: '#87CEEB',
          rose: '#FF007F', plum: '#DDA0DD',
        }).find(([_, hexVal]) => hexVal === hex);
        
        allDetectedColors.push({ 
          name: colorName ? colorName[0].charAt(0).toUpperCase() + colorName[0].slice(1) : hex, 
          hex 
        });
      });
      
      // Add colors from the Colors row if present
      if (parsed.colors && parsed.colors.length > 0) {
        parsed.colors.forEach(colorName => {
          // Check if it's a hex color
          const validatedHex = validateHexColor(colorName);
          if (validatedHex) {
            allDetectedColors.push({ name: validatedHex, hex: validatedHex });
          } else {
            // It's a color name, use default black or try to map it
            const lowerName = colorName.toLowerCase();
            const knownColorHex = {
              red: '#FF0000', green: '#00FF00', blue: '#0000FF', yellow: '#FFFF00',
              orange: '#FFA500', purple: '#800080', pink: '#FFC0CB', brown: '#A52A2A',
              black: '#000000', white: '#FFFFFF', gray: '#808080', grey: '#808080',
              cyan: '#00FFFF', magenta: '#FF00FF', lime: '#00FF00', maroon: '#800000',
              navy: '#000080', olive: '#808000', teal: '#008080', aqua: '#00FFFF',
              silver: '#C0C0C0', gold: '#FFD700', indigo: '#4B0082', violet: '#EE82EE',
              turquoise: '#40E0D0', coral: '#FF7F50', salmon: '#FA8072', khaki: '#F0E68C',
              crimson: '#DC143C', lavender: '#E6E6FA', beige: '#F5F5DC', ivory: '#FFFFF0',
              tan: '#D2B48C', peach: '#FFDAB9', mint: '#98FF98', sky: '#87CEEB',
              rose: '#FF007F', plum: '#DDA0DD',
            }[lowerName] || '#000000';
            
            allDetectedColors.push({ name: colorName, hex: knownColorHex });
          }
        });
      }
      
      // Merge colors: add new ones that don't already exist
      const existingColorNames = colorOptions.map(c => c.name.toLowerCase());
      const existingColorHexes = colorOptions.map(c => c.colorCode.toUpperCase());
      
      const newColors: ColorOptionForm[] = [];
      const seenNames = new Set<string>();
      const seenHexes = new Set<string>();
      
      allDetectedColors.forEach(({ name, hex }) => {
        const nameLower = name.toLowerCase();
        const hexUpper = hex.toUpperCase();
        
        // Skip if already exists in current color options
        if (existingColorNames.includes(nameLower) || existingColorHexes.includes(hexUpper)) {
          return;
        }
        
        // Skip if already added in this batch (dedupe)
        if (seenNames.has(nameLower) || seenHexes.has(hexUpper)) {
          return;
        }
        
        seenNames.add(nameLower);
        seenHexes.add(hexUpper);
        
        newColors.push({
          name,
          colorCode: hex,
          images: [],
        });
      });
      
      if (newColors.length > 0) {
        setColorOptions([...colorOptions, ...newColors]);
      }
      
      setPasteSpecsText('');
      toast.success('Specifications and colors parsed successfully');
    } catch (error: any) {
      setPasteSpecsError(error.message || 'Failed to parse Markdown table');
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData('text');
    // Auto-parse on paste
    setTimeout(() => {
      handlePasteSpecsAutoParse(pastedText);
    }, 0);
  };

  const handleMainImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const bytes = new Uint8Array(event.target.result as ArrayBuffer);
        const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
          setUploadProgress((prev) => ({ ...prev, [`main-${index}`]: percentage }));
        });
        
        setMainImages((prev) => {
          const updated = [...prev];
          updated[index] = { type: 'uploaded', uploaded: blob };
          return updated;
        });

        setTimeout(() => {
          setUploadProgress((prev) => {
            const newProgress = { ...prev };
            delete newProgress[`main-${index}`];
            return newProgress;
          });
        }, 1000);
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  const handleMainImageLinkChange = (index: number, url: string) => {
    setMainImages((prev) => {
      const updated = [...prev];
      updated[index] = { type: 'linked', linked: url };
      return updated;
    });
  };

  const handleAddImageSlot = () => {
    setMainImages((prev) => [...prev, { type: 'linked', linked: '' }]);
  };

  const handleRemoveMainImage = (index: number) => {
    setMainImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleBrandLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const bytes = new Uint8Array(event.target.result as ArrayBuffer);
        const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
          setUploadProgress((prev) => ({ ...prev, brandLogo: percentage }));
        });
        setBrandLogo({ type: 'uploaded', uploaded: blob });
        setTimeout(() => {
          setUploadProgress((prev) => {
            const newProgress = { ...prev };
            delete newProgress.brandLogo;
            return newProgress;
          });
        }, 1000);
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  const handleBrandLogoLinkChange = (url: string) => {
    setBrandLogo({ type: 'linked', linked: url });
  };

  const handleColorImageUpload = (colorIndex: number, imageIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const bytes = new Uint8Array(event.target.result as ArrayBuffer);
        const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
          setUploadProgress((prev) => ({ ...prev, [`color-${colorIndex}-${imageIndex}`]: percentage }));
        });
        
        setColorOptions((prev) =>
          prev.map((color, idx) => {
            if (idx === colorIndex) {
              const updatedImages = [...color.images];
              updatedImages[imageIndex] = { type: 'uploaded', uploaded: blob };
              return { ...color, images: updatedImages };
            }
            return color;
          })
        );

        setTimeout(() => {
          setUploadProgress((prev) => {
            const newProgress = { ...prev };
            delete newProgress[`color-${colorIndex}-${imageIndex}`];
            return newProgress;
          });
        }, 1000);
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  const handleColorImageLinkChange = (colorIndex: number, imageIndex: number, url: string) => {
    setColorOptions((prev) =>
      prev.map((color, idx) => {
        if (idx === colorIndex) {
          const updatedImages = [...color.images];
          updatedImages[imageIndex] = { type: 'linked', linked: url };
          return { ...color, images: updatedImages };
        }
        return color;
      })
    );
  };

  const handleAddColorImageSlot = (colorIndex: number) => {
    setColorOptions((prev) =>
      prev.map((color, idx) => {
        if (idx === colorIndex) {
          return { ...color, images: [...color.images, { type: 'linked', linked: '' }] };
        }
        return color;
      })
    );
  };

  const handleRemoveColorImage = (colorIndex: number, imageIndex: number) => {
    setColorOptions((prev) =>
      prev.map((color, idx) => {
        if (idx === colorIndex) {
          return { ...color, images: color.images.filter((_, i) => i !== imageIndex) };
        }
        return color;
      })
    );
  };

  const handleAddColor = () => {
    if (newColorName.trim()) {
      setColorOptions([...colorOptions, { name: newColorName.trim(), colorCode: newColorCode, images: [] }]);
      setNewColorName('');
      setNewColorCode('#000000');
    }
  };

  const handleRemoveColor = (index: number) => {
    setColorOptions(colorOptions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Check if actor is ready
    if (!actor || actorFetching) {
      setFormError('Connection is not ready yet. Please wait a moment and try again.');
      return;
    }

    const priceRange = {
      min: BigInt(minPrice || '0'),
      max: BigInt(maxPrice || '0'),
    };

    // Convert ImageEntry[] to ImageType[]
    const mainImagesPayload: ImageType[] = mainImages
      .filter(img => {
        if (img.type === 'uploaded') return !!img.uploaded;
        if (img.type === 'linked') return !!img.linked && img.linked.trim() !== '';
        return false;
      })
      .map(img => {
        if (img.type === 'uploaded') {
          return { __kind__: 'uploaded', uploaded: img.uploaded! } as ImageType;
        } else {
          return { __kind__: 'linked', linked: img.linked! } as ImageType;
        }
      });

    // Convert brand logo
    let brandLogoPayload: ImageType | null = null;
    if (brandLogo) {
      if (brandLogo.type === 'uploaded' && brandLogo.uploaded) {
        brandLogoPayload = { __kind__: 'uploaded', uploaded: brandLogo.uploaded } as ImageType;
      } else if (brandLogo.type === 'linked' && brandLogo.linked && brandLogo.linked.trim() !== '') {
        brandLogoPayload = { __kind__: 'linked', linked: brandLogo.linked } as ImageType;
      }
    }

    // Convert ColorOptionForm[] to ColorOption[]
    const colorOptionsPayload: ColorOption[] = colorOptions.map(color => ({
      name: color.name,
      colorCode: color.colorCode,
      images: color.images
        .filter(img => {
          if (img.type === 'uploaded') return !!img.uploaded;
          if (img.type === 'linked') return !!img.linked && img.linked.trim() !== '';
          return false;
        })
        .map(img => {
          if (img.type === 'uploaded') {
            return { __kind__: 'uploaded', uploaded: img.uploaded! } as ImageType;
          } else {
            return { __kind__: 'linked', linked: img.linked! } as ImageType;
          }
        }),
    }));

    try {
      if (bike) {
        await editBike.mutateAsync({
          bikeId: bike.id,
          name,
          brand,
          specs,
          priceRange,
          mainImages: mainImagesPayload,
          details,
          region,
          colorOptions: colorOptionsPayload,
          brandLogo: brandLogoPayload,
        });
      } else {
        await createBike.mutateAsync({
          name,
          brand,
          specs,
          priceRange,
          mainImages: mainImagesPayload,
          details,
          region,
          colorOptions: colorOptionsPayload,
          brandLogo: brandLogoPayload,
        });
      }
      onSuccess();
    } catch (error: any) {
      // Set form-level error for display
      const message = error.message || 'Failed to save bike';
      if (message.includes('Unauthorized')) {
        setFormError('You must be signed in to create or edit bikes.');
      } else if (message.includes('connection') || message.includes('ready')) {
        setFormError('Connection not ready. Please wait a moment and try again.');
      } else {
        setFormError(message);
      }
    }
  };

  const isSubmitting = createBike.isPending || editBike.isPending;

  const getImagePreview = (entry: ImageEntry): string | null => {
    if (entry.type === 'uploaded' && entry.uploaded) {
      return entry.uploaded.getDirectURL();
    }
    if (entry.type === 'linked' && entry.linked && entry.linked.trim() !== '') {
      return entry.linked;
    }
    return null;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="brand">Brand *</Label>
          <Input
            id="brand"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="e.g., Yamaha"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Model Name *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., YZF-R1"
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
          onPaste={handlePaste}
          placeholder="e.g., 998cc, 200hp, 199kg (or paste a Markdown table)"
          rows={3}
          required
        />
        {pasteSpecsError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{pasteSpecsError}</AlertDescription>
          </Alert>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="minPrice">Min Price (USD) *</Label>
          <Input
            id="minPrice"
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="e.g., 15000"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxPrice">Max Price (USD) *</Label>
          <Input
            id="maxPrice"
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="e.g., 18000"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="region">Region *</Label>
        <Select value={region} onValueChange={(value) => setRegion(value as Region)}>
          <SelectTrigger>
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

      <div className="space-y-2">
        <Label htmlFor="details">Details</Label>
        <Textarea
          id="details"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Additional details about the bike..."
          rows={4}
        />
      </div>

      {/* Main Images */}
      <div className="space-y-4">
        <Label>Main Images</Label>
        {mainImages.map((img, index) => (
          <div key={index} className="flex gap-2 items-start p-4 border rounded-lg">
            <div className="flex-1 space-y-2">
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleMainImageUpload(index, e)}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground self-center">or</span>
                <Input
                  type="url"
                  placeholder="Image URL"
                  value={img.type === 'linked' ? img.linked || '' : ''}
                  onChange={(e) => handleMainImageLinkChange(index, e.target.value)}
                  className="flex-1"
                />
              </div>
              {uploadProgress[`main-${index}`] !== undefined && (
                <div className="text-sm text-muted-foreground">
                  Uploading: {uploadProgress[`main-${index}`]}%
                </div>
              )}
              {getImagePreview(img) && (
                <img
                  src={getImagePreview(img)!}
                  alt={`Preview ${index + 1}`}
                  className="w-32 h-32 object-cover rounded"
                />
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveMainImage(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={handleAddImageSlot} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Image
        </Button>
      </div>

      {/* Brand Logo */}
      <div className="space-y-4">
        <Label>Brand Logo (Optional)</Label>
        {brandLogo ? (
          <div className="flex gap-2 items-start p-4 border rounded-lg">
            <div className="flex-1 space-y-2">
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleBrandLogoUpload}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground self-center">or</span>
                <Input
                  type="url"
                  placeholder="Logo URL"
                  value={brandLogo.type === 'linked' ? brandLogo.linked || '' : ''}
                  onChange={(e) => handleBrandLogoLinkChange(e.target.value)}
                  className="flex-1"
                />
              </div>
              {uploadProgress.brandLogo !== undefined && (
                <div className="text-sm text-muted-foreground">
                  Uploading: {uploadProgress.brandLogo}%
                </div>
              )}
              {getImagePreview(brandLogo) && (
                <img
                  src={getImagePreview(brandLogo)!}
                  alt="Brand logo preview"
                  className="w-32 h-32 object-contain rounded bg-muted"
                />
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setBrandLogo(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={() => setBrandLogo({ type: 'linked', linked: '' })}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Brand Logo
          </Button>
        )}
      </div>

      {/* Color Options with Palette UI */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          <Label className="text-lg font-semibold">Color Options</Label>
        </div>
        
        {/* Display existing color swatches */}
        {colorOptions.length > 0 && (
          <div className="flex flex-wrap gap-3 p-4 bg-muted/30 rounded-lg border">
            {colorOptions.map((color, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-2 bg-background rounded-md border shadow-sm"
              >
                <div
                  className="w-6 h-6 rounded border-2 border-border shrink-0"
                  style={{ backgroundColor: color.colorCode }}
                  title={color.colorCode}
                />
                <span className="text-sm font-medium">{color.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 ml-1"
                  onClick={() => handleRemoveColor(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Add new color */}
        <div className="flex gap-2 items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="newColorName">Color Name</Label>
            <Input
              id="newColorName"
              value={newColorName}
              onChange={(e) => setNewColorName(e.target.value)}
              placeholder="e.g., Racing Blue"
            />
          </div>
          <div className="w-32 space-y-2">
            <Label htmlFor="newColorCode">Hex Code</Label>
            <Input
              id="newColorCode"
              type="color"
              value={newColorCode}
              onChange={(e) => setNewColorCode(e.target.value)}
              className="h-10"
            />
          </div>
          <Button type="button" onClick={handleAddColor} disabled={!newColorName.trim()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Color
          </Button>
        </div>

        {/* Color images */}
        {colorOptions.map((color, colorIndex) => (
          <div key={colorIndex} className="space-y-2 p-4 border rounded-lg bg-muted/20">
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded border"
                style={{ backgroundColor: color.colorCode }}
              />
              <Label className="font-medium">{color.name} - Images</Label>
            </div>
            {color.images.map((img, imageIndex) => (
              <div key={imageIndex} className="flex gap-2 items-start pl-7">
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleColorImageUpload(colorIndex, imageIndex, e)}
                      className="flex-1"
                    />
                    <span className="text-sm text-muted-foreground self-center">or</span>
                    <Input
                      type="url"
                      placeholder="Image URL"
                      value={img.type === 'linked' ? img.linked || '' : ''}
                      onChange={(e) => handleColorImageLinkChange(colorIndex, imageIndex, e.target.value)}
                      className="flex-1"
                    />
                  </div>
                  {uploadProgress[`color-${colorIndex}-${imageIndex}`] !== undefined && (
                    <div className="text-sm text-muted-foreground">
                      Uploading: {uploadProgress[`color-${colorIndex}-${imageIndex}`]}%
                    </div>
                  )}
                  {getImagePreview(img) && (
                    <img
                      src={getImagePreview(img)!}
                      alt={`${color.name} preview ${imageIndex + 1}`}
                      className="w-32 h-32 object-cover rounded"
                    />
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveColorImage(colorIndex, imageIndex)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAddColorImageSlot(colorIndex)}
              className="ml-7"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Image for {color.name}
            </Button>
          </div>
        ))}
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" disabled={isSubmitting || !actor || actorFetching} className="flex-1">
          {isSubmitting ? (bike ? 'Updating...' : 'Creating...') : (bike ? 'Update Bike' : 'Create Bike')}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
