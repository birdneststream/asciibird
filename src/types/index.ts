// Core data types for ASCIIBIRD

/** A single cell in the ASCII grid */
export interface Block {
  fg?: number | null;
  bg?: number | null;
  char?: string | null;
}

/** A layer in the ASCII document */
export interface Layer {
  label: string;
  visible: boolean;
  width: number;
  height: number;
  data: Block[][];
}

/** Image overlay settings for tracing */
export interface ImageOverlay {
  url: string | null;
  opacity: number;
  asciiOpacity: number;
  left: number;
  top: number;
  position: string;
  size: number;
  repeatx: boolean;
  repeaty: boolean;
  visible: boolean;
  stretched: boolean;
}

/** Per-tab metadata for an ASCII document (stored state) */
export interface AsciibirdMeta {
  title: string;
  layers: string; // LZ-String compressed JSON of Layer[]
  selectedLayer: number;
  imageOverlay: ImageOverlay;
  history: HistoryEntry[];
  historyIndex: number;
  x: number; // canvas scroll X
  y: number; // canvas scroll Y
}

/** Pre-compression metadata used during creation/import */
export interface AsciibirdMetaBuilder extends Omit<AsciibirdMeta, 'layers'> {
  layers: Layer[] | string;
}

/** A single block diff for undo/redo */
export interface BlockDiff {
  x: number;
  y: number;
  b: Block;
}

/** A diff entry for undo/redo */
export interface HistoryDiff {
  new: BlockDiff[];
  old: BlockDiff[];
  l?: number; // layer index
}

/** A layer history entry */
export interface LayerHistoryData {
  new: Layer[];
  old: Layer[];
}

/** A history entry (either block diff or layer change) */
export type HistoryEntry =
  | string // LZ-String compressed JSON of HistoryDiff
  | {
      t: 'l'; // layer change marker
      d: string; // LZ-String compressed JSON of LayerHistoryData
    };

/** Type guard: checks if a HistoryEntry is a layer-change marker */
export function isLayerHistoryEntry(
  entry: HistoryEntry,
): entry is { t: 'l'; d: string } {
  return typeof entry !== 'string' && entry.t === 'l';
}

/** Modal state booleans */
export interface ModalState {
  newAscii: boolean;
  editAscii: boolean;
  pasteAscii: boolean;
  options: boolean;
  overlay: boolean;
  about: boolean;
  help: boolean;
}

/** App options */
export interface Options {
  defaultBg: number;
  defaultFg: number;
  renderOffScreen: boolean;
  undoLimit: number;
  brushLimit: number;
  tabLimit: number;
  fps: number;
}

/** Toolbar state */
export interface ToolbarState {
  currentColourFg: number;
  currentColourBg: number;
  isChoosingFg: boolean;
  isChoosingBg: boolean;
  isChoosingChar: boolean;
  persistCharPanel: boolean;
  brushSizeWidth: number;
  brushSizeHeight: number;
  brushSizeType: 'square' | 'circle' | 'cross';
  selectedFg: number;
  selectedBg: number;
  selectedChar: string;
  isUpdating: boolean;
  currentTool: number;
  targetingFg: boolean;
  targetingBg: boolean;
  targetingChar: boolean;
  mirrorX: boolean;
  mirrorY: boolean;
  x: number;
  y: number;
  h: number;
  w: number;
  draggable: boolean;
  updateBrush: boolean;
  gridView: boolean;
  visible: boolean;
  halfBlockEditing: boolean;
  minimized: boolean;
}

/** Desktop layout state */
export interface DesktopState {
  menuBarVisible: boolean;
  tabsVisible: boolean;
}

/** Panel position/size state */
export interface PanelState {
  x: number;
  y: number;
  h: number;
  w: number;
  visible: boolean;
  minimized: boolean;
}

/** Brush library panel state (extends PanelState with tab) */
export interface BrushLibraryState extends PanelState {
  tab: number;
}

/** Brush history entry */
export interface BrushHistoryEntry {
  blocks: string; // LZ-String compressed
  hash: number;
}

/** Brush library entry */
export type BrushLibraryEntry = BrushHistoryEntry;

/** Form data for creating new ASCII */
export interface CreateAsciiForm {
  createAscii: {
    title: string;
    width: number | string;
    height: number | string;
  };
}

/** mIRC export result */
export interface MircExportResult {
  filename: string;
  output: string[];
}

/** Toolbar icon definition */
export interface ToolbarIcon {
  name: string;
  icon: string;
}

/** Menu bar item (e.g., File, Edit, View) */
export interface AppMenuBar {
  label: string;
  items: AppMenuItem[];
}

/** Menu bar sub-item (e.g., New ASCII, Undo) */
export interface AppMenuItem {
  text: string;
  click: () => void;
  disabled?: boolean;
  shortcut?: string;
}
