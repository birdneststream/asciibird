/**
 * Help modal content — structured tools + keyboard shortcuts reference.
 *
 * Single source of truth for the in-app Help modal (Help.vue). Tools
 * mirror the toolbarIcons registry (src/utils/uiConstants.ts) and
 * shortcut labels derive from the SHORTCUTS registry
 * (src/utils/shortcuts.ts) wherever an entry exists, so the help
 * content cannot drift from the registered combos. Shortcuts that are
 * registered inline in useGlobalShortcuts.ts / useEditorHotkeys.ts
 * (tool keys, editor-mode keys, shape modifiers) are documented here
 * next to their registration sites — helpContent.spec.ts guards the
 * registry-covered subset both directions.
 */

import { SHORTCUTS } from './shortcuts';

// ─── Types ───────────────────────────────────────────────────────

/** A tool entry in the Tools tab */
export interface HelpTool {
  /** Tool name — must match a toolbarIcons entry (drift-guarded) */
  name: string;
  /** Human-readable label */
  label: string;
  /** Material icon name shown in the help entry */
  icon: string;
  /** What the tool does, including mode notes */
  description: string;
}

/** A single shortcut row */
export interface HelpShortcut {
  /** Key combo label (e.g. "Ctrl+Z") */
  keys: string;
  /** What it does */
  action: string;
}

/** A titled group of shortcuts */
export interface HelpShortcutGroup {
  title: string;
  shortcuts: HelpShortcut[];
}

// ─── Tools ───────────────────────────────────────────────────────

export const HELP_TOOLS: HelpTool[] = [
  {
    name: 'default',
    label: 'Default',
    icon: 'edit_off',
    description:
      'No tool active — the canvas cannot be edited, but panels can be '
      + 'dragged and resized freely. Escape returns here from any tool.',
  },
  {
    name: 'select',
    label: 'Select',
    icon: 'photo_size_select_small',
    description:
      'Drag a rectangle to select blocks. Then copy (Ctrl+C), cut '
      + '(Ctrl+X), delete, nudge (Shift+arrows), rotate/flip '
      + '(Ctrl+Shift+. , Ctrl+Shift+, H X), save to brush library '
      + '(Ctrl+B), or load as a brush (Ctrl+Shift+B).',
  },
  {
    name: 'text',
    label: 'Text',
    icon: 'text_rotation_none',
    description:
      'Click a position and type. Text wraps at the end of the line; '
      + 'Enter starts a new line, Backspace/Delete edit. Works with '
      + 'Mirror X/Y. Not available in half-block mode.',
  },
  {
    name: 'fill',
    label: 'Fill',
    icon: 'format_color_fill',
    description:
      'Flood fill a connected region with the current brush colour, '
      + 'respecting the FG/BG/Text filters. In half-block mode it fills '
      + 'at half resolution with the FG colour.',
  },
  {
    name: 'brush',
    label: 'Brush',
    icon: 'brush',
    description:
      'The main drawing tool — paints with the current brush (size, '
      + 'shape and library brushes). E flips the brush horizontally and '
      + 'Q vertically. Works with Mirror X/Y. In half-block mode it '
      + 'paints single halves with the FG colour only.',
  },
  {
    name: 'dropper',
    label: 'Picker',
    icon: 'colorize',
    description:
      'Pick up the FG, BG and character of any block, respecting the '
      + 'targeting filters. In half-block mode it picks the half\u2019s '
      + 'colour into FG.',
  },
  {
    name: 'eraser',
    label: 'Eraser',
    icon: 'remove_circle_outline',
    description:
      'Removes block properties with the brush footprint, respecting '
      + 'the FG/BG/Text filters — with only Char selected it strips '
      + 'characters but keeps colours. In half-block mode it erases '
      + 'single halves to transparency.',
  },
  {
    name: 'fill-eraser',
    label: 'Erase Fill',
    icon: 'auto_fix_off',
    description:
      'Flood-fill removal of block properties, respecting the FG/BG/Text '
      + 'filters — handy for transparent-background art.',
  },
  {
    name: 'replace-color',
    label: 'ReColour',
    icon: 'format_paint',
    description:
      'Replaces a colour picked from a block across the whole canvas or '
      + 'the active selection. Not available in half-block mode.',
  },
  {
    name: 'gradient',
    label: 'Gradient',
    icon: 'gradient',
    description:
      'Two-click gradient fill: click a start block, then an end block '
      + '— colours interpolate from FG to BG between them. Not available '
      + 'in half-block mode.',
  },
  {
    name: 'shapes',
    label: 'Shapes',
    icon: 'pentool',
    description:
      'Two-click shapes: line, rectangle outline/filled and ellipse '
      + 'outline/filled — press Shift+S to cycle the shape type. While '
      + 'picking the end point, hold Shift or Z to constrain 1:1 and '
      + 'hold Alt or A to draw from the centre anchor (combinable; A/Z '
      + 'exist for window managers that capture Alt). In half-block mode '
      + 'shapes paint the FG colour at half resolution.',
  },
];

