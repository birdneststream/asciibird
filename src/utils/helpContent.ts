/**
 * Help modal content — structured tools, work-area and keyboard
 * shortcut reference.
 *
 * Single source of truth for the in-app Help modal (Help.vue). Tools
 * (names, labels, icons) derive directly from the toolbarIcons registry
 * (src/utils/uiConstants.ts + toolLabel in src/utils/toolbar.ts), shape
 * sub-entries from the shapes registry (SHAPE_TYPES/SHAPE_LABELS/
 * SHAPE_ICONS), tool activation chips from TOOL_SHORTCUT_KEYS (shared
 * with useGlobalShortcuts.ts) and shortcut labels from the SHORTCUTS
 * registry (src/utils/shortcuts.ts) wherever an entry exists — so the
 * help can never drift from the app. Shortcuts registered inline in
 * useGlobalShortcuts.ts / useEditorHotkeys.ts / KeyboardShortcuts.vue
 * (tool keys, editor-mode keys, Alt+1…8 tool switching, shape
 * modifiers) are asserted against a known-key list in
 * helpContent.spec.ts so new inline registrations cannot silently
 * disappear from the help.
 */

import { toolbarIcons } from './uiConstants';
import { toolLabel } from './toolbar';
import type { ToolbarIcon } from '../types';
import { SHORTCUTS } from './shortcuts';
import { SHAPE_TYPES, SHAPE_LABELS, SHAPE_ICONS } from './shapes';
import { TOOL_SHORTCUT_KEYS } from './toolShortcutKeys';

// ─── Types ───────────────────────────────────────────────────────

/** A shape type sub-entry (shapes tool only) */
export interface HelpShapeType {
  /** Shape type id — mirrors the SHAPE_TYPES registry */
  name: string;
  /** Human-readable label — derived from SHAPE_LABELS */
  label: string;
  /** Material icon name — matches the toolbar shape row */
  icon: string;
}

