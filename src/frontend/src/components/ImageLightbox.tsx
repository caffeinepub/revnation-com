import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface ImageLightboxProps {
  images: string[];
  initialIndex?: number;
  open: boolean;
  onClose: () => void;
}

export default function ImageLightbox({ images, initialIndex = 0, open, onClose }: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setImageError(false);
  }, [initialIndex, open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, currentIndex, images.length]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setImageError(false);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const currentImage = imageError ? '/assets/generated/bike-placeholder.dim_1200x800.png' : images[currentIndex];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-full h-[90vh] p-0 bg-background/95 backdrop-blur-sm">
        <div className="relative w-full h-full flex items-center justify-center p-4">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 bg-background/80 hover:bg-background"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>

          {/* Main Image */}
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={currentImage}
              alt={`Image ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              onError={handleImageError}
            />
          </div>

          {/* Navigation */}
          {images.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                onClick={handlePrevious}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                onClick={handleNext}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>

              {/* Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
                {currentIndex + 1} / {images.length}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
