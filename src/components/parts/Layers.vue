<template>
  <div>
    <div class="flex gap-1 mb-2">
      <button
        type="button"
        class="flex-1 py-1.5 font-label-mono text-label-mono rounded-sm transition-all duration-200 flex items-center justify-center gap-1 text-on-surface-variant hover:bg-surface-variant border border-transparent"
        @click="addLayer()"
      >
        <span
          class="material-icons text-sm"
          aria-hidden="true"
        >playlist_add</span>
        Add Layer
      </button>

      <button
        type="button"
        class="flex-1 py-1.5 font-label-mono text-label-mono rounded-sm transition-all duration-200 flex items-center justify-center gap-1 text-on-surface-variant hover:bg-surface-variant border border-transparent"
        @click="mergeLayers()"
      >
        <span
          class="material-icons text-sm"
          aria-hidden="true"
        >playlist_play</span>
        Merge
      </button>
    </div>

    <hr class="border-outline-variant mb-2">

    <div class="w-full">
      <button
        type="button"
        class="w-full py-1.5 font-label-mono text-label-mono rounded-sm transition-all duration-200 flex items-center justify-center gap-1 border"
        :class="imageOverlay.visible
          ? 'bg-primary-container/20 text-primary border-primary/50'
          : 'text-on-surface-variant hover:bg-surface-variant border-transparent'"
        @click="imageOverlay.visible ? updateImageOverlay() : showOverlayModal()"
      >
        <span
          class="material-icons text-sm"
          aria-hidden="true"
        >{{
          !imageOverlay.visible ? "remove_red_eye" : "panorama_fish_eye"
        }}</span>
        {{ imageOverlayUrl || "Image Overlay" }}
      </button>
    </div>

    <context-menu
      ref="layersMenu"
      class="z-picker"
    >
      <ul>
        <li
          @click="addLayer()"
          class="ab-context-menu-item"
        >
          Add New Layer
        </li>
        <li
          v-if="canToggleLayer"
          @click="removeLayer(selectedLayer)"
          class="ab-context-menu-item"
        >
          Remove Selected Layer
        </li>
        <li
          v-if="canToggleLayer"
          @click="downLayer(selectedLayer)"
          class="ab-context-menu-item"
        >
          Move Selected Layer Up
        </li>
        <li
          v-if="canToggleLayer"
          @click="upLayer(selectedLayer)"
          class="ab-context-menu-item"
        >
          Move Selected Layer Down
        </li>
        <li
          v-if="canToggleLayer"
          @click="toggleLayer(selectedLayer)"
          class="ab-context-menu-item"
        >
          Show/Hide Layer
        </li>
        <li
          @click="startEdit(selectedLayer, currentLayer.label)"
          class="ab-context-menu-item"
        >
          Rename Layer
        </li>
        <li
          v-if="canToggleLayer"
          @click="mergeLayers()"
          class="ab-context-menu-item"
        >
          Merge All Layers
        </li>
      </ul>
    </context-menu>

    <ul
      class="reverseorder mt-2"
    >
      <li
        v-for="(layer, key) in currentAsciiLayers"
        :key="key"
        class="group"
        @click.right="changeLayer(key)"
        @mouseup.right.stop="openContextMenu"
      >
        <div
          class="flex items-center gap-1 p-1 rounded transition-colors duration-150 cursor-pointer"
          :class="layerItemClass(key)"
          @click="changeLayer(key)"
        >
          <!-- Visibility toggle -->
          <button
            type="button"
            class="w-7 h-7 rounded flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
            @click.stop="toggleLayer(key)"
            :disabled="!canToggleLayer"
            :title="layer.visible ? 'Hide layer' : 'Show layer'"
          >
            <span
              class="material-icons text-sm"
              aria-hidden="true"
            >{{
              layer.visible ? "visibility" : "visibility_off"
            }}</span>
          </button>

          <!-- Layer label — inline rename on double-click -->
          <input
            v-if="isEditing(key)"
            data-inline-rename-input
            v-model="editingName"
            class="flex-1 font-label-mono text-label-mono bg-surface-container-lowest border border-primary rounded px-1 py-0 outline-none min-w-0"
            @keydown.enter.stop="commitEdit"
            @keydown.escape.stop="cancelEdit"
            @blur="commitEdit"
            @click.stop
          >
          <span
            v-else
            class="flex-1 font-label-mono text-label-mono truncate"
            :class="key === selectedLayer
              ? 'text-on-surface font-bold'
              : 'text-on-surface-variant'"
            @dblclick.stop="startEdit(key, layer.label)"
          >{{ layer.label }}</span>

          <!-- Reorder & delete buttons (visible on hover/selected) -->
          <div
            class="flex items-center gap-px"
            :class="key === selectedLayer ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'"
          >
            <button
              type="button"
              class="w-6 h-6 rounded flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors"
              @click.stop="downLayer(key)"
              :disabled="!canToggleLayer"
              title="Move up"
            >
              <span
                class="material-icons"
                style="font-size: 14px"
                aria-hidden="true"
              >expand_less</span>
            </button>
            <button
              type="button"
              class="w-6 h-6 rounded flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors"
              @click.stop="upLayer(key)"
              :disabled="!canToggleLayer"
              title="Move down"
            >
              <span
                class="material-icons"
                style="font-size: 14px"
                aria-hidden="true"
              >expand_more</span>
            </button>
            <button
              type="button"
              class="w-6 h-6 rounded flex items-center justify-center text-on-surface-variant hover:text-error transition-colors"
              @click.stop="removeLayer(key)"
              :disabled="!canToggleLayer"
              title="Delete layer"
            >
              <span
                class="material-icons"
                style="font-size: 14px"
                aria-hidden="true"
              >delete</span>
            </button>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useAsciiBirdStore } from '../../store';
