import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

interface BikeImageGalleryProps {
  images: string[];
  onImageClick?: (index: number) => void;
}

export default function BikeImageGallery({ images, onImageClick }: BikeImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  const validImages = images.filter(img => img && img.trim() !== '');
  const displayImages = validImages.length > 0 ? validImages : ['/assets/generated/bike-placeholder.dim_1200x800.png'];

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
    setImageError(false);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
    setImageError(false);
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const currentImage = imageError ? '/assets/generated/bike-placeholder.dim_1200x800.png' : displayImages[currentIndex];

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-video bg-muted rounded-lg overflow-hidden group">
        <img
          src={currentImage}
          alt={`Bike image ${currentIndex + 1}`}
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
        
        {/* Navigation Arrows */}
        {displayImages.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleNext}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}

        {/* Expand Button */}
        {onImageClick && (
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onImageClick(currentIndex)}
          >
            <Maximize2 className="h-5 w-5" />
          </Button>
        )}

        {/* Image Counter */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
            {currentIndex + 1} / {displayImages.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {displayImages.map((image, index) => (
            <button
              key={index}
              onClick={() => handleThumbnailClick(index)}
              className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                index === currentIndex
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/assets/generated/bike-placeholder.dim_1200x800.png';
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
