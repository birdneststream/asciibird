import type { AsciibirdMeta } from '../types';

/**
 * Get the title of the current ASCII document, or 'ascii' as fallback.
 * Replaces the repeated `(currentAscii as { title: string })?.title ?? 'ascii'`
 * pattern across the codebase.
 */
export function getAsciiTitle(
  currentAscii: AsciibirdMeta | undefined,
): string {
  return currentAscii?.title ?? 'ascii';
}
