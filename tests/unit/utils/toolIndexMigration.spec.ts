// Tool index migration tests — one-time remapping of the persisted
// numeric currentTool index across toolbarIcons layout changes
import { describe, it, expect } from 'vitest';
import {
  migrateToolIndex,
  TOOL_LAYOUT_VERSION,
} from '../../../src/utils/toolIndexMigration';
import { toolbarIcons } from '../../../src/utils/uiConstants';

const COUNT = toolbarIcons.length;

describe('migrateToolIndex', () => {
  it('v1 gradient index 9 lands on gradient-vertical (v2 index 9)', () => {
    const idx = migrateToolIndex(9, 0, COUNT);
    expect(toolbarIcons[idx].name).toBe('gradient-vertical');
  });

  it('v1 shapes index 10 remaps to the v2 shapes index', () => {
    const idx = migrateToolIndex(10, 0, COUNT);
    expect(toolbarIcons[idx].name).toBe('shapes');
  });

  it('v1 indices outside the legacy remap pass through', () => {
    // e.g. v1 brush (4) stays brush
    expect(toolbarIcons[migrateToolIndex(4, 0, COUNT)].name).toBe('brush');
  });

  it('already-current version (>= v2) is not remapped', () => {
    // A v2 user sitting on gradient-horizontal (10) must NOT be
    // moved to shapes — the migration is one-time only
    const idx = migrateToolIndex(10, TOOL_LAYOUT_VERSION, COUNT);
    expect(toolbarIcons[idx].name).toBe('gradient-horizontal');
  });

  it('clamps out-of-range indices to the default tool', () => {
    expect(migrateToolIndex(COUNT + 5, TOOL_LAYOUT_VERSION, COUNT)).toBe(0);
    expect(migrateToolIndex(-1, TOOL_LAYOUT_VERSION, COUNT)).toBe(0);
    expect(migrateToolIndex(99.5, TOOL_LAYOUT_VERSION, COUNT)).toBe(0);
  });

  it('clamps stale v1 out-of-range indices too', () => {
    expect(migrateToolIndex(50, 0, COUNT)).toBe(0);
  });

  it('missing/invalid version is treated as v1', () => {
    expect(toolbarIcons[migrateToolIndex(10, NaN, COUNT)].name).toBe('shapes');
  });
});
