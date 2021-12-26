<template>
  <div>
    <div class="flex">
      <t-button
        type="button"
        class="block w-1/2 border-gray-200 bg-gray-500 text-sm"
        @click="addLayer()"
      >
        <span class="material-icons relative top-2 pb-4">playlist_add</span> Add
        Layer
      </t-button>

      <t-button
        type="button"
        class="block w-1/2 border-gray-200 bg-gray-500 text-sm"
        @click="mergeLayers()"
      >
        <span class="material-icons relative top-2 pb-4">playlist_play</span>
        Merge Layers
      </t-button>
    </div>

    <hr />

    <div class="w-full bg-white rounded-lg shadow">
      <ul class="divide-y-2 divide-gray-100 mb-2">
        <div class="flex p-1">
          <t-button
            type="button"
            class="ab-rounded-button"
            @click="updateImageOverlay"
          >
            <span class="material-icons">{{
              !imageOverlay.visible ? "remove_red_eye" : "panorama_fish_eye"
            }}</span>
          </t-button>
          <div class="w-full p-1" @click="showOverlayModal">
            <div class="flex text-right">
              <div class="w-full">
                <t-card class="w-full pl-2 hover:bg-gray-300 cursor-pointer">
                  <span>{{ imageOverlayUrl || "Image Overlay" }}</span>
                </t-card>
              </div>
            </div>
          </div>
        </div>
      </ul>

      <ul class="mt-1 mb-2">
        <li></li>
      </ul>

      <context-menu ref="layers-menu" class="z-50" @contextmenu.prevent>
        <ul>
          <li @click="addLayer()" class="ab-context-menu-item">
            Add New Layer
          </li>
          <li @click="removeLayer(selectedLayer)" class="ab-context-menu-item">
            Remove Selected Layer
          </li>
          <li @click="downLayer(selectedLayer)" class="ab-context-menu-item">
            Move Selected Layer Up
          </li>
          <li @click="upLayer(selectedLayer)" class="ab-context-menu-item">
            Move Selected Layer Down
          </li>
          <li @click="toggleLayer(selectedLayer)" class="ab-context-menu-item">
            Show/Hide Layer
          </li>
          <li
            @click="showLayerRename(selectedLayer, currentLayer.label)"
            class="ab-context-menu-item"
          >
            Rename Layer
          </li>
          <li @click="mergeLayers()" class="ab-context-menu-item">
            Merge All Layers
          </li>
        </ul>
      </context-menu>

      <ul
        class="divide-y-2 divide-gray-100 reverseorder"
        @mouseup.right="openContextMenu"
        @contextmenu.prevent
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
            @contextmenu.prevent
          >
            <div class="w-12" @click="changeLayer(key)">
              <t-button
                type="button"
                class="ab-rounded-button"
                @click="toggleLayer(key)"
                :disabled="!canToggleLayer"
              >
                <span class="material-icons">{{
                  layer.visible ? "remove_red_eye" : "panorama_fish_eye"
                }}</span> </t-button
              ><br />

              <t-button
                type="button"
                class="ab-rounded-button"
                @click="removeLayer(key)"
                :disabled="!canToggleLayer"
              >
                <span class="material-icons">delete</span>
              </t-button>
            </div>

            <div class="w-full">
              <div class="flex text-right">
                <div class="w-full" @click="changeLayer(key)">
                  <t-card class="w-full hover:bg-gray-300 cursor-pointer">
                    <span @dblclick="showLayerRename(key, layer.label)">{{
                      layer.label
                    }}</span>
                  </t-card>
                </div>

                <div class="w-5">
                  <t-button
                    type="button"
                    class="ab-rounded-button"
                    @click="downLayer(key)"
                    :disabled="!canToggleLayer"
                  >
                    <span class="material-icons">arrow_upward</span> </t-button
                  ><br />

                  <t-button
                    type="button"
                    class="ab-rounded-button"
                    @click="upLayer(key)"
                    :disabled="!canToggleLayer"
                  >
                    <span class="material-icons">arrow_downward</span>
                  </t-button>
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

export default {
  name: "Layers",
  components: {
    ContextMenu,
  },
  created() {},
  data: () => ({}),
  computed: {
    currentAsciiLayers() {
      return this.$store.getters.currentAsciiLayers;
    },
    selectedLayer() {
      return this.$store.getters.selectedLayer;
    },
    currentLayer() {
      return this.currentAsciiLayers[this.selectedLayer];
    },
    canToggleLayer() {
      return this.currentAsciiLayers.length > 1;
      // We want to avoid hiding all the layers, so if there's only one
      // visible left, we have to disable the buttons
    },
    toolbarState() {
      return this.$tore.getters.toolbarState;
    },
    imageOverlay() {
      return this.$store.getters.imageOverlay || false;
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
      // These are the correct X and Y when inside the floating panel
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

      // If there's no visible layers we'll target the first one always
      if (!found) {
        this.$store.commit("toggleLayer", 0);
        this.changeLayer(0);
      }
    },
    selectedLayerClass(key) {
      // Invisble layers are red
      if (!this.currentAsciiLayers[key].visible) {
        return "bg-red-200";
      }

      // Selected layers blue
      if (key === this.selectedLayer) {
        return "bg-blue-200";
      }

      // Otherwise gray
      return "bg-gray-200";
    },
    showLayerRename(key, label) {
      this.$store.commit("toggleDisableKeyboard", true);
      this.$dialog
        .prompt({
          title: "Rename Layer",
          text: "Please input your new layer name",
          icon: "question",
          inputValue: label,
          clickToClose: false,
        })
        .then((result) => {
          if (!result.input.length) {
            this.$toasted.show("You must enter a layer name!", {
              type: "error",
            });
            this.$store.commit("toggleDisableKeyboard", false);
            return;
          }

          if (result.isOk) {
            this.updateLayerName(key, result.input);
          }

          this.$store.commit("toggleDisableKeyboard", false);
        });

      this.closeMenu();
    },
    updateLayerName(key, label) {
      this.$store.commit("updateLayerName", {
        key: key,
        label: label,
      });
      this.closeMenu();
    },
    addLayer() {
      this.$store.commit("addLayer");
      this.$toasted.show(`Added a new layer.`, {
        type: "success",
      });
      this.closeMenu();
    },
    mergeLayers() {
      this.$store.commit("mergeAllLayers");
      this.$toasted.show(`All layers have been merged.`, {
        type: "success",
      });
      this.closeMenu();
    },
    changeLayer(key) {
      this.$store.commit("changeLayer", key);
    },
    toggleLayer(key) {
      this.$store.commit("toggleLayer", key);
      this.closeMenu();
    },
    upLayer(key) {
      this.$store.commit("upLayer", key);
      this.closeMenu();
    },
    downLayer(key) {
      this.$store.commit("downLayer", key);
      this.closeMenu();
    },
    removeLayer(key) {
      this.$store.commit("removeLayer", key);
      this.$toasted.show(`Removed layer.`, {
        type: "success",
      });
      this.closeMenu();
    },
    showOverlayModal() {
      this.$store.commit("openModal", "overlay");
    },
    // Image overlay
    updateImageOverlay() {
      let overlay = { ...this.imageOverlay };
      overlay.visible = !overlay.visible;
      this.$store.commit("updateImageOverlay", overlay);
    },
    closeMenu() {
      this.$refs["layers-menu"].close();
    },
  },
};
</script>
