// Vuex store types

import type {
  AsciibirdMeta,
  Block,
  BrushHistoryEntry,
  BrushLibraryEntry,
  DesktopState,
  ModalState,
  Options,
  PanelState,
  BrushLibraryState,
  ToolbarState,
} from './index';

/** Full Vuex root state */
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
  brushBlocks: string; // LZ-String compressed Block[][]
  brushHistory: BrushHistoryEntry[];
  selectBlocks: string; // LZ-String compressed Block[][]
  brushLibrary: BrushLibraryEntry[];
  brushLibraryState: BrushLibraryState;
  brushPreviewState: PanelState;
  layersLibraryState: PanelState;
}

/** Vuex store type (for import typing) */
import type { Store } from 'vuex';

export type AsciiBirdStore = Store<RootState>;
