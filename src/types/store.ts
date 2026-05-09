// Store types for ASCIIBIRD (Pinia)

import type {
  AsciibirdMeta,
  BrushHistoryEntry,
  BrushLibraryEntry,
  DesktopState,
  ModalState,
  Options,
  PanelState,
  BrushLibraryState,
  ToolbarState,
} from './index';

/** Full store root state */
export interface RootState {
  ver: number;
  modalState: ModalState;
  isKeyboardDisabled: boolean;
  options: Options;
  tab: number;
  desktopState: DesktopState;
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