/** A tool entry in the Tools tab */
export interface HelpTool {
  /** Tool name — mirrors the toolbarIcons registry */
  name: string;
  /** Human-readable label — derived from toolLabel() */
  label: string;
  /** Material icon name — matches the toolbar button */
  icon: string;
  /** What the tool does, including mode notes */
  description: string;
  /** Activation shortcut chip, derived from TOOL_SHORTCUT_KEYS */
  shortcut?: string;
  /** Shape type sub-entries — shapes tool only */
  shapeTypes?: HelpShapeType[];
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

/** A panel/work-area section in the Work Area tab */
export interface HelpPanelSection {
  /** Stable section id */
  id: string;
  /** Section title */
  title: string;
  /** Material icon name */
  icon: string;
  /** One-line purpose of the area */
  purpose: string;
  /** What the area contains / does */
  items: string[];
  /** Keyboard shortcuts attributed to this area */
  shortcuts: HelpShortcut[];
}

// ─── Tools ───────────────────────────────────────────────────────

/** Per-tool help copy, keyed by toolbarIcons name */
const TOOL_DESCRIPTIONS: Record<string, string> = {
  default:
    'No tool active — the canvas cannot be edited, but panels can be '
    + 'dragged and resized freely. Escape returns here from any tool.',
  select:
    'Drag a rectangle to select blocks. Then copy (Ctrl+C), cut '
    + '(Ctrl+X) or delete (Delete) them; nudge with Shift+arrows; '
    + 'rotate (Ctrl+Shift+. / Ctrl+Shift+,); flip (Ctrl+Shift+H / '
    + 'Ctrl+Shift+X); save to the brush library (Ctrl+B) or load as a '
    + 'brush (Ctrl+Shift+B). Selections snap to halves in half-block '
    + 'mode.',
  text:
    'Click a position and type. Text wraps at the end of the line; '
    + 'Enter starts a new line, Backspace/Delete edit. Works with '
    + 'Mirror X/Y. Not available in half-block mode.',
  fill:
    'Flood fill a connected region with the current FG colour, '
    + 'respecting the FG/BG/Text filters. In half-block mode it fills '
    + 'at half resolution.',
  brush:
    'The main drawing tool — paints with the current brush (size, '
    + 'shape and library brushes). E flips the brush horizontally and '
    + 'Q vertically. Works with Mirror X/Y. In half-block mode it '
    + 'paints single halves with the FG colour only.',
  dropper:
    'Pick up the FG, BG and character of any block, respecting the '
    + 'targeting filters. In half-block mode it picks the half\u2019s '
    + 'colour into FG.',
  eraser:
    'Removes block properties with the brush footprint, respecting '
    + 'the FG/BG/Text filters — with only Char selected it strips '
    + 'characters but keeps colours. In half-block mode it erases '
    + 'single halves to transparency.',
  'fill-eraser':
    'Flood-fill removal of block properties, respecting the FG/BG/Text '
    + 'filters — handy for transparent-background art. In half-block '
    + 'mode it erases fills at half resolution.',
  'replace-color':
    'Replaces a colour picked from a block across the whole canvas or '
    + 'the active selection. Not available in half-block mode.',
  'gradient-vertical':
    'Two-click vertical gradient fill: click a start block, then an end '
    + 'block — colours interpolate from FG (at the pick point) to BG '
    + '(at the release point) down the column span. Not available in '
    + 'half-block mode.',
  'gradient-horizontal':
    'Two-click horizontal gradient fill: click a start block, then an '
    + 'end block — colours interpolate from FG (at the pick point) to '
    + 'BG (at the release point) across the row span. Reverse drags '
    + 'anchor the start colour where you clicked. Not available in '
    + 'half-block mode.',
  'gradient-corner':
    'Two-click corner gradient fill: click a start block, then an end '
    + 'block — colours radiate from FG (at the pick corner) to BG (at '
    + 'the release corner) diagonally across the rectangle. Not '
    + 'available in half-block mode.',
  shapes:
    'Two-click shapes: line, rectangle outline/filled and ellipse '
    + 'outline/filled — press Shift+S to cycle the shape type. While '
    + 'picking the end point, hold Shift or Z to constrain 1:1 and '
    + 'hold Alt or A to draw from the centre anchor (combinable; A/Z '
    + 'exist for window managers that capture Alt). In half-block mode '
    + 'shapes paint the FG colour at half resolution.',
};

/** Shape type sub-entries derived from the shapes registry — zero drift */
const HELP_SHAPE_TYPES: HelpShapeType[] = SHAPE_TYPES.map(name => ({
  name,
  label: SHAPE_LABELS[name],
  icon: SHAPE_ICONS[name],
}));

/** Tool entries derived from the toolbar registry — zero drift */
export const HELP_TOOLS: HelpTool[] = toolbarIcons.map(
  (icon: ToolbarIcon): HelpTool => ({
    name: icon.name,
    label: toolLabel(icon),
    icon: icon.icon,
    description: TOOL_DESCRIPTIONS[icon.name] ?? '',
    shortcut: TOOL_SHORTCUT_KEYS[icon.name],
    ...(icon.name === 'shapes' ? { shapeTypes: HELP_SHAPE_TYPES } : {}),
  }),
);

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
      { keys: 'Alt+1 … 8', action: 'Switch to the toolbar tool at that position' },
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

// ─── Work area (panels) ──────────────────────────────────────────

export const HELP_PANELS: HelpPanelSection[] = [
  {
    id: 'menu-bar',
    title: 'Menu bar',
    icon: 'menu',
    purpose: 'Top application menu with file, import/export and view actions.',
    items: [
      'File — New ASCII, Close ASCII.',
      'Import — Paste from Clipboard, mIRC File, ANSI File.',
      'Export — mIRC (clipboard/file), PNG, ANSI, HTML, plain text, HTTP POST.',
      'Edit — Edit ASCII properties, Undo/Redo, Save Brush/Selection to Library, '
      + 'Add Border…, Crop to Content.',
      'View — show/hide every panel, grid, zoom in/out/reset, Reset Layout.',
      'Tools — Options, Image Overlay.',
      'Help — About (Shift+F1), this Help (F1).',
    ],
    shortcuts: [
      { keys: SHORTCUTS.toggleMenuBar.label, action: 'Hide/show the menu bar' },
      { keys: 'Ctrl+= / Ctrl+- / Ctrl+0', action: 'Zoom in / out / reset' },
    ],
  },
  {
    id: 'tab-bar',
    title: 'Tab bar',
    icon: 'tab',
    purpose: 'One tab per open ASCII document — edit several at once.',
    items: [
      'Click a tab to switch documents; the canvas, layers and history switch with it.',
      'Everything is saved to IndexedDB as you work and restored on reload.',
      'Ctrl+Shift+0 … 9 jumps straight to a tab by index.',
    ],
    shortcuts: [
      { keys: 'Ctrl+M', action: 'New ASCII' },
      { keys: 'Ctrl+Shift+0 … 9', action: 'Switch to tab by index' },
      { keys: 'Ctrl+Shift+O', action: 'Import mIRC file as a new tab' },
      { keys: 'Ctrl+Shift+V', action: 'Paste clipboard as a new tab' },
      { keys: SHORTCUTS.closeAscii.label, action: 'Close the current ASCII' },
      { keys: SHORTCUTS.toggleTabs.label, action: 'Hide/show the tab bar' },
    ],
  },
  {
    id: 'toolbar',
    title: 'Toolbar panel',
    icon: 'construction',
    purpose: 'Tool selection plus shape types and canvas utility toggles.',
    items: [
      '13 tools (see the Tools tab) — click or press the tool\u2019s shortcut key.',
      'Gradient row — vertical, horizontal and corner gradient fills; '
      + 'each tool locks its direction (never auto-detected).',
      'Shape row — 5 shape type icons; clicking one activates the shapes tool '
      + 'with that shape.',
      'Mir X / Mir Y — mirror brush strokes across the canvas axes.',
      'Auto — update the brush automatically when FG/BG/char changes.',
      'Grid — toggle block grid lines over the canvas.',
      'Halfblocks — toggle half-block editing mode (FG-only, half resolution).',
      'Drag the panel by its title bar; it remembers its position.',
    ],
    shortcuts: [
      { keys: 'Alt+1 … 8', action: 'Switch to the toolbar tool at that position' },
      { keys: 'Shift+S', action: 'Cycle the shape type' },
      { keys: SHORTCUTS.mirrorX.label + ' / ' + SHORTCUTS.mirrorY.label, action: 'Toggle Mirror X / Y' },
      { keys: 'Alt+G', action: 'Toggle grid mode' },
      { keys: SHORTCUTS.toggleToolbar.label, action: 'Hide/show the toolbar' },
    ],
  },
  {
    id: 'colours',
    title: 'Colours panel',
    icon: 'palette',
    purpose: 'Pick the FG/BG colours, character and what tools target.',
    items: [
      '99-colour mIRC palette (classic + extended) — left click sets FG.',
      'FG and BG swatches open the colour pickers; the swap button exchanges them.',
      'Char opens the character picker for the paint character.',
      'FG / BG / Text checkboxes control what the brush, eraser and fill tools change.',
      'In half-block mode the panel simplifies to FG only.',
    ],
    shortcuts: [
      { keys: SHORTCUTS.toggleFgPicker.label, action: 'Open/close the FG picker (then 0–9 picks)' },
      { keys: SHORTCUTS.toggleBgPicker.label, action: 'Open/close the BG picker (then 0–9 picks)' },
      { keys: SHORTCUTS.toggleCharPicker.label, action: 'Open/close the char picker' },
      { keys: SHORTCUTS.swapColours.label, action: 'Swap FG and BG' },
    ],
  },
  {
    id: 'brush-preview',
    title: 'Brush preview panel',
    icon: 'brush',
    purpose: 'Live preview of the current brush and its transform controls.',
    items: [
      'Shows exactly what the brush tool will paint, including mirror effects.',
      'Flip/rotate the brush and change its size.',
      'In half-block mode the targeting checkbox row is hidden (FG only).',
    ],
    shortcuts: [
      { keys: 'E / Q', action: 'Flip the brush horizontally / vertically' },
      { keys: SHORTCUTS.brushSizeUp.label + ' / ' + SHORTCUTS.brushSizeDown.label, action: 'Increase / decrease brush size' },
      { keys: SHORTCUTS.toggleBrushPreview.label, action: 'Hide/show the brush preview' },
    ],
  },
  {
    id: 'brush-library',
    title: 'Brush library panel',
    icon: 'auto_awesome_motion',
    purpose: 'Nine brush slots plus the history of brushes you have used.',
    items: [
      'Click a slot to load its brush into the brush tool.',
      'Ctrl+B (or Edit menu) saves the current selection/brush to the library.',
      'Right click a brush preview to export it — PNG, txt or clipboard.',
      'Recent brushes are collected automatically in the history row.',
    ],
    shortcuts: [
      { keys: 'Ctrl+1 … 9', action: 'Load a brush library slot' },
      { keys: SHORTCUTS.saveBrushLibrary.label, action: 'Save the selection to the library' },
      { keys: SHORTCUTS.toggleBrushLibrary.label, action: 'Hide/show the brush library' },
    ],
  },
  {
    id: 'layers',
    title: 'Layers panel',
    icon: 'layers',
    purpose: 'Stack multiple layers of blocks per ASCII document.',
    items: [
      'Click a layer to select it for editing; visible layers composite top-down.',
      'Add, duplicate, merge down, and reorder layers with the panel buttons.',
      'Right click a layer for actions and a quick preview.',
    ],
    shortcuts: [
      { keys: SHORTCUTS.toggleLayerVisibility.label, action: 'Show/hide the selected layer' },
      { keys: SHORTCUTS.addLayer.label, action: 'Add a layer' },
      { keys: SHORTCUTS.moveLayerUp.label + ' / ' + SHORTCUTS.moveLayerDown.label, action: 'Move the layer up / down' },
      { keys: SHORTCUTS.mergeLayerDown.label, action: 'Merge the layer down' },
      { keys: SHORTCUTS.duplicateLayer.label, action: 'Duplicate the layer' },
      { keys: SHORTCUTS.toggleLayers.label, action: 'Hide/show the layers panel' },
    ],
  },
  {
    id: 'canvas',
    title: 'Canvas area',
    icon: 'grid_on',
    purpose: 'The ASCII document itself — draw, select and navigate the art.',
    items: [
      'Every cell is a block: foreground colour, background colour, character.',
      'Zoom with Ctrl+= / Ctrl+- / Ctrl+0; the canvas pans by dragging when '
      + 'no tool is active.',
      'Right click the canvas for the editor context menu — copy, paste mode, '
      + 'exports and more.',
      'The status bar below shows the cursor X/Y, undo/redo steps and the '
      + 'active tool.',
    ],
    shortcuts: [
      { keys: 'Ctrl+Z / Ctrl+Y', action: 'Undo / redo' },
      { keys: 'Ctrl+= / Ctrl+- / Ctrl+0', action: 'Zoom in / out / reset' },
      { keys: 'Escape', action: 'Cancel the active tool / pick' },
    ],
  },
  {
    id: 'context-menus',
    title: 'Context menus',
    icon: 'content_paste',
    purpose: 'Right click shortcuts for the object under the cursor.',
    items: [
      'Canvas — selection actions, paste mode, exports and ASCII operations.',
      'Brush previews (preview panel and library) — export the brush as '
      + 'PNG, txt or clipboard.',
      'Layers — layer actions and preview.',
      'Dashboard (outside the canvas) — quick common actions.',
    ],
    shortcuts: [],
  },
  {
    id: 'debug-panel',
    title: 'Debug panel',
    icon: 'bug_report',
    purpose: 'Development diagnostics — normally hidden.',
    items: [
      'Shows internal editor state (cursor, tool, canvas metrics) for '
      + 'troubleshooting.',
    ],
    shortcuts: [
      { keys: SHORTCUTS.toggleDebug.label, action: 'Hide/show the debug panel' },
    ],
  },
];
