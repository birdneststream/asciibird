<template>
  <div>
    <div class="flex">
      <button
        type="button"
        class="ab-button"
        @click="addLayer()"
      >
        <span class="material-icons relative top-2 pb-4">playlist_add</span> Add
        Layer
      </button>

      <button
        type="button"
        class="ab-button"
        @click="mergeLayers()"
      >
        <span class="material-icons relative top-2 pb-4">playlist_play</span>
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
            <span class="material-icons">{{
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
        ref="layers-menu"
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
                <span class="material-icons">{{
                  layer.visible ? "remove_red_eye" : "panorama_fish_eye"
                }}</span>
              </button><br>

              <button
                type="button"
                class="ab-rounded-button"
                @click="removeLayer(key)"
                :disabled="!canToggleLayer"
              >
                <span class="material-icons">delete</span>
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
                    <span class="material-icons">arrow_upward</span>
                  </button><br>

                  <button
                    type="button"
                    class="ab-rounded-button"
                    @click="upLayer(key)"
                    :disabled="!canToggleLayer"
                  >
                    <span class="material-icons">arrow_downward</span>
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

<script>
import ContextMenu from "./ContextMenu.vue";
import { useAsciiBirdStore } from "../../store";
import { useToast } from "../../composables/useToast";
import { useDialog } from "../../composables/useDialog";

export default {
  name: "Layers",
  setup() {
    const store = useAsciiBirdStore();
    const { show: toastShow } = useToast();
    const dialog = useDialog();
    return { store, toastShow, dialog };
  },
  components: {
    ContextMenu,
  },
  created() {},
  data: () => ({}),
  computed: {
    currentAsciiLayers() {
      return this.store.currentAsciiLayers;
    },
    selectedLayer() {
      let selectedLayer = this.store.selectedLayer;

      if (this.currentAsciiLayers[selectedLayer] === undefined) {
        while (
          this.currentAsciiLayers[selectedLayer] === undefined &&
          selectedLayer >= 0
        ) {
          selectedLayer--;
        }

        this.store.changeLayer(selectedLayer);
      }

      return selectedLayer;
    },
    currentLayer() {
      return this.currentAsciiLayers[this.selectedLayer];
    },
    canToggleLayer() {
      return this.currentAsciiLayers.length > 1;
    },
    toolbarState() {
      return this.store.toolbarState;
    },
    imageOverlay() {
      return this.store.imageOverlay || false;
    },
    imageOverlayUrl() {
      return this.imageOverlay.url
        ? this.imageOverlay.url.split("/").pop()
        : "";
    },
  },
  watch: {
    selectedLayer() {
      this.selectBestLayer();
    },
  },
  methods: {
    openContextMenu(e) {
      e.preventDefault();
      this.$refs["layers-menu"].open({
        pageX: e.layerX,
        pageY: e.layerY,
      });
    },
    selectBestLayer() {
      let found = false;
      this.currentAsciiLayers.map((item) => {
        if (item && item.visible) {
          found = true;
        }
      });

      if (!found) {
        this.store.toggleLayer(0);
        this.changeLayer(0);
      }
    },
    selectedLayerClass(key) {
      if (!this.currentAsciiLayers[key].visible) {
        return "bg-red-200";
      }

      if (key === this.selectedLayer) {
        return "bg-blue-200";
      }

      return "bg-gray-200";
    },
    showLayerRename(key, label) {
      this.store.toggleDisableKeyboard(true);
      this.dialog
        .prompt({
          title: "Rename Layer",
          text: "Please input your new layer name",
          icon: "question",
          inputValue: label,
          clickToClose: false,
        })
        .then((result) => {
          this.store.toggleDisableKeyboard(false);
          if (!result.input.length) {
            this.toastShow("You must enter a layer name!", {
              type: "error",
            });

            return;
          }

          if (result.isOk) {
            this.updateLayerName(key, result.input);
          }

          return;
        });
    },
    updateLayerName(key, label) {
      this.store.updateLayerName({
        key: key,
        label: label,
      });
      this.closeMenu();
    },
    addLayer() {
      this.store.addLayer();
      this.toastShow(`Added a new layer.`, {
        type: "success",
      });
      this.closeMenu();
    },
    mergeLayers() {
      this.store.mergeAllLayers();
      this.toastShow(`All layers have been merged.`, {
        type: "success",
      });
      this.closeMenu();
    },
    changeLayer(key) {
      this.store.changeLayer(key);
    },
    toggleLayer(key) {
      this.store.toggleLayer(key);
      this.closeMenu();
    },
    upLayer(key) {
      this.store.upLayer(key);
      this.closeMenu();
    },
    downLayer(key) {
      this.store.downLayer(key);
      this.closeMenu();
    },
    removeLayer(key) {
      this.store.removeLayer(key);
      this.toastShow(`Removed layer.`, {
        type: "success",
      });
      this.closeMenu();
    },
    showOverlayModal() {
      this.store.openModal("overlay");
    },
    updateImageOverlay() {
      let overlay = { ...this.imageOverlay };
      overlay.visible = !overlay.visible;
      this.store.updateImageOverlay(overlay);
    },
    closeMenu() {
      this.$refs["layers-menu"].close();
    },
  },
};
</script>
