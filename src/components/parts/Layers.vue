<template>
  <div>
    <div class="flex gap-1 mb-2">
      <button
        type="button"
        class="flex-1 py-1 font-label-mono text-label-mono rounded transition-all duration-200 flex items-center justify-center gap-1 text-on-surface-variant hover:bg-surface-variant"
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
        class="flex-1 py-1 font-label-mono text-label-mono rounded transition-all duration-200 flex items-center justify-center gap-1 text-on-surface-variant hover:bg-surface-variant"
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
        class="w-full py-1 font-label-mono text-label-mono rounded transition-all duration-200 flex items-center justify-center gap-1"
        :class="imageOverlay.visible
          ? 'bg-primary-container text-on-primary-container'
          : 'text-on-surface-variant hover:bg-surface-variant'"
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
      class="z-50"
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
          @click="showLayerRename(selectedLayer, currentLayer.label)"
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
      class="divide-y-2 divide-outline-variant reverseorder mt-2"
      @mouseup.right="openContextMenu"
    >
        <li
          :class="`p-1 ${selectedLayerClass(key)}`"
          v-for="(layer, key) in currentAsciiLayers"
          :key="key"
          @click.right="changeLayer(key)"
        >
          <div
            class="flex"
            @mouseup.right="openContextMenu"
          >
            <div
              class="w-12"
              @click="changeLayer(key)"
            >
              <button
                type="button"
                class="ab-rounded-button"
                @click="toggleLayer(key)"
                :disabled="!canToggleLayer"
              >
                <span
                  class="material-icons"
                  aria-hidden="true"
                >{{
                  layer.visible ? "remove_red_eye" : "panorama_fish_eye"
                }}</span>
              </button><br>

              <button
                type="button"
                class="ab-rounded-button"
                @click="removeLayer(key)"
                :disabled="!canToggleLayer"
              >
                <span
                  class="material-icons"
                  aria-hidden="true"
                >delete</span>
              </button>
            </div>

            <div class="w-full">
              <div class="flex text-right">
                <div
                  class="w-full"
                  @click="changeLayer(key)"
                >
                  <div class="ab-card w-full hover:bg-surface-container-highest cursor-pointer">
                    <span @dblclick="showLayerRename(key, layer.label)">{{
                      layer.label
                    }}</span>
                  </div>
                </div>

                <div class="w-5">
                  <button
                    type="button"
                    class="ab-rounded-button"
                    @click="downLayer(key)"
                    :disabled="!canToggleLayer"
                  >
                    <span
                      class="material-icons"
                      aria-hidden="true"
                    >arrow_upward</span>
                  </button><br>

                  <button
                    type="button"
                    class="ab-rounded-button"
                    @click="upLayer(key)"
                    :disabled="!canToggleLayer"
                  >
                    <span
                      class="material-icons"
                      aria-hidden="true"
                    >arrow_downward</span>
                  </button>
                </div>
              </div>
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
import { useDialog } from '../../composables/useDialog';
import ContextMenu from './ContextMenu.vue';

const store = useAsciiBirdStore();
const modalStore = useModalStore();
const { show: toastShow } = useToast();
const dialog = useDialog();

const layersMenu = ref<InstanceType<typeof ContextMenu> | null>(null);

const currentAsciiLayers = computed(() => store.currentAsciiLayers);

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

function selectedLayerClass(key: number) {
  if (!currentAsciiLayers.value[key]?.visible) {
    return 'bg-error-container/30';
  }

  if (key === selectedLayer.value) {
    return 'bg-primary-container/30';
  }

  return '';
}

function showLayerRename(key: number, label: string) {
  modalStore.toggleDisableKeyboard(true);
  dialog
    .prompt({
      title: 'Rename Layer',
      text: 'Please input your new layer name',
      inputValue: label,
    })
    .then((result) => {
      modalStore.toggleDisableKeyboard(false);
      if (!result.input.length) {
        toastShow('You must enter a layer name!', {
          type: 'error',
        });
        return;
      }

      if (result.isOk) {
        updateLayerName(key, result.input);
      }
    });
}

function updateLayerName(key: number, label: string) {
  store.updateLayerName({ key, label });
  closeMenu();
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
