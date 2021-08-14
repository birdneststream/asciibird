<template>
  <div>
    <t-card class="h-full">
      <t-button
        type="button"
        class="block w-full border-gray-200 bg-gray-500 p-2 m-2"
        @click="addLayer()"
        >Add Layer</t-button
      >

      <hr />

      <div class="w-full bg-white rounded-lg shadow">
        <ul class="divide-y-2 divide-gray-100">
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
                  :disabled="!canToggleLayer && lastVisible"
                  ><font-awesome-icon
                    :icon="[
                      'fas',
                      layer.visible ? 'eye' : 'eye-slash',
                    ]" /></t-button
                ><br />

                <t-button
                  type="button"
                  class="rounded-xl"
                  @click="removeLayer(key)"
                  :disabled="!canToggleLayer"
                  ><font-awesome-icon :icon="['fas', 'trash']"
                /></t-button>
              </div>

              <div class="w-full" @click="changeLayer(key)">
                <div class="flex text-right">
                  <div class="w-full">
                    <t-card class="w-full">
                      {{ layer.label }}
                    </t-card>
                  </div>

                  <div class="w-5">
                    <t-button
                      type="button"
                      class="rounded-xl"
                      @click="upLayer(key)"
                      :disabled="!canToggleLayer"
                      ><font-awesome-icon
                        :icon="['fas', 'chevron-circle-up']" /></t-button
                    ><br />

                    <t-button
                      type="button"
                      class="rounded-xl"
                      @click="downLayer(key)"
                      :disabled="!canToggleLayer"
                      ><font-awesome-icon
                        :icon="['fas', 'chevron-circle-down']"
                    /></t-button>
                  </div>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </t-card>
  </div>
</template>

<script>
export default {
  name: "Layers",
  created() {},
  data: () => ({
    dragging: false,
  }),
  computed: {
    toolbarState() {
      return this.$store.getters.toolbarState;
    },
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
    lastVisible() {
      let visibleCount = 0;

      for (let i = 0; i < this.currentAsciiLayers.length; i++) {
        if (this.currentAsciiLayers[i].visible) {
          visibleCount++;
        }
      }

      return visibleCount === 1;
    },
  },
  methods: {
    selectedLayerClass(key) {
      // Invisble layers are red
      if (
        this.currentAsciiLayers[key].visible === false &&
        key === this.selectedLayer
      ) {
        if (this.currentAsciiLayers[key + 1]) {
          this.changeLayer(key + 1);
        } else if (this.currentAsciiLayers[key - 1]) {
          this.changeLayer(key - 1);
        }
      }

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
    addLayer() {
      this.$store.commit("addLayer");
    },
    changeLayer(key) {
      this.$store.commit("changeLayer", key);
    },
    toggleLayer(key) {
      if (!this.lastVisible || key !== this.selectedLayer) {
        this.$store.commit("toggleLayer", key);
      }
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
