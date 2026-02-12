import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Trash2, X, Check } from 'lucide-react';
import { generatePaletteFromText, validateHexColor } from '../utils/sectionPalette';

interface PaletteSwatch {
  hex: string;
  label: string;
}

interface Section {
  id: string;
  text: string;
  palette: PaletteSwatch[];
}

export default function SectionPalettesPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [newSectionText, setNewSectionText] = useState('');

  const handleCreateSection = () => {
    if (!newSectionText.trim()) return;

    const generatedHexColors = generatePaletteFromText(newSectionText);
    const generatedPalette: PaletteSwatch[] = generatedHexColors.map((hex, index) => ({
      hex,
      label: `Color ${index + 1}`,
    }));

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

  const handleAddColor = (sectionId: string, hexInput: string, label: string) => {
    const validated = validateHexColor(hexInput);
    if (!validated) return;

    setSections(sections.map(s => {
      if (s.id === sectionId) {
        // Check if hex already exists
        const hexExists = s.palette.some(swatch => swatch.hex === validated);
        if (!hexExists) {
          return { ...s, palette: [...s.palette, { hex: validated, label }] };
        }
      }
      return s;
    }));
  };

  const handleRemoveColor = (sectionId: string, hexToRemove: string) => {
    setSections(sections.map(s => 
      s.id === sectionId 
        ? { ...s, palette: s.palette.filter(swatch => swatch.hex !== hexToRemove) }
        : s
    ));
  };

  const handleEditColor = (sectionId: string, oldHex: string, newHex: string, newLabel: string) => {
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        return {
          ...s,
          palette: s.palette.map(swatch => 
            swatch.hex === oldHex ? { hex: newHex, label: newLabel } : swatch
          ),
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
  onAddColor: (id: string, hex: string, label: string) => void;
  onRemoveColor: (id: string, hex: string) => void;
  onEditColor: (id: string, oldHex: string, newHex: string, newLabel: string) => void;
}

function SectionCard({ section, onRemove, onTextChange, onAddColor, onRemoveColor, onEditColor }: SectionCardProps) {
  const [colorInput, setColorInput] = useState('');
  const [labelInput, setLabelInput] = useState('');
  const [editingHex, setEditingHex] = useState<string | null>(null);
  const [draftHex, setDraftHex] = useState('');
  const [draftLabel, setDraftLabel] = useState('');
  const [editError, setEditError] = useState<string | null>(null);

  const handleAddColorClick = () => {
    if (colorInput.trim()) {
      const label = labelInput.trim() || `Color ${section.palette.length + 1}`;
      onAddColor(section.id, colorInput, label);
      setColorInput('');
      setLabelInput('');
    }
  };

  const handleSwatchClick = (swatch: PaletteSwatch) => {
    setEditingHex(swatch.hex);
    setDraftHex(swatch.hex);
    setDraftLabel(swatch.label);
    setEditError(null);
  };

  const handleSaveEdit = () => {
    if (!editingHex) return;

    const validated = validateHexColor(draftHex);
    if (!validated) {
      setEditError('Invalid hex color. Use format: #RRGGBB or RRGGBB');
      return;
    }

    const trimmedLabel = draftLabel.trim();
    if (!trimmedLabel) {
      setEditError('Label cannot be empty');
      return;
    }

    onEditColor(section.id, editingHex, validated, trimmedLabel);
    setEditingHex(null);
    setEditError(null);
  };

  const handleCancelEdit = () => {
    setEditingHex(null);
    setEditError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, field: 'hex' | 'label') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  return (
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
              {section.palette.map((swatch) => {
                const isEditing = editingHex === swatch.hex;

                if (isEditing) {
                  // Inline edit mode
                  return (
                    <div
                      key={swatch.hex}
                      className="flex flex-col gap-2 p-3 border border-primary rounded-md bg-card shadow-sm min-w-[240px]"
                    >
                      <div className="flex gap-2 items-center">
                        <div
                          className="h-8 w-8 rounded border border-border shrink-0"
                          style={{ backgroundColor: validateHexColor(draftHex) || swatch.hex }}
                        />
                        <Input
                          placeholder="Hex code"
                          value={draftHex}
                          onChange={(e) => {
                            setDraftHex(e.target.value);
                            setEditError(null);
                          }}
                          onKeyDown={(e) => handleKeyDown(e, 'hex')}
                          className="font-mono text-xs h-8"
                          autoFocus
                        />
                      </div>
                      <Input
                        placeholder="Label"
                        value={draftLabel}
                        onChange={(e) => {
                          setDraftLabel(e.target.value);
                          setEditError(null);
                        }}
                        onKeyDown={(e) => handleKeyDown(e, 'label')}
                        className="text-xs h-8"
                      />
                      {editError && (
                        <p className="text-xs text-destructive">{editError}</p>
                      )}
                      <div className="flex gap-1 justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCancelEdit}
                          className="h-7 px-2 text-xs"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveEdit}
                          className="h-7 px-2 text-xs"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Save
                        </Button>
                      </div>
                    </div>
                  );
                }

                // Normal display mode
                return (
                  <Badge
                    key={swatch.hex}
                    variant="outline"
                    className="gap-2 pr-1 pl-3 py-1.5 group hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => handleSwatchClick(swatch)}
                  >
                    <div
                      className="h-4 w-4 rounded-sm border border-border shrink-0"
                      style={{ backgroundColor: swatch.hex }}
                    />
                    <div className="flex flex-col items-start gap-0.5">
                      <span className="text-xs font-medium">{swatch.label}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">{swatch.hex}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveColor(section.id, swatch.hex);
                      }}
                      className="ml-1 rounded-sm p-0.5 hover:bg-destructive/10 transition-colors"
                    >
                      <X className="h-3 w-3 text-muted-foreground group-hover:text-destructive" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          )}
        </div>

        {/* Manual Color Controls */}
        <div className="space-y-2">
          <Label htmlFor={`color-input-${section.id}`}>Add Color Manually</Label>
          <div className="flex gap-2 flex-wrap">
            <Input
              id={`color-input-${section.id}`}
              placeholder="Hex code (e.g., #FF0000)"
              value={colorInput}
              onChange={(e) => setColorInput(e.target.value)}
              className="font-mono flex-1 min-w-[140px]"
            />
            <Input
              placeholder="Label (optional)"
              value={labelInput}
              onChange={(e) => setLabelInput(e.target.value)}
              className="flex-1 min-w-[140px]"
            />
            <Button onClick={handleAddColorClick} variant="secondary" className="gap-2 shrink-0">
              <PlusCircle className="h-4 w-4" />
              Add
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
