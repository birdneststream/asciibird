// UI constants for ASCIIBIRD toolbar and interface.
//
// Contains toolbar icon definitions and other UI-facing constants
// that are not colour-related. Pure data — no store dependencies.

import type { GradientDirection } from './gradientFill';
import type { ToolbarIcon } from '../types';

// Toolbar icons — maps tool names to Material Icons identifiers.
// ORDER IS LOAD-BEARING: `currentTool` persists as a numeric index
// into this array (IndexedDB). Never reorder/insert in place —
// append-only, or bump TOOL_LAYOUT_VERSION and add a mapping in
// utils/toolIndexMigration.ts.
export const toolbarIcons: ToolbarIcon[] = [
  { name: 'default', icon: 'edit_off' },
  { name: 'select', icon: 'photo_size_select_small' },
  { name: 'text', icon: 'text_rotation_none' },
  { name: 'fill', icon: 'format_color_fill' },
  { name: 'brush', icon: 'brush' },
  { name: 'dropper', icon: 'colorize' },
  { name: 'eraser', icon: 'remove_circle_outline' },
  { name: 'fill-eraser', icon: 'auto_fix_off' },
  { name: 'replace-color', icon: 'format_paint' },
  { name: 'gradient-vertical', icon: 'swap_vert' },
  { name: 'gradient-horizontal', icon: 'swap_horiz' },
  { name: 'gradient-corner', icon: 'gradient' },
  // 'pentool' is a Material *Symbols* name — not a classic Material
  // Icons ligature, so it rendered as raw text instead of a glyph.
  { name: 'shapes', icon: 'category' },
];

/** Gradient tool names → the fill direction each tool locks in */
export const GRADIENT_TOOL_DIRECTIONS = {
  'gradient-vertical': 'vertical',
  'gradient-horizontal': 'horizontal',
  'gradient-corner': 'diagonal',
} as const satisfies Record<string, GradientDirection>;

/**
 * The fill direction locked by the gradient tool `name`, or null when
 * `name` is not a gradient tool. (The cast lives here and only here.)
 */
export function gradientDirectionFor(
  name: string | undefined,
): GradientDirection | null {
  return name != null && name in GRADIENT_TOOL_DIRECTIONS
    ? GRADIENT_TOOL_DIRECTIONS[name as keyof typeof GRADIENT_TOOL_DIRECTIONS]
    : null;
}

/** Is `name` one of the gradient tools? */
export function isGradientTool(name: string | undefined): boolean {
  return gradientDirectionFor(name) !== null;
}
