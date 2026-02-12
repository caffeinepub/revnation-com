import { useEffect, useState, useCallback, RefObject } from 'react';

export interface TocHeading {
  id: string;
  text: string;
  level: number;
}

export function useTableOfContents<T extends HTMLElement>(contentRef: RefObject<T | null>) {
  const [headings, setHeadings] = useState<TocHeading[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  // Extract headings from content
  useEffect(() => {
    if (!contentRef.current) return;

    const headingElements = contentRef.current.querySelectorAll('h1, h2, h3');
    const extractedHeadings: TocHeading[] = [];

    headingElements.forEach((heading, index) => {
      const level = parseInt(heading.tagName.substring(1));
      const text = heading.textContent || '';
      let id = heading.id;

      // Generate ID if not present
      if (!id) {
        id = `heading-${index}-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
        heading.id = id;
      }

      extractedHeadings.push({ id, text, level });
    });

    setHeadings(extractedHeadings);
  }, [contentRef]);

  // Track active section using IntersectionObserver
  useEffect(() => {
    if (headings.length === 0) return;

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    };

    const observerOptions = {
      rootMargin: '-80px 0px -80% 0px',
      threshold: 0,
    };

    let observer: IntersectionObserver | null = null;

    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(observerCallback, observerOptions);

      headings.forEach(({ id }) => {
        const element = document.getElementById(id);
        if (element) {
          observer!.observe(element);
        }
      });
    } else {
      // Fallback for browsers without IntersectionObserver
      const handleScroll = () => {
        const scrollPosition = window.scrollY + 100;

        for (let i = headings.length - 1; i >= 0; i--) {
          const element = document.getElementById(headings[i].id);
          if (element && element.offsetTop <= scrollPosition) {
            setActiveId(headings[i].id);
            break;
          }
        }
      };

      window.addEventListener('scroll', handleScroll);
      handleScroll();

      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [headings]);

  const scrollToHeading = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Account for sticky header
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });

      setActiveId(id);
    }
  }, []);

  return { headings, activeId, scrollToHeading };
}
