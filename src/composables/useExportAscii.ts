// Export ASCII art composable — shared by Dashboard, Editor, BrushCanvas, MainBrushCanvas
import { exportMirc, downloadFile, checkIrcByteLimits } from '../ascii';
import { useToast } from './useToast';
import { useClipboard } from './useClipboard';
import type { Block } from '../types';

export interface ExportAsciiOptions {
  /** Supply block data to export. Return false/null for global export. */
  getBlocks?: () => Block[][] | false | null;
  /** Filename for file export (overrides default from exportMirc). */
  getFilename?: () => string;
  /** Label for toast messages (e.g. "mIRC" vs "mIRC brush"). */
  label?: string;
  /** Whether to check IRC byte limits before export (default: true). */
  checkLimits?: boolean;
  /** Called after export completes (e.g. to close context menu). */
  closeMenu?: () => void;
}

export function useExportAscii(options: ExportAsciiOptions = {}) {
  const { show: toastShow } = useToast();
  const { copyText } = useClipboard();

  const {
    getBlocks,
    getFilename,
    label = 'mIRC',
    checkLimits = true,
    closeMenu,
  } = options;

  function startExport(
    type: 'clipboard' | 'file' | 'post',
    postHandler?: (asciiText: string) => void,
  ): void {
    const blocks = getBlocks ? getBlocks() : null;
    const ascii = exportMirc(blocks || null);

    // Check IRC byte limits (main canvas exports only)
    if (checkLimits) {
      const checkLines = checkIrcByteLimits(ascii.output.join(''));

      if (checkLines.length) {
        const displayLines = checkLines.join(', ');
        toastShow(
          `Line${checkLines.length > 1 ? 's' : ''} ${displayLines} may be too large for IRC.`,
          { type: 'error', duration: 1200 },
        );
      }
    }

    const asciiText = ascii.output.join('');
    const filename = getFilename ? getFilename() : ascii.filename;

    switch (type) {
      case 'clipboard':
        copyText(asciiText).then(
          () => {
            toastShow(`Copied ${label} to clipboard!`, { type: 'success' });
          },
          () => {
            toastShow(`Error when copying ${label} to clipboard!`, {
              type: 'error',
            });
          },
        );
        break;

      case 'post':
        if (postHandler) {
          postHandler(asciiText);
        }
        break;

      default:
      case 'file':
        downloadFile(asciiText, filename, 'text/plain');
        break;
    }

    closeMenu?.();
  }

  return { startExport };
}
