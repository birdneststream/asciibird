// UI constants for ASCIIBIRD toolbar and interface.
//
// Contains toolbar icon definitions and other UI-facing constants
// that are not colour-related. Pure data — no store dependencies.

import type { ToolbarIcon } from '../types';

// Toolbar icons — maps tool names to Material Icons identifiers
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
  { name: 'gradient', icon: 'gradient' },
  { name: 'shapes', icon: 'pentool' },
];
