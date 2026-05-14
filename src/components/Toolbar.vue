<template>
  <div>
    <div
      ref="panelEl"
      :style="panelStyle"
      class="fixed floating-panel rounded-lg overflow-hidden flex flex-col w-[220px] z-40"
    >
      <PanelHeader
        title="Toolbar"
        show-status
        @mousedown="$event.stopPropagation()"
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
              type="button"
              class="w-full h-10 rounded flex items-center justify-center gap-1 transition-all duration-150"
              :class="currentTool.name === value.name
                ? 'bg-primary-container text-on-primary-container shadow-md ring-2 ring-primary'
                : 'bg-surface-variant/30 text-on-surface-variant hover:bg-surface-variant'"
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

        <!-- Utility buttons -->
        <div class="grid grid-cols-2 gap-1 pt-2 border-t border-outline-variant/30">
          <Tooltip content="Mirror X axis when Editing">
            <button
              type="button"
              class="w-full h-10 rounded flex items-center justify-center gap-1 transition-colors duration-150"
              :class="toolbarStore.toolbarState.mirrorX
                ? 'bg-primary-container text-on-primary-container ring-2 ring-primary'
                : 'bg-surface-variant/30 text-on-surface-variant hover:bg-surface-variant'"
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
              class="w-full h-10 rounded flex items-center justify-center gap-1 transition-colors duration-150"
              :class="toolbarStore.toolbarState.mirrorY
                ? 'bg-primary-container text-on-primary-container ring-2 ring-primary'
                : 'bg-surface-variant/30 text-on-surface-variant hover:bg-surface-variant'"
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
              class="w-full h-10 rounded flex items-center justify-center gap-1 transition-colors duration-150"
              :class="toolbarStore.toolbarState.updateBrush
                ? 'bg-primary-container text-on-primary-container ring-2 ring-primary'
                : 'bg-surface-variant/30 text-on-surface-variant hover:bg-surface-variant'"
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
              class="w-full h-10 rounded flex items-center justify-center gap-1 transition-colors duration-150"
              :class="toolbarStore.toolbarState.gridView
                ? 'bg-primary-container text-on-primary-container ring-2 ring-primary'
                : 'bg-surface-variant/30 text-on-surface-variant hover:bg-surface-variant'"
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
              class="w-full h-10 rounded flex items-center justify-center gap-1 transition-colors duration-150"
              :class="toolbarStore.toolbarState.halfBlockEditing
                ? 'bg-primary-container text-on-primary-container ring-2 ring-primary'
                : 'bg-surface-variant/30 text-on-surface-variant hover:bg-surface-variant'"
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
import { useToast } from '../composables/useToast';
import PanelHeader from './parts/PanelHeader.vue';
import Tooltip from './parts/Tooltip.vue';
import { toolbarIcons } from '../ascii';
import { tooltipName, toolLabel } from '../utils/toolbar';

defineOptions({ name: 'Toolbar' });

const toolbarStore = useToolbarStore();
const { show: toastShow } = useToast();

const panelEl = ref<HTMLElement | null>(null);
const { style: panelStyle, x: dragX, y: dragY } = usePanelDraggable(panelEl, {
  initialValue: { x: toolbarStore.toolbarState.x, y: toolbarStore.toolbarState.y },
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
  toastShow('WARNING THIS FEATURE IS STILL EXPERIMENTAL');
}
</script>
