/**
 * Single-key tool activation shortcuts.
 *
 * Shared source of truth for the editor's tool-switching hotkeys
 * (useGlobalShortcuts.ts) and the in-app help (helpContent.ts) so the
 * two can never drift apart.
 *
 * Keyed by toolbarIcons tool name. 'e' (eraser) is context-sensitive at
 * runtime — when the brush or eraser tool is active it flips the brush
 * horizontally instead of switching tools — so its help copy notes that.
 * 'q' (flip vertical) and 'g' (grid toggle) are not tool activations and
 * stay registered inline in useGlobalShortcuts.ts.
 */
export const TOOL_SHORTCUT_KEYS: Record<string, string> = {
  brush: 'B',
  select: 'S',
  text: 'T',
  fill: 'F',
  eraser: 'E',
  'replace-color': 'R',
  shapes: 'L',
};
