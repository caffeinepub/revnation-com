import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Trash2, X } from 'lucide-react';
import { generatePaletteFromText, validateHexColor } from '../utils/sectionPalette';
import PaletteSwatchEditDialog from '../components/PaletteSwatchEditDialog';

interface Section {
  id: string;
  text: string;
  palette: string[];
}

export default function SectionPalettesPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [newSectionText, setNewSectionText] = useState('');

  const handleCreateSection = () => {
    if (!newSectionText.trim()) return;

    const generatedPalette = generatePaletteFromText(newSectionText);
    const newSection: Section = {
      id: Date.now().toString(),
      text: newSectionText,
      palette: generatedPalette,
    };

    setSections([...sections, newSection]);
    setNewSectionText('');
  };

  const handleRemoveSection = (sectionId: string) => {
    setSections(sections.filter(s => s.id !== sectionId));
  };

  const handleTextChange = (sectionId: string, newText: string) => {
    setSections(sections.map(s => 
      s.id === sectionId ? { ...s, text: newText } : s
    ));
  };

  const handleAddColor = (sectionId: string, hexInput: string) => {
    const validated = validateHexColor(hexInput);
    if (!validated) return;

    setSections(sections.map(s => {
      if (s.id === sectionId && !s.palette.includes(validated)) {
        return { ...s, palette: [...s.palette, validated] };
      }
      return s;
    }));
  };

  const handleRemoveColor = (sectionId: string, colorToRemove: string) => {
    setSections(sections.map(s => 
      s.id === sectionId 
        ? { ...s, palette: s.palette.filter(c => c !== colorToRemove) }
        : s
    ));
  };

  const handleEditColor = (sectionId: string, oldColor: string, newColor: string) => {
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        return {
          ...s,
          palette: s.palette.map(c => c === oldColor ? newColor : c),
        };
      }
      return s;
    }));
  };

  return (
    <div className="container max-w-6xl py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Section Color Palettes</h1>
        <p className="text-muted-foreground">
          Create sections with text containing color names or hex codes. Each section will automatically generate its own color palette.
        </p>
      </div>

      {/* Create New Section */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Section</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-section-text">
              Section Text (include color names like "red, blue" or hex codes like #FF0000)
            </Label>
            <Textarea
              id="new-section-text"
              placeholder="Enter text with colors... e.g., 'I love red and blue, also #FF5733 is nice'"
              value={newSectionText}
              onChange={(e) => setNewSectionText(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
          <Button onClick={handleCreateSection} className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Create Section
          </Button>
        </CardContent>
      </Card>

      {/* Sections List */}
      <div className="space-y-6">
        {sections.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No sections yet. Create your first section above to get started.
            </CardContent>
          </Card>
        ) : (
          sections.map((section) => (
            <SectionCard
              key={section.id}
              section={section}
              onRemove={handleRemoveSection}
              onTextChange={handleTextChange}
              onAddColor={handleAddColor}
              onRemoveColor={handleRemoveColor}
              onEditColor={handleEditColor}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface SectionCardProps {
  section: Section;
  onRemove: (id: string) => void;
  onTextChange: (id: string, text: string) => void;
  onAddColor: (id: string, hex: string) => void;
  onRemoveColor: (id: string, color: string) => void;
  onEditColor: (id: string, oldColor: string, newColor: string) => void;
}

function SectionCard({ section, onRemove, onTextChange, onAddColor, onRemoveColor, onEditColor }: SectionCardProps) {
  const [colorInput, setColorInput] = useState('');
  const [editingColor, setEditingColor] = useState<string | null>(null);

  const handleAddColorClick = () => {
    if (colorInput.trim()) {
      onAddColor(section.id, colorInput);
      setColorInput('');
    }
  };

  const handleSwatchClick = (color: string) => {
    setEditingColor(color);
  };

  const handleSaveEdit = (newColor: string) => {
    if (editingColor) {
      onEditColor(section.id, editingColor, newColor);
      setEditingColor(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
          <CardTitle className="text-xl">Section {section.id.slice(-6)}</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(section.id)}
            className="h-8 w-8 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Text Area */}
          <div className="space-y-2">
            <Label htmlFor={`section-text-${section.id}`}>Section Text</Label>
            <Textarea
              id={`section-text-${section.id}`}
              value={section.text}
              onChange={(e) => onTextChange(section.id, e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Note: Palette auto-generates only on section creation. Edit text freely without regenerating.
            </p>
          </div>

          {/* Color Palette Display */}
          <div className="space-y-3">
            <Label>Color Palette ({section.palette.length} colors)</Label>
            {section.palette.length === 0 ? (
              <div className="text-sm text-muted-foreground italic">
                No colors detected. Add colors manually below.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {section.palette.map((color) => (
                  <Badge
                    key={color}
                    variant="outline"
                    className="gap-2 pr-1 pl-3 py-1.5 group hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => handleSwatchClick(color)}
                  >
                    <div
                      className="h-4 w-4 rounded-sm border border-border shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="font-mono text-xs">{color}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveColor(section.id, color);
                      }}
                      className="ml-1 rounded-sm p-0.5 hover:bg-destructive/10 transition-colors"
                    >
                      <X className="h-3 w-3 text-muted-foreground group-hover:text-destructive" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Manual Color Controls */}
          <div className="space-y-2">
            <Label htmlFor={`color-input-${section.id}`}>Add Color Manually</Label>
            <div className="flex gap-2">
              <Input
                id={`color-input-${section.id}`}
                placeholder="Enter hex code (e.g., #FF0000 or FF0000)"
                value={colorInput}
                onChange={(e) => setColorInput(e.target.value)}
                className="font-mono"
              />
              <Button onClick={handleAddColorClick} variant="secondary" className="gap-2 shrink-0">
                <PlusCircle className="h-4 w-4" />
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editingColor && (
        <PaletteSwatchEditDialog
          open={!!editingColor}
          onOpenChange={(open) => !open && setEditingColor(null)}
          currentColor={editingColor}
          onSave={handleSaveEdit}
        />
      )}
    </>
  );
}
