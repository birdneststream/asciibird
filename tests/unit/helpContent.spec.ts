// helpContent drift-guard tests
//
// The help content must stay in sync with the sources it mirrors:
//  - tool names/labels/icons derive from the toolbarIcons registry +
//    toolLabel() — asserted equal here
//  - every SHORTCUTS registry entry appears in HELP_SHORTCUT_GROUPS
//  - the known set of inline-registered shortcuts (useGlobalShortcuts /
//    useEditorHotkeys / KeyboardShortcuts.vue) is asserted to appear,
//    so a new inline registration added here keeps the help honest
import { describe, it, expect } from 'vitest';
import { HELP_TOOLS, HELP_SHORTCUT_GROUPS } from '@/utils/helpContent';
import { toolbarIcons } from '@/utils/uiConstants';
import { toolLabel } from '@/utils/toolbar';
import { SHORTCUTS } from '@/utils/shortcuts';

describe('helpContent tools', () => {
  it('mirrors toolbarIcons exactly — names, labels and icons', () => {
    expect(HELP_TOOLS.map(t => t.name)).toEqual(toolbarIcons.map(t => t.name));
    for (const tool of HELP_TOOLS) {
      const registry = toolbarIcons.find(t => t.name === tool.name)!;
      expect(tool.label).toBe(toolLabel(registry));
      expect(tool.icon).toBe(registry.icon);
    }
  });

  it('has a non-empty description for every tool', () => {
    for (const tool of HELP_TOOLS) {
      expect(tool.description.length, `description for ${tool.name}`).toBeGreaterThan(20);
    }
  });
});

describe('helpContent shortcuts', () => {
  /** All key labels shown in the help, flattened */
  const allKeys = HELP_SHORTCUT_GROUPS
    .flatMap(g => g.shortcuts.map(s => s.keys))
    .join(' | ');

  it('includes every SHORTCUTS registry entry (labels cannot drift)', () => {
    for (const [id, def] of Object.entries(SHORTCUTS)) {
      expect(
        allKeys.includes(def.label),
        `registry entry ${id} (${def.label}) appears in the help`,
      ).toBe(true);
    }
  });

  it('documents the inline-registered editor shortcuts', () => {
    // Keys registered outside the SHORTCUTS registry — when a new one
    // is added (useGlobalShortcuts.ts, useEditorHotkeys.ts,
    // KeyboardShortcuts.vue), extend this list AND the help.
    const inlineKeys = [
      'F1', 'Shift+F1', 'Escape',
      'Ctrl+Z', 'Ctrl+Y',
      'B', 'S', 'T', 'F', 'E', 'Q', 'G', 'R', 'L',
      'Shift+S', 'Alt+1 … 8',
      'Ctrl+1 … 9',
      'Shift+Arrows', 'Ctrl+Shift+B',
    ];
    for (const key of inlineKeys) {
      expect(allKeys, `inline key ${key} documented`).toContain(key);
    }
  });

  it('documents the hold-to-apply shape modifier alternates', () => {
    expect(allKeys).toContain('Shift or Z');
    expect(allKeys).toContain('Alt or A');
  });

  it('has non-empty actions and group titles', () => {
    for (const group of HELP_SHORTCUT_GROUPS) {
      expect(group.title.length).toBeGreaterThan(0);
      expect(group.shortcuts.length).toBeGreaterThan(0);
      for (const s of group.shortcuts) {
        expect(s.keys.length).toBeGreaterThan(0);
        expect(s.action.length).toBeGreaterThan(0);
      }
    }
  });
});
