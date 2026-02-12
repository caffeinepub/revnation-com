/**
 * Parsed result from a Markdown table containing bike specifications.
 */
export interface ParsedMarkdownSpecs {
  specsText: string;
  minPrice?: number;
  maxPrice?: number;
  colors?: string[];
}

/**
 * Parses a Markdown table and extracts key-value pairs for bike specifications.
 * Returns a formatted string suitable for the specs field, along with optional
 * price range and color options extracted from specific rows.
 */
export function parseMarkdownTableEnhanced(markdown: string): ParsedMarkdownSpecs {
  const lines = markdown.trim().split('\n').filter(line => line.trim());
  
  if (lines.length < 2) {
    throw new Error('Invalid table format: At least 2 lines required (header and separator)');
  }

  // Find separator line (contains pipes and dashes)
  const separatorIndex = lines.findIndex(line => /^\|?[\s\-:|]+\|?$/.test(line.trim()));
  
  if (separatorIndex === -1) {
    throw new Error('Invalid table format: No separator line found (e.g., | --- | --- |)');
  }

  const headerLine = lines[separatorIndex - 1];
  if (!headerLine) {
    throw new Error('Invalid table format: No header line found before separator');
  }

  // Parse header
  const headers = headerLine
    .split('|')
    .map(h => h.trim())
    .filter(h => h);

  if (headers.length < 2) {
    throw new Error('Invalid table format: At least 2 columns required');
  }

  // Parse data rows
  const dataLines = lines.slice(separatorIndex + 1);
  const specs: string[] = [];
  let minPrice: number | undefined;
  let maxPrice: number | undefined;
  let colors: string[] | undefined;

  for (const line of dataLines) {
    const cells = line
      .split('|')
      .map(c => c.trim())
      .filter(c => c);

    if (cells.length >= 2) {
      const key = cells[0];
      const value = cells[1];
      
      if (key && value) {
        // Check for MSRP/price row with robust matching
        const keyNormalized = key.toLowerCase().replace(/[^a-z]/g, '');
        if (keyNormalized.includes('msrp') || keyNormalized === 'price' || keyNormalized === 'pricerange') {
          const priceResult = extractPriceRange(value);
          if (priceResult) {
            minPrice = priceResult.min;
            maxPrice = priceResult.max;
          }
        }
        
        // Check for Colors row
        const keyLower = key.toLowerCase();
        if (keyLower === 'colors' || keyLower === 'colour' || keyLower === 'colours' || keyLower === 'color') {
          colors = extractColors(value);
        }
        
        specs.push(`${key}: ${value}`);
      }
    }
  }

  if (specs.length === 0) {
    throw new Error('No valid data rows found in table');
  }

  return {
    specsText: specs.join('\n'),
    minPrice,
    maxPrice,
    colors,
  };
}

/**
 * Extracts min and max price from a price range string.
 * Supports formats like "$8,000 – $9,500", "8000-9500", "$8000", "$19,500 – $21,000 USD", etc.
 * Handles currency symbols, commas, trailing currency codes, and various dash types (hyphen, en-dash, em-dash).
 */
function extractPriceRange(priceString: string): { min: number; max: number } | null {
  // Remove currency symbols, commas, and trailing currency codes (USD, EUR, GBP, etc.)
  const cleaned = priceString
    .replace(/[$€£¥,]/g, '')
    .replace(/\s+(USD|EUR|GBP|JPY|CNY|INR|AUD|CAD)\s*$/i, '')
    .trim();
  
  // Try to match a range with various dash types (-, –, —)
  const rangeMatch = cleaned.match(/(\d+(?:\.\d+)?)\s*[-–—]\s*(\d+(?:\.\d+)?)/);
  
  if (rangeMatch) {
    const min = Math.floor(parseFloat(rangeMatch[1]));
    const max = Math.floor(parseFloat(rangeMatch[2]));
    if (!isNaN(min) && !isNaN(max)) {
      return { min, max };
    }
  }
  
  // Try to match a single price
  const singleMatch = cleaned.match(/(\d+(?:\.\d+)?)/);
  if (singleMatch) {
    const price = Math.floor(parseFloat(singleMatch[1]));
    if (!isNaN(price)) {
      return { min: price, max: price };
    }
  }
  
  return null;
}

/**
 * Extracts color names from a comma-separated string.
 * Splits on commas and trims whitespace from each color name.
 */
function extractColors(colorsString: string): string[] {
  return colorsString
    .split(',')
    .map(color => color.trim())
    .filter(color => color.length > 0);
}

/**
 * Legacy function for backward compatibility.
 * Parses a Markdown table and returns only the formatted specs string.
 */
export function parseMarkdownTable(markdown: string): string {
  return parseMarkdownTableEnhanced(markdown).specsText;
}

/**
 * Validates if the input looks like a Markdown table
 */
export function isMarkdownTable(text: string): boolean {
  const lines = text.trim().split('\n');
  return lines.some(line => /^\|?[\s\-:|]+\|?$/.test(line.trim()));
}
