import React from 'react';
import { TocHeading } from '../hooks/useTableOfContents';

interface TableOfContentsProps {
  headings: TocHeading[];
  activeId: string;
  onHeadingClick: (id: string) => void;
}

export default function TableOfContents({ headings, activeId, onHeadingClick }: TableOfContentsProps) {
  if (headings.length === 0) return null;

  return (
    <nav className="toc-nav" aria-label="Table of contents">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">On This Page</h2>
      <ul className="space-y-2 text-sm">
        {headings.map((heading) => {
          const isActive = heading.id === activeId;
          const indent = (heading.level - 1) * 12;

          return (
            <li key={heading.id} style={{ paddingLeft: `${indent}px` }}>
              <button
                onClick={() => onHeadingClick(heading.id)}
                className={`text-left w-full py-1 px-2 rounded transition-colors hover:text-foreground ${
                  isActive
                    ? 'text-foreground font-medium bg-accent/50 border-l-2 border-primary'
                    : 'text-muted-foreground hover:bg-accent/30'
                }`}
                aria-current={isActive ? 'location' : undefined}
              >
                {heading.text}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
