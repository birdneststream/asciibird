<template>
  <footer class="fixed bottom-0 left-0 right-0 z-40 h-7 bg-surface-container border-t border-outline-variant px-md flex items-center justify-between select-none">
    <div class="flex items-center gap-sm">
      <!-- Panel task bar — shows all panels including hidden (dimmed) -->
      <div
        class="flex items-center gap-px"
        role="toolbar"
        aria-label="Panel task bar"
      >
        <button
          v-for="panel in panels"
          :key="panel.id"
          type="button"
          class="w-6 h-6 rounded-sm flex items-center justify-center transition-colors duration-150"
          :class="taskBarBtnClass(panel)"
          :aria-label="taskBarLabel(panel)"
          :aria-pressed="panel.isShowing ? 'true' : 'false'"
          :title="panel.name"
          @click="onTaskBarClick(panel)"
          @contextmenu.stop.prevent="onTaskBarRightClick($event, panel)"
        >
          <span
            class="material-icons"
            style="font-size: 14px"
            aria-hidden="true"
          >{{ panel.icon }}</span>
        </button>
      </div>

      <span class="text-outline-variant">|</span>

      <span class="font-label-mono text-body-sm text-on-surface-variant">
        X: {{ coordsX }} | Y: {{ coordsY }}
      </span>
      <template v-if="canvasDimensions">
        <span class="text-outline-variant">|</span>
        <span
          class="font-label-mono text-body-sm text-on-surface-variant"
          title="Canvas dimensions (width × height)"
        >
          {{ canvasDimensions }}
        </span>
      </template>
      <template v-if="charDisplay">
        <span class="text-outline-variant">|</span>
        <span
          class="font-label-mono text-body-sm text-on-surface-variant"
          title="Character under cursor"
        >
          {{ charDisplay }}
        </span>
      </template>
      <span class="text-outline-variant">|</span>
      <span
        class="font-label-mono text-body-sm flex items-center gap-0.5"
        :class="undoCount > 0 ? 'text-on-surface-variant' : 'text-on-surface-variant/50'"
        :title="`${undoCount} undo steps, ${redoCount} redo steps available`"
      >
        <span
          class="material-icons"
          style="font-size: 14px"
          aria-hidden="true"
        >undo</span>
        {{ undoCount }}
      </span>
      <template v-if="redoCount > 0">
        <span class="text-outline-variant">|</span>
        <span
          class="font-label-mono text-body-sm text-on-surface-variant flex items-center gap-0.5"
        >
          <span
            class="material-icons"
            style="font-size: 14px"
            aria-hidden="true"
          >redo</span>
          {{ redoCount }}
        </span>
      </template>
      <span
        v-if="toolName"
        class="font-label-mono text-body-sm text-on-surface-variant"
      >
        Tool: {{ toolName }}
      </span>
      <span
        v-if="zoomPercent !== 100"
        class="font-label-mono text-body-sm text-on-surface-variant"
      >
        Zoom: {{ zoomPercent }}%
      </span>
      <template v-if="ircLevel !== 'none'">
        <span class="text-outline-variant">|</span>
        <span
          class="font-label-mono text-body-sm flex items-center gap-0.5"
          :class="ircLevel === 'error' ? 'text-error' : 'text-secondary'"
          :title="ircTooltip"
        >
          <span
            class="material-icons"
            style="font-size: 14px"
            aria-hidden="true"
          >warning</span>
          {{ ircLevel === 'error' ? 'Lines exceed IRC limits' : 'Lines may exceed IRC limits' }}
        </span>
      </template>
    </div>
    <div class="flex items-center gap-sm">
      <span
        v-if="projectTitle"
        class="font-label-mono text-body-sm text-on-surface-variant truncate max-w-[200px]"
      >
        Project: {{ projectTitle }}
      </span>
      <span
        v-if="projectTitle && layerInfo"
        class="text-outline-variant"
      >|</span>
      <span
        v-if="layerInfo"
        class="font-label-mono text-body-sm text-on-surface-variant"
      >
        Layer: {{ layerInfo }}
      </span>
    </div>
  </footer>

  <!-- Context menu for task bar right-click -->
  <context-menu
    ref="taskBarMenu"
    class="z-picker"
  >
    <ul>
      <li
        class="ab-context-menu-item"
        @click="onResetPosition"
      >
        Reset Position
      </li>
      <li
        v-if="contextPanel?.visible"
        class="ab-context-menu-item"
        @click="onHidePanel"
      >
        Hide Panel
      </li>
      <li
        v-if="contextPanel && !contextPanel.visible"
        class="ab-context-menu-item"
        @click="onShowPanel"
      >
        Show Panel
      </li>
    </ul>
  </context-menu>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { toolbarIcons } from '../../ascii';
