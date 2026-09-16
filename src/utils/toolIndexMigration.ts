// Tool index migration — remapping of the persisted numeric
// `currentTool` index when the toolbarIcons registry layout changes.
//
// `currentTool` persists as a NUMBER into toolbarState (IndexedDB via
// pinia-plugin-persistedstate). When entries are inserted into the
// registry, stale sessions would otherwise wake up on the wrong tool.
// The persisted `toolbarState.toolLayoutVersion` gates the remapping:
// it is idempotent, so re-running on later hydrations (before the
// bumped version has been written back by a state mutation) is safe.
//
// Layout history:
//   v1: [.., 8 replace-color, 9 gradient, 10 shapes]
//   v2: [.., 8 replace-color, 9 gradient-vertical, 10 gradient-horizontal,
//        11 gradient-corner, 12 shapes]  ← gradient split into three tools

import { toolbarIcons } from './uiConstants';

/** Current toolbarIcons layout version — bump when inserting/removing tools */
export const TOOL_LAYOUT_VERSION = 2;

/**
 * v1 → v2 index remapping. The old single `gradient` (9) lands on
 * `gradient-vertical` (also 9) naturally; `shapes` moved 10 → 12.
 * Resolved from the live registry by name so future appends cannot
 * rot the mapping.
 */
const V1_TO_V2_INDEX: Record<number, number> = {
  10: toolbarIcons.findIndex(t => t.name === 'shapes'),
};

/** Clamp an index into registry range, falling back to the default tool */
function clampToolIndex(index: number, toolCount: number): number {
  return Number.isInteger(index) && index >= 0 && index < toolCount
    ? index
    : 0;
}

/**
 * Migrate a persisted `currentTool` index to the current layout.
 *
 * @param index - persisted tool index (may be stale/out of range)
 * @param fromVersion - persisted `toolLayoutVersion` (0/missing = v1)
 * @param toolCount - `toolbarIcons.length` at migration time
 * @returns the remapped, range-clamped index
 */
export function migrateToolIndex(
  index: number,
  fromVersion: number,
  toolCount: number,
): number {
  const version = Number.isFinite(fromVersion) ? fromVersion : 0;
  if (version >= TOOL_LAYOUT_VERSION) {
    return clampToolIndex(index, toolCount);
  }
  const mapped = V1_TO_V2_INDEX[index] ?? index;
  return clampToolIndex(mapped, toolCount);
}
