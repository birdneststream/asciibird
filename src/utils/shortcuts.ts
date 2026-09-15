/**
 * Central registry of keyboard shortcuts restored from the legacy
 * ASCIIBIRD app (branch master-before-llm-times).
 *
 * Single source of truth shared between hotkey registration
 * (useGlobalShortcuts.ts) and menu label rendering (useMenuBar.ts,
 * Layers.vue) so registered combos and displayed labels can never drift.
 *
 * Tab-switching shortcuts (Ctrl+Shift+0..9) are generated in a loop by
 * useGlobalShortcuts and have no menu label, so they are not listed here.
 */

export interface ShortcutDef {
  /** hotkeys-js key combo string used for registration */
  keys: string;
  /** Human-facing label shown in menus (legacy casing) */
  label: string;
}

export const SHORTCUTS = {
  // Export
  exportClipboard: { keys: 'ctrl+shift+c', label: 'Ctrl+Shift+C' },
  exportFile: { keys: 'ctrl+shift+f', label: 'Ctrl+Shift+F' },
  exportPng: { keys: 'ctrl+shift+g', label: 'Ctrl+Shift+G' },

  // File / tabs
  closeAscii: { keys: 'ctrl+r', label: 'Ctrl+R' },

  // Panel visibility (View → Windows)
  toggleTabs: { keys: 'ctrl+alt+t', label: 'Ctrl+Alt+T' },
  toggleMenuBar: { keys: 'ctrl+alt+m', label: 'Ctrl+Alt+M' },
  toggleDebug: { keys: 'ctrl+alt+d', label: 'Ctrl+Alt+D' },
  toggleBrushLibrary: { keys: 'ctrl+alt+b', label: 'Ctrl+Alt+B' },
  toggleLayers: { keys: 'ctrl+alt+l', label: 'Ctrl+Alt+L' },
  toggleToolbar: { keys: 'ctrl+alt+n', label: 'Ctrl+Alt+N' },
  toggleBrushPreview: { keys: 'ctrl+alt+e', label: 'Ctrl+Alt+E' },

  // Brush / mirror
  mirrorX: { keys: 'alt+x', label: 'Alt+X' },
  mirrorY: { keys: 'alt+y', label: 'Alt+Y' },
  toggleUpdateBrush: { keys: 'alt+u', label: 'Alt+U' },
  brushSizeUp: { keys: 'ctrl+]', label: 'Ctrl+]' },
  brushSizeDown: { keys: 'ctrl+[', label: 'Ctrl+[' },

  // Colours
  swapColours: { keys: 'alt+r', label: 'Alt+R' },
  toggleFgPicker: { keys: 'alt+f', label: 'Alt+F' },
  toggleBgPicker: { keys: 'alt+b', label: 'Alt+B' },
  toggleCharPicker: { keys: 'alt+c', label: 'Alt+C' },

  // Brush library
  saveBrushLibrary: { keys: 'ctrl+b', label: 'Ctrl+B' },

  // Layers (Ctrl+Shift+T and Ctrl+Shift+W are browser-reserved — remapped)
  toggleLayerVisibility: { keys: 'alt+v', label: 'Alt+V' },
  addLayer: { keys: 'ctrl+shift+a', label: 'Ctrl+Shift+A' },
  moveLayerDown: { keys: 'ctrl+shift+s', label: 'Ctrl+Shift+S' },
  moveLayerUp: { keys: 'ctrl+shift+up', label: 'Ctrl+Shift+↑' },
} as const satisfies Record<string, ShortcutDef>;
