import React from 'react';
import { sanitizeRichTextHTML } from '@/utils/richTextHtmlSanitizer';

interface LongFormContentProps {
  content: string;
  className?: string;
}

export default function LongFormContent({ content, className = '' }: LongFormContentProps) {
  // Check if content contains HTML tags (including images)
  const hasHTMLTags = /<[^>]+>/.test(content);

  // If content has HTML tags, render as sanitized HTML
  if (hasHTMLTags) {
    const sanitizedHTML = sanitizeRichTextHTML(content);
    
    return (
      <div 
        className={`prose prose-lg prose-neutral dark:prose-invert max-w-none ${className}`}
        dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
      />
    );
  }

  // Otherwise, parse content and convert heading markers to actual HTML headings
  const parseContent = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let currentParagraph: string[] = [];
    let key = 0;

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        const paragraphText = currentParagraph.join('\n').trim();
        if (paragraphText) {
          elements.push(
            <p key={`p-${key++}`} className="mb-4 leading-relaxed">
              {paragraphText}
            </p>
          );
        }
        currentParagraph = [];
      }
    };

    lines.forEach((line) => {
      const trimmedLine = line.trim();

      // Check for heading markers
      if (trimmedLine.startsWith('# ')) {
        flushParagraph();
        const text = trimmedLine.substring(2).trim();
        const id = `heading-${key}-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
        elements.push(
          <h1 key={`h1-${key++}`} id={id} className="text-3xl font-bold mb-4 mt-8 scroll-mt-20">
            {text}
          </h1>
        );
      } else if (trimmedLine.startsWith('## ')) {
        flushParagraph();
        const text = trimmedLine.substring(3).trim();
        const id = `heading-${key}-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
        elements.push(
          <h2 key={`h2-${key++}`} id={id} className="text-2xl font-bold mb-3 mt-6 scroll-mt-20">
            {text}
          </h2>
        );
      } else if (trimmedLine.startsWith('### ')) {
        flushParagraph();
        const text = trimmedLine.substring(4).trim();
        const id = `heading-${key}-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
        elements.push(
          <h3 key={`h3-${key++}`} id={id} className="text-xl font-semibold mb-2 mt-4 scroll-mt-20">
            {text}
          </h3>
        );
      } else if (trimmedLine === '') {
        flushParagraph();
      } else {
        currentParagraph.push(line);
      }
    });

    flushParagraph();

    return elements;
  };

  const parsedContent = parseContent(content);

  // If no headings detected, render as simple prose
  const hasHeadings = parsedContent.some(
    (el) => React.isValidElement(el) && ['h1', 'h2', 'h3'].includes(el.type as string)
  );

  if (!hasHeadings) {
    return (
      <div className={`prose prose-lg prose-neutral dark:prose-invert max-w-none ${className}`}>
        <p className="leading-relaxed whitespace-pre-wrap">{content}</p>
      </div>
    );
  }

  return <div className={`prose prose-lg prose-neutral dark:prose-invert max-w-none ${className}`}>{parsedContent}</div>;
}
