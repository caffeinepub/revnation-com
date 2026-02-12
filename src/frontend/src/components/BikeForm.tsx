import { useState, useEffect } from 'react';
import { useCreateBike, useEditBike } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, Upload, Plus, AlertCircle } from 'lucide-react';
import type { Bike, ColorOption, ImageType } from '../backend';
import { Region, ExternalBlob } from '../backend';
import { toast } from 'sonner';
import { parseMarkdownTableEnhanced, isMarkdownTable } from '../utils/markdownSpecs';

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

  const handlePasteSpecsApply = () => {
    setPasteSpecsError('');
    
    if (!pasteSpecsText.trim()) {
      setPasteSpecsError('Please paste a Markdown table first');
      return;
    }

    if (!isMarkdownTable(pasteSpecsText)) {
      setPasteSpecsError('The pasted text does not appear to be a valid Markdown table. Please check the format.');
      return;
    }

    try {
      const parsed = parseMarkdownTableEnhanced(pasteSpecsText);
      
      // Apply specs text
      setSpecs(parsed.specsText);
      
      // Apply price range if present
      if (parsed.minPrice !== undefined) {
        setMinPrice(parsed.minPrice.toString());
      }
      if (parsed.maxPrice !== undefined) {
        setMaxPrice(parsed.maxPrice.toString());
      }
      
      // Apply colors if present
      if (parsed.colors && parsed.colors.length > 0) {
        // Merge colors: add new ones that don't already exist (case-insensitive)
        const existingColorNames = colorOptions.map(c => c.name.toLowerCase());
        const newColors: ColorOptionForm[] = parsed.colors
          .filter(colorName => !existingColorNames.includes(colorName.toLowerCase()))
          .map(colorName => ({
            name: colorName,
            colorCode: '#000000', // Default color code
            images: [], // Empty images list
          }));
        
        if (newColors.length > 0) {
          setColorOptions([...colorOptions, ...newColors]);
        }
      }
      
      setPasteSpecsText('');
      toast.success('Specifications parsed and applied successfully');
    } catch (error: any) {
      setPasteSpecsError(error.message || 'Failed to parse Markdown table');
    }
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
    } catch (error) {
      // Error handling is done in the mutation hooks
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
        <Label htmlFor="brandLogo">Brand Logo</Label>
        <div className="space-y-3">
          {brandLogo && getImagePreview(brandLogo) && (
            <div className="relative w-24 h-24 rounded-lg border-2 border-border overflow-hidden bg-muted">
              <img
                src={getImagePreview(brandLogo)!}
                alt="Brand logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6"
                onClick={() => setBrandLogo(null)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
          <div className="flex gap-2">
            <div>
              <Input
                id="brandLogoUpload"
                type="file"
                accept="image/*"
                onChange={handleBrandLogoUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('brandLogoUpload')?.click()}
                disabled={!!uploadProgress.brandLogo}
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploadProgress.brandLogo ? `Uploading ${uploadProgress.brandLogo}%` : 'Upload Logo'}
              </Button>
            </div>
            <Input
              placeholder="Or paste image URL"
              value={brandLogo?.type === 'linked' ? brandLogo.linked || '' : ''}
              onChange={(e) => handleBrandLogoLinkChange(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>
      </div>

      {/* Paste Specs Section */}
      <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
        <div className="flex items-center justify-between">
          <Label htmlFor="pasteSpecs" className="text-base font-semibold">Paste Specs (Markdown Table)</Label>
        </div>
        <p className="text-sm text-muted-foreground">
          Paste a Markdown table here to auto-fill specifications, price range, and color options. Example format:
        </p>
        <pre className="text-xs bg-background p-2 rounded border overflow-x-auto">
{`| Category     | Details                    |
| ------------ | -------------------------- |
| MSRP         | $8,000 – $9,500            |
| Engine       | 649cc parallel twin        |
| Colors       | Lime Green, Matte Gray     |`}
        </pre>
        <Textarea
          id="pasteSpecs"
          value={pasteSpecsText}
          onChange={(e) => {
            setPasteSpecsText(e.target.value);
            setPasteSpecsError('');
          }}
          placeholder="Paste your Markdown table here..."
          rows={6}
          className="font-mono text-sm"
        />
        {pasteSpecsError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{pasteSpecsError}</AlertDescription>
          </Alert>
        )}
        <Button
          type="button"
          variant="secondary"
          onClick={handlePasteSpecsApply}
          disabled={!pasteSpecsText.trim()}
        >
          Parse & Apply to Specifications
        </Button>
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
        <Label htmlFor="details">Details</Label>
        <Textarea
          id="details"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Additional details about the bike"
          rows={3}
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

      <div className="space-y-2">
        <Label>Main Images</Label>
        <div className="space-y-3">
          {mainImages.map((img, index) => (
            <div key={index} className="flex gap-2 items-start">
              {getImagePreview(img) && (
                <div className="relative w-20 h-20 rounded border overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={getImagePreview(img)!}
                    alt={`Main ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div className="flex-1 flex gap-2">
                <div>
                  <Input
                    id={`mainImage-${index}`}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleMainImageUpload(index, e)}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById(`mainImage-${index}`)?.click()}
                    disabled={!!uploadProgress[`main-${index}`]}
                  >
                    <Upload className="h-3 w-3 mr-1" />
                    {uploadProgress[`main-${index}`] ? `${uploadProgress[`main-${index}`]}%` : 'Upload'}
                  </Button>
                </div>
                <Input
                  placeholder="Or paste image URL"
                  value={img.type === 'linked' ? img.linked || '' : ''}
                  onChange={(e) => handleMainImageLinkChange(index, e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveMainImage(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddImageSlot}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Image Slot
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-base font-semibold">Color Options</Label>
        
        {colorOptions.map((color, colorIndex) => (
          <div key={colorIndex} className="p-4 border rounded-lg space-y-3 bg-muted/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded border-2 border-border"
                  style={{ backgroundColor: color.colorCode }}
                />
                <div>
                  <p className="font-medium">{color.name}</p>
                  <p className="text-xs text-muted-foreground">{color.colorCode}</p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveColor(colorIndex)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Images for {color.name}</Label>
              {color.images.map((img, imageIndex) => (
                <div key={imageIndex} className="flex gap-2 items-start">
                  {getImagePreview(img) && (
                    <div className="relative w-16 h-16 rounded border overflow-hidden bg-muted flex-shrink-0">
                      <img
                        src={getImagePreview(img)!}
                        alt={`${color.name} ${imageIndex + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <div className="flex-1 flex gap-2">
                    <div>
                      <Input
                        id={`colorImage-${colorIndex}-${imageIndex}`}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleColorImageUpload(colorIndex, imageIndex, e)}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById(`colorImage-${colorIndex}-${imageIndex}`)?.click()}
                        disabled={!!uploadProgress[`color-${colorIndex}-${imageIndex}`]}
                      >
                        <Upload className="h-3 w-3 mr-1" />
                        {uploadProgress[`color-${colorIndex}-${imageIndex}`] ? `${uploadProgress[`color-${colorIndex}-${imageIndex}`]}%` : 'Upload'}
                      </Button>
                    </div>
                    <Input
                      placeholder="Or paste image URL"
                      value={img.type === 'linked' ? img.linked || '' : ''}
                      onChange={(e) => handleColorImageLinkChange(colorIndex, imageIndex, e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveColorImage(colorIndex, imageIndex)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddColorImageSlot(colorIndex)}
              >
                <Plus className="h-3 w-3 mr-2" />
                Add Image
              </Button>
            </div>
          </div>
        ))}

        <div className="flex gap-2">
          <Input
            placeholder="Color name"
            value={newColorName}
            onChange={(e) => setNewColorName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddColor();
              }
            }}
          />
          <Input
            type="color"
            value={newColorCode}
            onChange={(e) => setNewColorCode(e.target.value)}
            className="w-20"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleAddColor}
            disabled={!newColorName.trim()}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Color
          </Button>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? 'Saving...' : bike ? 'Update Bike' : 'Create Bike'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
