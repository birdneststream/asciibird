import { ref, reactive, computed } from 'vue';
import { useAsciiBirdStore } from '../store';
import { usePanelStore } from '../store/panels';
import { useToolbarStore } from '../store/toolbar';
import {
  toolbarIcons,
  blockWidth,
  blockHeight,
} from '../ascii';
import type { DiffBlocks } from '../utils/diffBlocks';
import type { Block, AsciibirdMeta, Layer } from '../types';

/**
 * Shared reactive state for the Editor component.
 *
 * Encapsulates all reactive refs, computeds, and store-derived state
 * that is shared between Editor.vue and its sub-composables. This
 * avoids the "parameter explosion" problem when passing 30+ refs
 * to extracted composables.
 *
 * Usage: Call once in Editor.vue `<script setup>`, pass the returned
 * object to useEditorRendering and useEditorInteraction.
 */
export function useEditorState() {
  const store = useAsciiBirdStore();
  const panelStore = usePanelStore();
  const toolbarStore = useToolbarStore();

  // ─── Reactive State ──────────────────────────────────────────
  const canvasSize = reactive({ width: 512, height: 512 });
  const x = ref(0);
  const y = ref(0);
  const isTopHalf = ref(true);
  const top = ref<number | false>(false);
  const canTool = ref(false);
  const textEditing = ref<{ startX: number | null; startY: number | null }>({
    startX: null,
    startY: null,
  });
  const selecting = ref({
    startX: null as number | null,
    startY: null as number | null,
    endX: null as number | null,
    endY: null as number | null,
    canSelect: false,
  });
  const isMouseOnCanvas = ref(false);
  const selectedBlocks = ref<Block[][]>([]);
  const diffBlocks = reactive<DiffBlocks>({
    l: 0,
    old: [],
    new: [],
  });
  const canvasHash = ref<number | null>(null);
  const lastBrushX = ref(-1);
  const lastBrushY = ref(-1);
  const lastIsTopHalf = ref(true);

  // ─── Computed ────────────────────────────────────────────────
  const blockSizeMultiplier = computed(() => store.blockSizeMultiplier);
  const blockWidthComp = computed(
    () => blockWidth * blockSizeMultiplier.value,
  );
  const blockHeightComp = computed(
    () => blockHeight * blockSizeMultiplier.value,
  );

  const currentAscii = computed(() => store.currentAscii);
  const currentAsciiLayers = computed(() => store.currentAsciiLayers);
  const selectedLayerIndex = computed(
    () => (currentAscii.value as AsciibirdMeta)?.selectedLayer || 0,
  );
  const currentSelectedLayer = computed<Layer>(
    () => currentAsciiLayers.value[selectedLayerIndex.value] as Layer ?? { label: '', visible: true, width: 0, height: 0, data: [] },
  );
  const currentAsciiLayerBlocks = computed<Block[][]>(
    () => (currentSelectedLayer.value as Layer).data ?? [],
  );

  const currentTool = computed(() => toolbarIcons[toolbarStore.currentTool]);
  const canFg = computed(() => toolbarStore.isTargettingFg);
  const canBg = computed(() => toolbarStore.isTargettingBg);
  const canText = computed(() => toolbarStore.isTargettingChar);
  const currentFg = computed(() => toolbarStore.currentFg);
  const currentBg = computed(() => toolbarStore.currentBg);
  const currentChar = computed(() => toolbarStore.currentChar);

  const isTextEditing = computed(
    () => currentTool.value.name === 'text',
  );
  const isEraserFill = computed(
    () => currentTool.value.name === 'fill-eraser',
  );
  const isFill = computed(() => currentTool.value.name === 'fill');
  const isTextEditingValues = computed(
    () => textEditing.value.startX !== null
      && textEditing.value.startY !== null,
  );
  const isSelecting = computed(
    () => currentTool.value.name === 'select',
  );
  const isDefault = computed(
    () => currentTool.value.name === 'default',
  );
  const isBrushing = computed(
    () => currentTool.value.name === 'brush',
  );
  const isErasing = computed(
    () => currentTool.value.name === 'eraser',
  );
  const isSelected = computed(
    () =>
      selecting.value.startX !== null
      && selecting.value.startY !== null
      && selecting.value.endX !== null
      && selecting.value.endY !== null,
  );

  const brushBlocks = computed(() => toolbarStore.brushBlocks);
  const canvasX = computed(() => x.value * blockWidthComp.value);
  const canvasY = computed(() => y.value * blockHeightComp.value);
  const toolbarState = computed(() => toolbarStore.toolbarState);
  const mirrorX = computed(() => toolbarState.value.mirrorX);
  const mirrorY = computed(() => toolbarState.value.mirrorY);
  const debugPanelState = computed(() => panelStore.debugPanel);
  const selectBlocks = computed(() => toolbarStore.selectBlocks);
  const options = computed(() => store.options);
  const haveSelectBlocks = computed(() => !!selectBlocks.value.length);
  const brushLibraryState = computed(() => panelStore.brushLibrary);
  const gridView = computed(() => toolbarState.value.gridView);
  const halfBlockEditing = computed(
    () => toolbarState.value.halfBlockEditing,
  );

  const asciiBlockAtXy = computed(() => {
    return currentAsciiLayerBlocks.value[y.value]
      && currentAsciiLayerBlocks.value[y.value][x.value]
      ? currentAsciiLayerBlocks.value[y.value][x.value]
      : false;
  });

  const currentAsciiWidth = computed(
    () => currentSelectedLayer.value.width,
  );
  const currentAsciiHeight = computed(() =>
    currentSelectedLayer.value.height > 2184
      ? 2184
      : currentSelectedLayer.value.height,
  );

  return {
    // Stores (for composables that need direct store access)
    store,
    toolbarStore,

    // Reactive state
    canvasSize,
    x,
    y,
    isTopHalf,
    top,
    canTool,
    textEditing,
    selecting,
    isMouseOnCanvas,
    selectedBlocks,
    diffBlocks,
    canvasHash,
    lastBrushX,
    lastBrushY,
    lastIsTopHalf,

    // Computed
    blockSizeMultiplier,
    blockWidthComp,
    blockHeightComp,
    currentAscii,
    currentAsciiLayers,
    selectedLayerIndex,
    currentSelectedLayer,
    currentAsciiLayerBlocks,
    currentTool,
    canFg,
    canBg,
    canText,
    currentFg,
    currentBg,
    currentChar,
    isTextEditing,
    isEraserFill,
    isFill,
    isTextEditingValues,
    isSelecting,
    isDefault,
    isBrushing,
    isErasing,
    isSelected,
    brushBlocks,
    canvasX,
    canvasY,
    toolbarState,
    mirrorX,
    mirrorY,
    debugPanelState,
    selectBlocks,
    options,
    haveSelectBlocks,
    brushLibraryState,
    gridView,
    halfBlockEditing,
    asciiBlockAtXy,
    currentAsciiWidth,
    currentAsciiHeight,
  };
}

/** Type of the object returned by useEditorState() */
export type EditorState = ReturnType<typeof useEditorState>;
