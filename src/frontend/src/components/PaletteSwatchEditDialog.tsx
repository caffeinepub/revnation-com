import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { validateHexColor } from '../utils/sectionPalette';

interface PaletteSwatchEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentColor: string;
  onSave: (newColor: string) => void;
}

export default function PaletteSwatchEditDialog({
  open,
  onOpenChange,
  currentColor,
  onSave,
}: PaletteSwatchEditDialogProps) {
  const [hexInput, setHexInput] = useState(currentColor);
  const [error, setError] = useState<string | null>(null);

  // Reset input when dialog opens with new color
  React.useEffect(() => {
    if (open) {
      setHexInput(currentColor);
      setError(null);
    }
  }, [open, currentColor]);

  const handleSave = () => {
    const validated = validateHexColor(hexInput);
    if (!validated) {
      setError('Invalid hex color. Use format: #RRGGBB or RRGGBB');
      return;
    }
    
    onSave(validated);
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Color</DialogTitle>
          <DialogDescription>
            Update the hex color code for this palette swatch.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="hex-input">Hex Color Code</Label>
            <div className="flex gap-3 items-center">
              <div
                className="h-10 w-10 rounded border border-border shrink-0"
                style={{ backgroundColor: currentColor }}
              />
              <Input
                id="hex-input"
                placeholder="#FF0000"
                value={hexInput}
                onChange={(e) => {
                  setHexInput(e.target.value);
                  setError(null);
                }}
                onKeyDown={handleKeyDown}
                className="font-mono"
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
          
          {validateHexColor(hexInput) && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="flex gap-3 items-center">
                <div
                  className="h-16 w-full rounded border border-border"
                  style={{ backgroundColor: validateHexColor(hexInput) || undefined }}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
