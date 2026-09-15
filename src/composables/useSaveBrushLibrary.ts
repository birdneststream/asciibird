// Save-to-brush-library composable — legacy Ctrl+B semantics.
//
// Brush tool saves the current brush blocks; select tool saves the
// live selection and clears it afterwards. Anything else is a silent
// no-op. Extracted from Dashboard.vue so the branches are unit-testable.

import { toolbarIcons, filterNullBlocks } from '../ascii';
import { useToolbarStore } from '../store/toolbar';
import type { Block } from '../types';
import type { Ref } from 'vue';

export interface SelectionRect {
  startX: number | null;
  startY: number | null;
  endX: number | null;
  endY: number | null;
}

export interface SaveBrushLibraryDeps {
  /** Live selection blocks emitted by the Editor */
  selectedBlocks: Ref<Block[][]>;
  /** Live selection rectangle emitted by the Editor */
  selecting: Ref<SelectionRect>;
  /** Toggled to make the Editor reset its selection rectangle */
  resetSelect: Ref<boolean>;
  /** Toast callback (e.g. useToast().show) */
  toastShow: (message: string, opts?: { type: string }) => void;
}

function isSelectionComplete(rect: SelectionRect): boolean {
  return rect.startX !== null && rect.startY !== null
    && rect.endX !== null && rect.endY !== null;
}

export function useSaveBrushLibrary(deps: SaveBrushLibraryDeps) {
  const toolbarStore = useToolbarStore();

  function saveBrushLibrary(): void {
    const toolName = toolbarIcons[toolbarStore.currentTool]?.name;

    if (toolName === 'brush') {
      toolbarStore.pushBrushLibrary(
        filterNullBlocks(toolbarStore.brushBlocks),
      );
      deps.toastShow('Saved brush to Library!', { type: 'success' });
      return;
    }

    const hasSelection = deps.selectedBlocks.value.length > 0
      && isSelectionComplete(deps.selecting.value);

    if (toolName === 'select' && hasSelection) {
      toolbarStore.pushBrushLibrary(
        filterNullBlocks(deps.selectedBlocks.value),
      );
      // Reset and clear the selection, like the legacy Edit menu action
      deps.resetSelect.value = !deps.resetSelect.value;
      deps.selectedBlocks.value = [];
      toolbarStore.setSelectBlocks([]);
      deps.toastShow('Saved brush to Library!', { type: 'success' });
    }
  }

  return { saveBrushLibrary };
}