// ─── Shortcuts ───────────────────────────────────────────────────

export const HELP_SHORTCUT_GROUPS: HelpShortcutGroup[] = [
  {
    title: 'General',
    shortcuts: [
      { keys: 'F1', action: 'Toggle this help' },
      { keys: 'Shift+F1', action: 'About ASCIIBIRD' },
      {
        keys: 'Escape',
        action: 'Cancel the active tool / pick and close colour and char panels',
      },
      { keys: 'Ctrl+Z', action: 'Undo' },
      { keys: 'Ctrl+Y / Ctrl+Shift+Z', action: 'Redo' },
      { keys: 'Ctrl+= / Ctrl+- / Ctrl+0', action: 'Zoom in / out / reset' },
    ],
  },
  {
    title: 'Tools',
    shortcuts: [
      { keys: 'B', action: 'Brush tool' },
      { keys: 'S', action: 'Select tool' },
      { keys: 'T', action: 'Text tool' },
      { keys: 'F', action: 'Fill tool' },
      { keys: 'E', action: 'Eraser tool — or flip brush horizontally when brush/eraser is active' },
      { keys: 'Q', action: 'Flip brush vertically (when brush/eraser is active)' },
      { keys: 'G', action: 'Toggle grid' },
      { keys: 'R', action: 'ReColour tool' },
      { keys: 'L', action: 'Shapes tool' },
      { keys: 'Shift+S', action: 'Cycle the shape type (when shapes tool is active)' },
    ],
  },
  {
    title: 'Shapes — constraints while picking',
    shortcuts: [
      { keys: 'Shift or Z (hold)', action: 'Constrain to equal width/height (1:1)' },
      { keys: 'Alt or A (hold)', action: 'First click is the shape centre' },
      { keys: 'Both', action: 'Centred square — constraints combine' },
    ],
  },
  {
    title: 'Brush / eraser mode',
    shortcuts: [
      { keys: 'Arrows', action: 'Move the brush cursor' },
      { keys: 'Space', action: 'Apply the brush/eraser once' },
      { keys: SHORTCUTS.brushSizeUp.label, action: 'Increase brush size by 1' },
      { keys: SHORTCUTS.brushSizeDown.label, action: 'Decrease brush size by 1' },
      { keys: 'Ctrl+1 … 9', action: 'Load a brush library slot' },
    ],
  },
  {
    title: 'Text mode',
    shortcuts: [
      { keys: 'Arrows', action: 'Move the text cursor' },
      { keys: 'Enter', action: 'New line (X resets to 0)' },
      { keys: 'Backspace', action: 'Remove the previous character' },
      { keys: 'Delete', action: 'Remove the character at the cursor' },
    ],
  },
  {
    title: 'Select mode',
    shortcuts: [
      { keys: 'Ctrl+C / Ctrl+X', action: 'Copy / cut the selection' },
      { keys: 'Ctrl+V', action: 'Paste copied blocks (ghost preview)' },
      { keys: 'Delete', action: 'Delete the selected blocks' },
      { keys: 'Shift+Arrows', action: 'Nudge the selection' },
      { keys: 'Ctrl+Shift+. / Ctrl+Shift+,', action: 'Rotate clockwise / counter-clockwise' },
      { keys: 'Ctrl+Shift+H / Ctrl+Shift+X', action: 'Flip horizontally / vertically' },
      { keys: SHORTCUTS.saveBrushLibrary.label, action: 'Save the selection to the brush library' },
      { keys: 'Ctrl+Shift+B', action: 'Load copied blocks as a brush' },
    ],
  },
  {
    title: 'Colours & brush',
    shortcuts: [
      { keys: SHORTCUTS.toggleFgPicker.label, action: 'Open/close the foreground picker (then 0–9 picks a colour)' },
      { keys: SHORTCUTS.toggleBgPicker.label, action: 'Open/close the background picker (then 0–9 picks a colour)' },
      { keys: SHORTCUTS.toggleCharPicker.label, action: 'Open/close the character picker (then press any key)' },
      { keys: SHORTCUTS.swapColours.label, action: 'Swap FG and BG' },
      { keys: SHORTCUTS.toggleUpdateBrush.label, action: 'Toggle "update brush when FG/BG/char changes"' },
      { keys: 'Alt+G', action: 'Toggle grid mode' },
      { keys: SHORTCUTS.mirrorX.label, action: 'Toggle Mirror X' },
      { keys: SHORTCUTS.mirrorY.label, action: 'Toggle Mirror Y' },
    ],
  },
  {
    title: 'Layers',
    shortcuts: [
      { keys: SHORTCUTS.toggleLayerVisibility.label, action: 'Show/hide the selected layer' },
      { keys: SHORTCUTS.addLayer.label, action: 'Add a layer' },
      { keys: SHORTCUTS.moveLayerUp.label, action: 'Move the layer up' },
      { keys: SHORTCUTS.moveLayerDown.label, action: 'Move the layer down' },
      { keys: SHORTCUTS.mergeLayerDown.label, action: 'Merge the layer down' },
      { keys: SHORTCUTS.duplicateLayer.label, action: 'Duplicate the layer' },
    ],
  },
  {
    title: 'Panels',
    shortcuts: [
      { keys: SHORTCUTS.toggleToolbar.label, action: 'Hide/show the toolbar' },
      { keys: SHORTCUTS.toggleBrushPreview.label, action: 'Hide/show the brush preview' },
      { keys: SHORTCUTS.toggleBrushLibrary.label, action: 'Hide/show the brush library' },
      { keys: SHORTCUTS.toggleLayers.label, action: 'Hide/show the layers panel' },
      { keys: SHORTCUTS.toggleDebug.label, action: 'Hide/show the debug panel' },
      { keys: SHORTCUTS.toggleTabs.label, action: 'Hide/show the tab bar' },
      { keys: SHORTCUTS.toggleMenuBar.label, action: 'Hide/show the menu bar' },
    ],
  },
  {
    title: 'Files, tabs & export',
    shortcuts: [
      { keys: 'Ctrl+M', action: 'New ASCII' },
      { keys: 'Ctrl+E', action: 'Edit ASCII properties' },
      { keys: SHORTCUTS.closeAscii.label, action: 'Close the current ASCII' },
      { keys: 'Ctrl+O', action: 'Toggle options' },
      { keys: 'Ctrl+Shift+0 … 9', action: 'Switch to tab by index' },
      { keys: 'Ctrl+Shift+O', action: 'Import mIRC text file as new ASCII' },
      { keys: 'Ctrl+Shift+V', action: 'Paste clipboard as new ASCII' },
      { keys: SHORTCUTS.exportClipboard.label, action: 'Copy mIRC art to clipboard' },
      { keys: SHORTCUTS.exportFile.label, action: 'Save mIRC art to text file' },
      { keys: SHORTCUTS.exportPng.label, action: 'Save canvas as PNG' },
    ],
  },
];
