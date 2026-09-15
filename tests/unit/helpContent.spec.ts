// helpContent drift-guard tests
//
// The help content must stay in sync with the registries it mirrors:
//  - every toolbarIcons tool has a HELP_TOOLS entry and vice versa
//  - help tool icons match the toolbar icons
//  - every SHORTCUTS registry entry appears in HELP_SHORTCUT_GROUPS
import { describe, it, expect } from 'vitest';
import { HELP_TOOLS, HELP_SHORTCUT_GROUPS } from '@/utils/helpContent';
import { toolbarIcons } from '@/utils/uiConstants';
import { SHORTCUTS } from '@/utils/shortcuts';

describe('helpContent tools', () => {
  it('documents every toolbarIcons tool exactly (no extras, no gaps)', () => {
    const toolNames = HELP_TOOLS.map(t => t.name);
    const registryNames = toolbarIcons.map(t => t.name);
    expect([...toolNames].sort()).toEqual([...registryNames].sort());
  });

  it('uses the same icons as the toolbar registry', () => {
    for (const tool of HELP_TOOLS) {
      const registry = toolbarIcons.find(t => t.name === tool.name);
      expect(registry, `tool ${tool.name} exists in toolbarIcons`).toBeDefined();
      expect(tool.icon).toBe(registry!.icon);
    }
  });

  it('has a label and a non-empty description for every tool', () => {
    for (const tool of HELP_TOOLS) {
      expect(tool.label.length).toBeGreaterThan(0);
      expect(tool.description.length).toBeGreaterThan(20);
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
