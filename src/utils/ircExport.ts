// Shared IRC export utilities for ASCIIBIRD
// Used by both Dashboard.vue and Editor.vue for mIRC export operations

import type { MircExportResult } from '../types';
import { checkIrcByteLimits } from '../ascii';

// Re-export for convenience
export { checkIrcByteLimits } from '../ascii';

/**
 * Shared export logic for clipboard and file export types.
 * Shows IRC line length warnings if lines exceed 500 bytes.
 *
 * @param type - 'clipboard' or 'file'
 * @param ascii - The mIRC export result
 * @param copyText - Function to copy text to clipboard
 * @param showToast - Function to show toast notifications
 */
export function startExport(
  type: 'clipboard' | 'file',
  ascii: MircExportResult,
  copyText: (text: string) => Promise<any>,
  showToast: (message: string, options: Record<string, unknown>) => void,
): void {
  const checkLines = checkIrcByteLimits(ascii.output.join(''));

  if (checkLines.length) {
    const displayLines = checkLines.join(', ');
    showToast(
      `Line${checkLines.length > 1 ? 's' : ''} ${displayLines} may be too large for IRC.`,
      {
        type: 'error',
        position: 'bottom-center',
        duration: 1200,
      },
    );
  }

  switch (type) {
    case 'clipboard':
      copyText(ascii.output.join('')).then(
        () => {
          showToast('Copied mIRC to clipboard!', { type: 'success' });
        },
        () => {
          showToast('Error when copying mIRC to clipboard!', { type: 'error' });
        },
      );
      break;

    case 'file':
    default:
      // File download handled by caller (needs import of downloadFile)
      break;
  }
}
