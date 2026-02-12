/**
 * Utility functions for serializing and deserializing review-specific fields
 * (pros, cons, rating) between UI state and backend format.
 */

/**
 * Convert textarea content to array of strings (one per line).
 * Splits on newlines, trims each line, and filters out empty lines.
 */
export function textareaToArray(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/**
 * Convert array of strings to textarea content (joined by newlines).
 */
export function arrayToTextarea(arr: string[]): string {
  return arr.join('\n');
}

/**
 * Normalize rating value to a number between 0 and 100.
 * Returns 0 for invalid/empty inputs.
 */
export function normalizeRating(value: string | number): number {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num) || num < 0) return 0;
  if (num > 100) return 100;
  return Math.round(num);
}
