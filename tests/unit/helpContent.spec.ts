// helpContent drift-guard tests
//
// The help content must stay in sync with the sources it mirrors:
//  - tool names/labels/icons derive from the toolbarIcons registry +
//    toolLabel() — asserted equal here
//  - shape sub-entries derive from the shapes registry (SHAPE_TYPES /
//    SHAPE_LABELS / SHAPE_ICONS)
//  - tool activation chips derive from TOOL_SHORTCUT_KEYS (shared with
//    useGlobalShortcuts.ts)
//  - every SHORTCUTS registry entry appears in HELP_SHORTCUT_GROUPS
//  - the known set of inline-registered shortcuts (useGlobalShortcuts /
//    useEditorHotkeys / KeyboardShortcuts.vue) is asserted to appear,
//    so a new inline registration added here keeps the help honest
import { describe, it, expect } from 'vitest';
import { HELP_TOOLS, HELP_PANELS, HELP_SHORTCUT_GROUPS } from '@/utils/helpContent';
import { toolbarIcons } from '@/utils/uiConstants';
import { toolLabel } from '@/utils/toolbar';
import { SHORTCUTS } from '@/utils/shortcuts';
import { SHAPE_TYPES, SHAPE_LABELS, SHAPE_ICONS } from '@/utils/shapes';
import type { ShapeType } from '@/utils/shapes';
import { TOOL_SHORTCUT_KEYS } from '@/utils/toolShortcutKeys';

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

describe('helpContent tool shortcuts', () => {
  it('TOOL_SHORTCUT_KEYS names all exist in the toolbar registry', () => {
    const names = toolbarIcons.map(t => t.name);
    for (const name of Object.keys(TOOL_SHORTCUT_KEYS)) {
      expect(names, `tool ${name} exists`).toContain(name);
    }
  });

  it('shows an activation chip on exactly the tools with keys', () => {
    for (const tool of HELP_TOOLS) {
      expect(tool.shortcut).toBe(TOOL_SHORTCUT_KEYS[tool.name]);
    }
  });
});

describe('helpContent shape types', () => {
  const shapesTool = HELP_TOOLS.find(t => t.name === 'shapes')!;

  it('documents every shape type with its toolbar icon and label', () => {
    expect(shapesTool.shapeTypes).toBeDefined();
    expect(shapesTool.shapeTypes!.map(s => s.name)).toEqual([...SHAPE_TYPES]);
    for (const shapeType of shapesTool.shapeTypes!) {
      const id = shapeType.name as ShapeType;
      expect(shapeType.label).toBe(SHAPE_LABELS[id]);
      expect(shapeType.icon).toBe(SHAPE_ICONS[id]);
    }
  });

  it('only the shapes tool has shape sub-entries', () => {
    for (const tool of HELP_TOOLS) {
      if (tool.name !== 'shapes') {
        expect(tool.shapeTypes, `no shapes on ${tool.name}`).toBeUndefined();
      }
    }
  });
});

describe('helpContent panels', () => {
  it('documents the main work-area sections with unique ids', () => {
    const ids = HELP_PANELS.map(p => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const required of ['menu-bar', 'tab-bar', 'toolbar', 'colours', 'layers', 'canvas']) {
      expect(ids, `section ${required}`).toContain(required);
    }
  });

  it('has an icon, purpose and items for every section', () => {
    for (const section of HELP_PANELS) {
      expect(section.icon.length, `icon for ${section.id}`).toBeGreaterThan(0);
      expect(section.purpose.length, `purpose for ${section.id}`).toBeGreaterThan(20);
      expect(section.items.length, `items for ${section.id}`).toBeGreaterThan(0);
      for (const item of section.items) {
        expect(item.length).toBeGreaterThan(10);
      }
    }
  });

  it('renders shortcut chips via non-empty keys and actions', () => {
    for (const section of HELP_PANELS) {
      for (const shortcut of section.shortcuts) {
        expect(shortcut.keys.length, `keys in ${section.id}`).toBeGreaterThan(0);
        expect(shortcut.action.length, `action in ${section.id}`).toBeGreaterThan(0);
      }
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
