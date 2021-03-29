<template>
  <div>
    <vue-draggable-resizable
      @dragging="onDrag"
      :grid="[
        $store.getters.currentAscii.blockHeight,
        $store.getters.currentAscii.blockWidth,
      ]"
      style="z-index: 5; min-height: 500px"
      :min-width="200"
      :max-width="500"
      :min-height="500"
      :max-height="700"
      :x="0"
      :y="50"
    >
      <t-card header="Tools and Stuff" style="height: 100%">
        <label class="flex ml-1">
          <t-checkbox
            name="targetingFg"
            v-model="$store.getters.getToolbarState.targetingFg"
            :disabled="
              !$store.getters.getTargetingBg && !$store.getters.getTargetingChar
            "
          />
          <span class="text-sm">FG</span>
        </label>
        <label class="flex ml-1">
          <t-checkbox
            name="targetingBg"
            v-model="$store.getters.getToolbarState.targetingBg"
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
            v-model="$store.getters.getToolbarState.targetingChar"
            :disabled="
              !$store.getters.getTargetingFg && !$store.getters.getTargetingBg
            "
          />
          <span class="text-sm">Text</span>
        </label>

        <hr />

        <Colours />

        <h5>Brushes and Shit</h5>

        <t-button
          type="button"
          v-for="(value, keyToolbar) in $store.getters.getToolbarIcons"
          :key="keyToolbar + 50"
          :class="`border-gray-200 max-h-7 max-w-5 w-7  ${($store.getters.getCurrentTool == value ? 'border-gray-900' : 'border-gray-200')}`"
          @click="$store.commit('changeTool', value.name)"
        >
          <font-awesome-icon :icon="[value.fa, value.icon]" />
        </t-button>
      </t-card>
    </vue-draggable-resizable>
  </div>
</template>

<script>
import Colours from "./Colours.vue";

export default {
  created() {},
  name: "Toolbar",
  components: { Colours },

  data: () => ({
    floating: {
      width: 0,
      height: 0,
      x: 100,
      y: 100,
    },
  }),
  computed: {},
  watch: {},
  methods: {
    onResize(x, y, width, height) {
      this.floating.x = x;
      this.floating.y = y;
      this.floating.width = width;
      this.floating.height = height;
    },
    onDrag(x, y) {
      this.floating.x = x;
      this.floating.y = y;
    },
  },
};
</script>
