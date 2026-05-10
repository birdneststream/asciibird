// Store types for ASCIIBIRD (Pinia)

import type {
  AsciibirdMeta,
  BrushHistoryEntry,
  BrushLibraryEntry,
  Options,
  PanelState,
  BrushLibraryState,
  ToolbarState,
} from './index';

/** Main editor store state (remaining after modal/desktop/panel extraction) */
export interface RootState {
  ver: number;
  options: Options;
  tab: number;
  asciibirdMeta: AsciibirdMeta[];
  toolbarState: ToolbarState;
  debugPanelState: PanelState;
  blockSizeMultiplier: number;
  _brushBlocks: string; // LZ-String compressed Block[][]
  brushHistory: BrushHistoryEntry[];
  _selectBlocks: string; // LZ-String compressed Block[][]
  brushLibrary: BrushLibraryEntry[];
  brushLibraryState: BrushLibraryState;
  brushPreviewState: PanelState;
  layersLibraryState: PanelState;
}
