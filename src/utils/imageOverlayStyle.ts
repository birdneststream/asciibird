/**
 * Image overlay style builder for ASCIIBIRD.
 *
 * Generates the inline CSS for the trace-mode overlay canvas
 * (#overlay-image). The overlay must sit between the canvas wrapper's
 * background and the ASCII canvas: all three canvases are z-index 0, so DOM
 * order governs painting (wrapper background → overlay → canvas → tools).
 *
 * A negative z-index must NOT be used here — .canvas-wrapper has an opaque
 * background but creates no stacking context, so a negative z-index child
 * would paint behind that background and become invisible.
 */

import type { ImageOverlay } from '../types';

/**
 * Percent-encode single quotes so they cannot terminate the url('...')
 * string. Encoding is deliberately narrow — broader escaping would corrupt
 * valid URL characters.
 */
function encodeCssUrl(url: string): string {
  return url.replace(/'/g, '%27');
}

/**
 * Build the inline style for the image overlay canvas.
 *
 * @param overlay - Overlay settings for the current tab
 * @returns Inline CSS string; `position: absolute;` alone when hidden
 */
export function buildImageOverlayStyle(overlay: ImageOverlay): string {
  if (!overlay.visible) return 'position: absolute;';

  const repeatDir = overlay.repeatx && overlay.repeaty ? 'repeat'
    : overlay.repeatx ? 'repeat-x'
    : overlay.repeaty ? 'repeat-y'
    : 'no-repeat';
  const backgroundImage = overlay.url
    ? `background-image: url('${encodeCssUrl(overlay.url)}');`
    : '';
  const backgroundSize = overlay.stretched
    ? 'background-size: 100%;'
    : `background-size: ${overlay.size}%;`;

  return [
    backgroundImage,
    backgroundSize,
    `background-repeat: ${repeatDir};`,
    `left: ${overlay.left}%;`,
    `top: ${overlay.top}%;`,
    `opacity: ${overlay.opacity / 100};`,
    'z-index: 0;',
    'position: absolute;',
  ]
    .filter(Boolean)
    .join(' ');
}
