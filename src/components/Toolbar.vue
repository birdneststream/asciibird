<template>
  <div>
    <div
      ref="panelEl"
      class="fixed floating-panel rounded-lg overflow-hidden flex flex-col w-[220px]"
      :style="[panelStyle, { zIndex: panelStore.panelZIndex('toolbar') }]"
    >
      <PanelHeader
        ref="handleRef"
        title="Toolbar"
        icon="handyman"
        show-status
        minimizable
        @minimize="toolbarStore.minimizeToolbar()"
      />

      <div class="p-sm flex flex-col gap-xs overflow-y-auto custom-scrollbar">
        <!-- Main tool buttons -->
        <div class="grid grid-cols-2 gap-1">
          <Tooltip
            v-for="(value, keyToolbar) in toolbarIcons"
            :key="keyToolbar + 50"
            :content="tooltipName(value)"
          >
            <button
              v-if="value.name !== 'shapes'"
              type="button"
              class="w-full h-8 rounded-sm flex items-center justify-center gap-1 transition-all duration-150"
              :class="currentTool.name === value.name
                ? 'bg-primary-container/20 text-primary border border-primary/50'
                : 'bg-surface-variant/30 text-on-surface-variant hover:bg-surface-variant border border-transparent'"
              @click="toolbarStore.changeTool(keyToolbar)"
            >
              <span
                class="material-icons text-sm"
                aria-hidden="true"
              >{{ value.icon }}</span>
              <span class="text-[10px] font-label-mono">{{ toolLabel(value) }}</span>
            </button>
          </Tooltip>
        </div>

        <!-- Shape types — always visible, clicking activates shapes tool -->
        <div class="grid grid-cols-5 gap-px pt-2 border-t border-outline-variant/30">
          <Tooltip
            v-for="st in shapeTypes"
            :key="st"
            :content="shapeLabels[st]"
          >
            <button
              type="button"
              class="w-full h-7 rounded-sm flex items-center justify-center transition-colors duration-150"
              :class="isShapesTool && currentShapeType === st
                ? 'bg-primary-container/20 text-primary border border-primary/50'
                : 'bg-surface-variant/30 text-on-surface-variant hover:bg-surface-variant border border-transparent'"
              @click="activateShapeType(st)"
            >
              <span
                class="material-icons"
                style="font-size: 14px"
                aria-hidden="true"
              >{{ shapeIcons[st] }}</span>
            </button>
          </Tooltip>
        </div>

        <!-- Utility buttons -->
        <div class="grid grid-cols-2 gap-1 pt-2 border-t border-outline-variant/30">
          <Tooltip content="Mirror X axis when Editing">
            <button
              type="button"
              class="w-full h-8 rounded-sm flex items-center justify-center gap-1 transition-colors duration-150"
              :class="toolbarStore.toolbarState.mirrorX
                ? 'bg-primary-container/20 text-primary border border-primary/50'
                : 'bg-surface-variant/30 text-on-surface-variant hover:bg-surface-variant border border-transparent'"
              @click="toggleMirrorX()"
            >
              <span
                class="material-icons text-sm"
                aria-hidden="true"
              >more_vert</span>
              <span class="text-[10px] font-label-mono">Mir X</span>
            </button>
          </Tooltip>

          <Tooltip content="Mirror Y axis when Editing">
            <button
              type="button"
              class="w-full h-8 rounded-sm flex items-center justify-center gap-1 transition-colors duration-150"
              :class="toolbarStore.toolbarState.mirrorY
                ? 'bg-primary-container/20 text-primary border border-primary/50'
                : 'bg-surface-variant/30 text-on-surface-variant hover:bg-surface-variant border border-transparent'"
              @click="toggleMirrorY()"
            >
              <span
                class="material-icons text-sm"
                aria-hidden="true"
              >more_horiz</span>
              <span class="text-[10px] font-label-mono">Mir Y</span>
            </button>
          </Tooltip>

          <Tooltip content="Update Brush Automatically when Colours or Char Changes">
            <button
              type="button"
              class="w-full h-8 rounded-sm flex items-center justify-center gap-1 transition-colors duration-150"
              :class="toolbarStore.toolbarState.updateBrush
                ? 'bg-primary-container/20 text-primary border border-primary/50'
                : 'bg-surface-variant/30 text-on-surface-variant hover:bg-surface-variant border border-transparent'"
              @click="toggleUpdateBrush()"
            >
              <span
                class="material-icons text-sm"
                aria-hidden="true"
              >color_lens</span>
              <span class="text-[10px] font-label-mono">Auto</span>
            </button>
          </Tooltip>

          <Tooltip content="Toggle Grid View">
            <button
              type="button"
              class="w-full h-8 rounded-sm flex items-center justify-center gap-1 transition-colors duration-150"
              :class="toolbarStore.toolbarState.gridView
                ? 'bg-primary-container/20 text-primary border border-primary/50'
                : 'bg-surface-variant/30 text-on-surface-variant hover:bg-surface-variant border border-transparent'"
              @click="toggleGridView()"
            >
              <span
                class="material-icons text-sm"
                aria-hidden="true"
              >
                {{ !toolbarStore.toolbarState.gridView ? "grid_on" : "grid_off" }}
              </span>
              <span class="text-[10px] font-label-mono">Grid</span>
            </button>
          </Tooltip>

          <Tooltip content="Toggle Half Block Editing Mode">
            <button
              type="button"
              class="w-full h-8 rounded-sm flex items-center justify-center gap-1 transition-colors duration-150"
              :class="toolbarStore.toolbarState.halfBlockEditing
                ? 'bg-primary-container/20 text-primary border border-primary/50'
                : 'bg-surface-variant/30 text-on-surface-variant hover:bg-surface-variant border border-transparent'"
              @click="toggleHalfBlockEditing()"
            >
              <span
                class="material-icons text-sm"
                aria-hidden="true"
              >grid_view</span>
              <span class="text-[10px] font-label-mono">Halfblocks</span>
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { usePanelDraggable } from '../composables/usePanelDraggable';
import { useToolbarStore } from '../store/toolbar';
import { usePanelStore } from '../store/panels';
import { useToast } from '../composables/useToast';
import PanelHeader from './parts/PanelHeader.vue';
import Tooltip from './parts/Tooltip.vue';
import { toolbarIcons } from '../ascii';
import { tooltipName, toolLabel } from '../utils/toolbar';
import {
  SHAPE_TYPES,
  SHAPE_LABELS,
  SHAPE_ICONS,
} from '../utils/shapes';

