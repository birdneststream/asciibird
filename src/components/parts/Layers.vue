<template>
  <div>
    <div class="flex">
      <t-button
        type="button"
        class="block w-1/2 border-gray-200 bg-gray-500"
        @click="addLayer()"
      >
        Add Layer
      </t-button>

      <t-button
        type="button"
        class="block w-1/2 border-gray-200 bg-gray-500"
        @click="mergeLayers()"
      >
        Merge Layers
      </t-button>
    </div>

    <hr />

    <div class="w-full bg-white rounded-lg shadow">
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
                class="rounded-xl"
                @click="toggleLayer(key)"
                :disabled="!canToggleLayer"
              >
                <font-awesome-icon
                  :icon="['fas', layer.visible ? 'eye' : 'eye-slash']"
                /> </t-button
              ><br />

              <t-button
                type="button"
                class="rounded-xl"
                @click="removeLayer(key)"
                :disabled="!canToggleLayer"
              >
                <font-awesome-icon :icon="['fas', 'trash']" />
              </t-button>
            </div>

            <div class="w-full" @click="changeLayer(key)">
              <div class="flex text-right">
                <div class="w-full">
                  <t-card class="w-full">
                    <span @dblclick="showLayerRename(key, layer.label)">{{
                      layer.label
                    }}</span>
                  </t-card>
                </div>

                <div class="w-5">
                  <t-button
                    type="button"
                    class="rounded-xl"
                    @click="downLayer(key)"
                    :disabled="!canToggleLayer"
                  >
                    <font-awesome-icon
                      :icon="['fas', 'chevron-circle-up']"
                    /> </t-button
                  ><br />

                  <t-button
                    type="button"
                    class="rounded-xl"
                    @click="upLayer(key)"
                    :disabled="!canToggleLayer"
                  >
                    <font-awesome-icon :icon="['fas', 'chevron-circle-down']" />
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
      return this.currentAsciiLayers.length !== 1;
      // We want to avoid hiding all the layers, so if there's only one
      // visible left, we have to disable the buttons
    },
    toolbarState() {
      return this.$tore.getters.toolbarState;
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
      window.stopKeyEvents = true;
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
            window.stopKeyEvents = false;
            return;
          }

          if (result.isOk) {
            this.updateLayerName(key, result.input);
          }

          window.stopKeyEvents = false;
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
    },
    mergeLayers() {
      this.$store.commit("mergeAllLayers");
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
    },
  },
};
</script>
