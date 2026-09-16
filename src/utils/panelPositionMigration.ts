// Panel position migration — one-time adjustment of persisted panel
// positions when panel layout defaults change.
//
// Panel positions persist to IndexedDB ('asciibird-panel'). When a
// panel that others stack against changes size, stale sessions would
// otherwise wake up with overlaps. The persisted top-level
// `layoutVersion` gates the migration: v1 states predate the gradient
// tool split, which grew the toolbar panel by one button row.
//
// Layout history:
//   v1: toolbar bottom at y≈495, brushPreview flush at y=495
//   v2: toolbar grew a row (bottom y≈519) — brushPreview shifts +24

/** Current panel layout version — bump when panel geometry defaults change */
export const PANEL_LAYOUT_VERSION = 2;

/** v1 → v2: vertical growth of the toolbar panel (one tool-button row) */
export const BRUSH_PANEL_V2_SHIFT = 24;

/**
 * Migrate a persisted panel-store payload to the current layout.
 * Mutates `parsed` in place: shifts the brush panel down for v1
 * states, then stamps the current layout version.
 */
export function migratePanelStates(
  parsed: Record<string, unknown>,
): Record<string, unknown> {
  const version = typeof parsed.layoutVersion === 'number'
    ? parsed.layoutVersion
    : 0;
  // The literal 2 below is this block's TARGET version, deliberately
  // not PANEL_LAYOUT_VERSION — a future v3 bump must not re-run the
  // v2 shift. Chain new migrations as additional keyed blocks.
  if (version < 2) {
    const brush = parsed.brushPreview as { y?: unknown } | undefined;
    if (brush && typeof brush.y === 'number') {
      brush.y += BRUSH_PANEL_V2_SHIFT;
    }
  }
  parsed.layoutVersion = PANEL_LAYOUT_VERSION;
  return parsed;
}