import { useModalStore } from '../../store/modal';
import { useToast } from '../../composables/useToast';
import { useInlineRename } from '../../composables/useInlineRename';
import ContextMenu from './ContextMenu.vue';

const store = useAsciiBirdStore();
const modalStore = useModalStore();
const { show: toastShow } = useToast();

const {
  editingKey: _editingKey,
  editingName,
  startEdit,
  commitEdit,
  cancelEdit,
  isEditing,
  forceCancel,
} = useInlineRename<number>(
  (key, newName) => {
    store.updateLayerName({ key, label: newName });
    closeMenu();
  },
);

const layersMenu = ref<InstanceType<typeof ContextMenu> | null>(null);

const currentAsciiLayers = computed(() => store.currentAsciiLayers);

// Cancel inline rename if layer count changes (layer deleted while editing)
watch(
  () => currentAsciiLayers.value.length,
  () => {
    forceCancel();
  },
);

const selectedLayer = computed(() => {
  let idx = store.selectedLayer;

  if (currentAsciiLayers.value[idx] === undefined) {
    while (
      currentAsciiLayers.value[idx] === undefined &&
      idx >= 0
    ) {
      idx--;
    }
    store.changeLayer(idx);
  }

  return idx;
});

const currentLayer = computed(
  () => currentAsciiLayers.value[selectedLayer.value],
);

const canToggleLayer = computed(
  () => currentAsciiLayers.value.length > 1,
);

const imageOverlay = computed(
  () => store.imageOverlay || { visible: false },
);

const imageOverlayUrl = computed(() => {
  const overlay = imageOverlay.value;
  return overlay.url ? overlay.url.split('/').pop() : '';
});

watch(selectedLayer, () => {
  selectBestLayer();
});

function openContextMenu(e: MouseEvent) {
  e.preventDefault();
  layersMenu.value?.open({
    clientX: e.clientX,
    clientY: e.clientY,
  });
}

function selectBestLayer() {
  let found = false;
  currentAsciiLayers.value.forEach((item) => {
    if (item && item.visible) {
      found = true;
    }
  });

  if (!found) {
    store.toggleLayer(0);
    changeLayer(0);
  }
}

function layerItemClass(key: number) {
  const isSelected = key === selectedLayer.value;
  const isVisible = currentAsciiLayers.value[key]?.visible;

  if (isSelected && isVisible) {
    return 'bg-primary-container/30 border-l-2 border-primary';
  }
  if (isSelected && !isVisible) {
    return 'bg-error-container/30 border-l-2 border-error opacity-70';
  }
  if (!isVisible) {
    return 'opacity-50 hover:opacity-70';
  }
  return 'hover:bg-surface-variant/30';
}

function addLayer() {
  store.addLayer();
  toastShow('Added a new layer.', { type: 'success' });
  closeMenu();
}

function mergeLayers() {
  store.mergeAllLayers();
  toastShow('All layers have been merged.', { type: 'success' });
  closeMenu();
}

function changeLayer(key: number) {
  store.changeLayer(key);
}

function toggleLayer(key: number) {
  store.toggleLayer(key);
  closeMenu();
}

function upLayer(key: number) {
  store.upLayer(key);
  closeMenu();
}

function downLayer(key: number) {
  store.downLayer(key);
  closeMenu();
}

function removeLayer(key: number) {
  store.removeLayer(key);
  toastShow('Removed layer.', { type: 'success' });
  closeMenu();
}

function showOverlayModal() {
  modalStore.openModal('overlay');
}

function updateImageOverlay() {
  const overlay = { ...imageOverlay.value };
  overlay.visible = !overlay.visible;
  store.updateImageOverlay(overlay);
}

function closeMenu() {
  layersMenu.value?.close();
}
</script>