import { useAsciiBirdStore } from '../../store';
import { useToolbarStore } from '../../store/toolbar';
import {
  usePanelRegistry,
  type PanelInfo,
} from '../../composables/usePanelRegistry';
import ContextMenu from './ContextMenu.vue';

const store = useAsciiBirdStore();
const toolbarStore = useToolbarStore();
const { panels, toggle, resetPosition, hide } = usePanelRegistry();

const taskBarMenu = ref<InstanceType<typeof ContextMenu> | null>(null);
const contextPanel = ref<PanelInfo | null>(null);

const props = defineProps<{
  canvasX: number | null;
  canvasY: number | null;
  layerLabel: string | null;
  layerIndex: number;
  layerCount: number;
  ircWarningLevel?: 'none' | 'warn' | 'error';
  ircMaxBytes?: number;
  ircOverLimitLines?: number[];
  canvasWidth?: number;
  canvasHeight?: number;
  charUnderCursor?: string | null;
}>();

const coordsX = computed(() => props.canvasX ?? '-');
const coordsY = computed(() => props.canvasY ?? '-');

const currentMeta = computed(() =>
  store.asciibirdMeta[store.tab] ?? null,
);

const undoCount = computed(() => {
  const meta = currentMeta.value;
  if (!meta) return 0;
  return meta.historyIndex;
});

const redoCount = computed(() => {
  const meta = currentMeta.value;
  if (!meta?.history) return 0;
  return meta.history.length - meta.historyIndex;
});

const toolName = computed(() => {
  const tool = toolbarIcons[toolbarStore.currentTool];
  return tool ? tool.name.charAt(0).toUpperCase() + tool.name.slice(1) : null;
});

const projectTitle = computed(() => {
  const meta = store.asciibirdMeta;
  if (!meta.length) return null;
  return store.currentAscii?.title ?? null;
});

const layerInfo = computed(() => {
  if (!props.layerLabel || props.layerCount === 0) return null;
  return `${props.layerIndex + 1}/${props.layerCount} ${props.layerLabel}`;
});

const zoomPercent = computed(() => {
  return Math.round(store.blockSizeMultiplier * 100);
});

const ircLevel = computed(() => props.ircWarningLevel ?? 'none');

const ircTooltip = computed(() => {
  const max = props.ircMaxBytes ?? 0;
  const lines = props.ircOverLimitLines ?? [];
  if (lines.length > 0) {
    return `Max ${max} bytes — lines ${lines.join(', ')} exceed IRC limits`;
  }
  return `Max ${max} bytes — approaching IRC line limits`;
});

const canvasDimensions = computed(() => {
  if (props.canvasWidth && props.canvasHeight) {
    return `${props.canvasWidth}×${props.canvasHeight}`;
  }
  return null;
});

const charDisplay = computed(() => {
  const ch = props.charUnderCursor;
  if (ch === null || ch === undefined) return null;
  if (ch === '') return '·';
  return `'${ch}'`;
});

/** Style class for task bar button based on panel state */
function taskBarBtnClass(panel: PanelInfo): string {
  if (panel.minimized) {
    return 'bg-surface-container-low text-on-surface-variant/60 hover:text-on-surface hover:bg-surface-variant';
  }
  if (panel.isShowing) {
    return 'bg-surface-container-high text-on-surface hover:bg-surface-variant';
  }
  // Hidden panel — dimmed appearance, click to show
  return 'text-on-surface-variant/30 hover:text-on-surface-variant hover:bg-surface-container-low';
}

/** Accessible label for task bar button */
function taskBarLabel(panel: PanelInfo): string {
  if (panel.minimized) return `Restore ${panel.name}`;
  if (panel.isShowing) return `Minimize ${panel.name}`;
  return `Show ${panel.name}`;
}

/** Click: toggle minimize/restore, or show hidden panel */
function onTaskBarClick(panel: PanelInfo) {
  toggle(panel.id);
}

/** Right-click: open context menu */
function onTaskBarRightClick(event: MouseEvent, panel: PanelInfo) {
  contextPanel.value = panel;
  taskBarMenu.value?.open({
    clientX: event.clientX,
    clientY: event.clientY,
  });
}

function onResetPosition() {
  if (contextPanel.value) {
    resetPosition(contextPanel.value.id);
  }
  taskBarMenu.value?.close();
  contextPanel.value = null;
}

function onHidePanel() {
  if (contextPanel.value) {
    hide(contextPanel.value.id);
  }
  taskBarMenu.value?.close();
  contextPanel.value = null;
}

function onShowPanel() {
  if (contextPanel.value) {
    toggle(contextPanel.value.id);
  }
  taskBarMenu.value?.close();
  contextPanel.value = null;
}
</script>
