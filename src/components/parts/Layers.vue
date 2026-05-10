<template>
  <div>
    <div class="flex">
      <button
        type="button"
        class="ab-button"
        @click="addLayer()"
      >
        <span
          class="material-icons relative top-2 pb-4"
          aria-hidden="true"
        >playlist_add</span> Add
        Layer
      </button>

      <button
        type="button"
        class="ab-button"
        @click="mergeLayers()"
      >
        <span
          class="material-icons relative top-2 pb-4"
          aria-hidden="true"
        >playlist_play</span>
        Merge Layers
      </button>
    </div>

    <hr>

    <div class="w-full bg-white rounded-lg shadow">
      <ul class="divide-y-2 divide-gray-100 mb-2">
        <div class="flex p-1">
          <button
            type="button"
            class="ab-rounded-button"
            @click="updateImageOverlay"
          >
            <span
              class="material-icons"
              aria-hidden="true"
            >{{
              !imageOverlay.visible ? "remove_red_eye" : "panorama_fish_eye"
            }}</span>
          </button>
          <div
            class="w-full p-1"
            @click="showOverlayModal"
          >
            <div class="flex text-right">
              <div class="w-full">
                <div class="ab-card w-full pl-2 hover:bg-gray-300 cursor-pointer">
                  <span>{{ imageOverlayUrl || "Image Overlay" }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ul>

      <ul class="mt-1 mb-2">
        <li />
      </ul>

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
        class="divide-y-2 divide-gray-100 reverseorder"
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
                  <div class="ab-card w-full hover:bg-gray-300 cursor-pointer">
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useAsciiBirdStore } from '../../store';
import { useToast } from '../../composables/useToast';
import { useDialog } from '../../composables/useDialog';
import ContextMenu from './ContextMenu.vue';

const store = useAsciiBirdStore();
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
    pageX: (e as MouseEvent & { layerX: number }).layerX,
    pageY: (e as MouseEvent & { layerY: number }).layerY,
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
    return 'bg-red-200';
  }

  if (key === selectedLayer.value) {
    return 'bg-blue-200';
  }

  return 'bg-gray-200';
}

function showLayerRename(key: number, label: string) {
  store.toggleDisableKeyboard(true);
  dialog
    .prompt({
      title: 'Rename Layer',
      text: 'Please input your new layer name',
      inputValue: label,
    })
    .then((result) => {
      store.toggleDisableKeyboard(false);
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
  store.openModal('overlay');
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
