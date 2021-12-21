<template>
  <div>
    <div class="flex">
      <t-button
        type="button"
        class="block w-1/2 border-gray-200 bg-gray-500 text-sm"
        @click="addLayer()"
      >
        <span class="material-icons relative top-2 pb-4">playlist_add</span> Add Layer
      </t-button>

      <t-button
        type="button"
        class="block w-1/2 border-gray-200 bg-gray-500 text-sm"
        @click="mergeLayers()"
      >
        <span class="material-icons relative top-2 pb-4">playlist_play</span> Merge Layers
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

      <ul class="divide-y-2 divide-gray-100 reverseorder">
        <li
          :class="`p-1 ${selectedLayerClass(key)}`"
          v-for="(layer, key) in currentAsciiLayers"
          :key="key"
        >
          <div class="flex">
            <div class="w-12">
              <t-button
                type="button"
                class="ab-rounded-button"
                @click="toggleLayer(key)"
                :disabled="!canToggleLayer"
              >
              <span class="material-icons">{{ layer.visible ? "remove_red_eye" : "panorama_fish_eye" }}</span>
              
                </t-button
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

            <div class="w-full" @click="changeLayer(key)">
              <div class="flex text-right">
                <div class="w-full">
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

                    <span class="material-icons">arrow_upward</span>
                    </t-button
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
export default {
  name: "Layers",
  created() {},
  data: () => ({}),
  computed: {
    currentAsciiLayers() {
      return this.$store.getters.currentAsciiLayers;
    },
    selectedLayer() {
      return this.$store.getters.selectedLayer;
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
    },
    updateLayerName(key, label) {
      this.$store.commit("updateLayerName", {
        key: key,
        label: label,
      });
    },
    addLayer() {
      this.$store.commit("addLayer");
      this.$toasted.show(`Added a new layer.`, {
        type: "success",
      });
    },
    mergeLayers() {
      this.$store.commit("mergeAllLayers");
      this.$toasted.show(`All layers have been merged.`, {
        type: "success",
      });
    },
    changeLayer(key) {
      this.$store.commit("changeLayer", key);
    },
    toggleLayer(key) {
      this.$store.commit("toggleLayer", key);
    },
    upLayer(key) {
      this.$store.commit("upLayer", key);
    },
    downLayer(key) {
      this.$store.commit("downLayer", key);
    },
    removeLayer(key) {
      this.$store.commit("removeLayer", key);
      this.$toasted.show(`Removed layer.`, {
        type: "success",
      });
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
  },
};
</script>
