/**
 * Image overlay backfill for ASCIIBIRD document metadata.
 *
 * Metas persisted (or exported to .asb) before the overlay field existed
 * lack `imageOverlay`, which crashed consumers and produced partial
 * overlays when edited. Healing them at load/import time guarantees every
 * consumer sees a complete overlay object.
 */

import { defaultImageOverlay } from '../ascii';
import type { AsciibirdMeta } from '../types';

/**
 * Ensure every meta in the list has a complete imageOverlay object.
 * Existing overlays are left untouched.
 *
 * @param metas - Metadata array from persisted or imported state;
 *                non-array values (corrupt input) are ignored.
 */
export function backfillImageOverlays(
  metas: AsciibirdMeta[] | null | undefined,
): void {
  if (!Array.isArray(metas)) return;
  for (const meta of metas) {
    meta.imageOverlay ??= defaultImageOverlay();
  }
}
