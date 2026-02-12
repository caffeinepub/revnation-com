import React, { useState } from 'react';
import { TocHeading } from '../hooks/useTableOfContents';
import { ChevronDown } from 'lucide-react';

interface MobileTocProps {
  headings: TocHeading[];
  activeId: string;
  onHeadingClick: (id: string) => void;
}

export default function MobileToc({ headings, activeId, onHeadingClick }: MobileTocProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (headings.length === 0) return null;

  const activeHeading = headings.find((h) => h.id === activeId);
  const activeText = activeHeading?.text || 'Table of Contents';

  const handleHeadingClick = (id: string) => {
    onHeadingClick(id);
    setIsOpen(false);
  };

  return (
    <div className="mobile-toc lg:hidden mb-6 border rounded-lg bg-card">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left font-medium"
        aria-expanded={isOpen}
      >
        <span className="text-sm">
          <span className="text-muted-foreground mr-2">On This Page:</span>
          {activeText}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="border-t p-4">
          <ul className="space-y-2 text-sm">
            {headings.map((heading) => {
              const isActive = heading.id === activeId;
              const indent = (heading.level - 1) * 12;

              return (
                <li key={heading.id} style={{ paddingLeft: `${indent}px` }}>
                  <button
                    onClick={() => handleHeadingClick(heading.id)}
                    className={`text-left w-full py-1.5 px-2 rounded transition-colors ${
                      isActive
                        ? 'text-foreground font-medium bg-accent/50'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/30'
                    }`}
                  >
                    {heading.text}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
