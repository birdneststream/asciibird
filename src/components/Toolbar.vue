<template>
  <div>
    <vue-draggable-resizable
      @dragstop="onDragStop"
      :grid="[currentAscii.blockWidth, currentAscii.blockHeight]"
      style="z-index: 5;"
      :min-width="8 * 15"
      :max-width="8 * 25"
      :max-height="13 * 26"
      :min-height="13 * 25"
      :w="toolbarState.w"
      :h="toolbarState.h"
      :x="toolbarState.x"
      :y="toolbarState.y"
    >
      <t-card style="height: 100%">
        <label class="flex ml-1">
          <t-checkbox
            name="targetingFg"
            v-model="toolbarState.targetingFg"
            :disabled="
              !$store.getters.getTargetingBg && !$store.getters.getTargetingChar
            "
          />
          <span class="text-sm">FG</span>
        </label>
        <label class="flex ml-1">
          <t-checkbox
            name="targetingBg"
            v-model="toolbarState.targetingBg"
            :disabled="
              !$store.getters.getTargetingFg && !$store.getters.getTargetingChar
            "
            checked
          />
          <span class="text-sm">BG</span>
        </label>
        <label class="flex ml-1">
          <t-checkbox
            name="targetingChar"
            v-model="toolbarState.targetingChar"
            :disabled="
              !$store.getters.getTargetingFg && !$store.getters.getTargetingBg
            "
          />
          <span class="text-sm">Text</span>
        </label>

        <hr />

        <Colours />

        <t-button
          type="button"
          v-for="(value, keyToolbar) in $store.getters.getToolbarIcons"
          :key="keyToolbar + 50"
          :class="`max-h-7 max-w-5 w-7  ${($store.getters.getCurrentTool == keyToolbar ? 'border-gray-900' : 'border-gray-200')}`"
          @click="$store.commit('changeTool', keyToolbar)"
        >
          <font-awesome-icon :icon="[value.fa, value.icon]" />
        </t-button>

        <hr />

        <BrushPreview />

      </t-card>
    </vue-draggable-resizable>
  </div>
</template>

<script>
import Colours from "./Colours.vue";
import BrushPreview from "./parts/BrushPreview.vue";

export default {
  created() {
    this.toolbar.x = this.toolbarState.x
    this.toolbar.y = this.toolbarState.y
    this.toolbar.w = this.toolbarState.w
    this.toolbar.h = this.toolbarState.h
  },
  name: "Toolbar",
  components: { Colours, BrushPreview },

  data: () => ({
    toolbar: {
      w: 0,
      h: 0,
      x: 100,
      y: 100,
    },
  }),
  computed: {
    toolbarState() {
      return this.$store.getters.getToolbarState
    },
    currentAscii() {
      return this.$store.getters.currentAscii;
    },
  },
  watch: {},
  methods: {
    onResize(x, y, w, h) {
      this.toolbar.x = x;
      this.toolbar.y = y;
      this.toolbar.w = w;
      this.toolbar.h = h;

      this.$store.commit("changeToolBarState", {x: x, y: y, w: this.toolbar.w, h: this.toolbar.h})
    },
    onDragStop(x, y) {
      this.toolbar.x = x;
      this.toolbar.y = y;

      this.$store.commit("changeToolBarState", {x: x, y: y, w: this.toolbar.w, h: this.toolbar.h})
    },
  },
};
</script>