defineOptions({ name: 'Toolbar' });

const toolbarStore = useToolbarStore();
const panelStore = usePanelStore();
const { show: toastShow } = useToast();

const panelEl = ref<HTMLElement | null>(null);
const handleRef = ref<InstanceType<typeof PanelHeader> | null>(null);
const { style: panelStyle, x: dragX, y: dragY } = usePanelDraggable(panelEl, {
  initialValue: { x: toolbarStore.toolbarState.x, y: toolbarStore.toolbarState.y },
  handle: computed(() => handleRef.value?.headerEl ?? null),
  onBringToFront: () => panelStore.bringToFront('toolbar'),
});

// Sync drag position back to store
watch([dragX, dragY], ([newX, newY]) => {
  toolbarStore.changeToolBarState({
    x: newX,
    y: newY,
    w: toolbarStore.toolbarState.w,
    h: toolbarStore.toolbarState.h,
    visible: true,
  });
});

const currentTool = computed(() => toolbarIcons[toolbarStore.currentTool]);

const isShapesTool = computed(() => currentTool.value?.name === 'shapes');
const currentShapeType = computed(
  () => toolbarStore.toolbarState.shapeType,
);
const shapeTypes = SHAPE_TYPES;
const shapeLabels = SHAPE_LABELS;
const shapeIcons = SHAPE_ICONS;

function toggleMirrorX() {
  const newVal = !toolbarStore.toolbarState.mirrorX;
  toolbarStore.updateMirror({ x: newVal, y: toolbarStore.toolbarState.mirrorY });
  toastShow(`Mirror X ${newVal ? 'enabled' : 'disabled'}`);
}

function toggleMirrorY() {
  const newVal = !toolbarStore.toolbarState.mirrorY;
  toolbarStore.updateMirror({ x: toolbarStore.toolbarState.mirrorX, y: newVal });
  toastShow(`Mirror Y ${newVal ? 'enabled' : 'disabled'}`);
}

function toggleUpdateBrush() {
  const newVal = !toolbarStore.toolbarState.updateBrush;
  toolbarStore.toggleUpdateBrush(newVal);
  toastShow(
    `Update Brush when colours or char changes ${newVal ? 'enabled' : 'disabled'}`
  );
}

function toggleGridView() {
  const newVal = !toolbarStore.toolbarState.gridView;
  toolbarStore.toggleGridView(newVal);
  toastShow(`Grid view ${newVal ? 'enabled' : 'disabled'}`);
}

function toggleHalfBlockEditing() {
  const newVal = !toolbarStore.toolbarState.halfBlockEditing;
  toolbarStore.toggleHalfBlockEditing(newVal);
  toastShow(`Half Block Editing Mode ${newVal ? 'enabled' : 'disabled'}`);
}

/** Activate shapes tool (if not active) and set the shape type */
function activateShapeType(st: typeof SHAPE_TYPES[number]) {
  if (!isShapesTool.value) {
    const shapesIdx = toolbarIcons.findIndex(t => t.name === 'shapes');
    if (shapesIdx >= 0) toolbarStore.changeTool(shapesIdx);
  }
  toolbarStore.changeShapeType(st);
}
</script>
