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
      <div style="height: 100%; min-height: 500px; max-height: 700px">
        <t-card header="Tools and Stuff" style="height: 100%">
          <label class="flex ml-1">
            <t-checkbox
              name="targetingFg"
              v-model="$store.getters.getToolbarState.targetingFg"
              :disabled="!$store.getters.getTargetingBg && !$store.getters.getTargetingText"
            />
            <span class="text-sm">FG</span>
          </label>
          <label class="flex ml-1">
            <t-checkbox
              name="targetingBg"
              v-model="$store.getters.getToolbarState.targetingBg"
              :disabled="!$store.getters.getTargetingFg && !$store.getters.getTargetingText"
              checked
            />
            <span class="text-sm">BG</span>
          </label>
          <label class="flex ml-1">
            <t-checkbox
              name="targetingText"
              v-model="$store.getters.getToolbarState.targetingText"
              :disabled="!$store.getters.getTargetingFg && !$store.getters.getTargetingBg"
            />
            <span class="text-sm">Text</span>
          </label>

          <t-card
            v-if="
              $store.getters.getToolbarState.isChoosingFg ||
              $store.getters.getToolbarState.isChoosingBg
            "
          >
            <t-button
              type="button"
              v-for="(value, keyColors) in $store.getters.mircColors"
              :key="keyColors"
              :style="makeColorButtonClass(value)"
              class="border-gray-200 p-2"
              @click="onColorChange(keyColors)"
            ></t-button>
          </t-card>

          <hr />

          <t-button
            type="button"
            :style="
              makeColorButtonClass(
                $store.getters.mircColors[
                  $store.getters.getToolbarState.currentColorFg
                ]
              )
            "
            class="border-gray-200 p-1"
            id="currentColorFg"
            @click="startColorChange(0)"
            >FG</t-button
          >

          <t-button
            type="button"
            :style="
              makeColorButtonClass(
                $store.getters.mircColors[
                  $store.getters.getToolbarState.currentColorBg
                ]
              )
            "
            class="border-gray-200 p-1"
            id="currentColorBg"
            @click="startColorChange(1)"
            >BG</t-button
          >

          <t-button
            type="button"
            class="p-1 bg-white"
            id="swapColor"
            @click="swapColors()"
          >
            <font-awesome-icon :icon="['fas', 'sync']" />
          </t-button>

          <h5>Brushes and Shit</h5>

          <t-button
            type="button"
            v-for="(value, keyToolbar) in $store.getters.getToolbarIcons"
            :key="keyToolbar + 50"
            class="border-gray-200 max-h-7 max-w-5 w-7"
            @click="$store.commit('changeTool', value.name)"
          >
            <font-awesome-icon :icon="[value.fa, value.icon]" />
          </t-button>
        </t-card>
      </div>
    </vue-draggable-resizable>
  </div>
</template>



<script>
export default {
  created() {},
  name: "Toolbar",

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
    makeColorButtonClass(color) {
      return `background-color: ${color} !important;`;
    },
    makeToolbarButtonClass(tool) {
      return "background-color: grey !important;";
    },
    swapColors() {
      let bg = this.$store.getters.getToolbarState.currentColorBg;
      let fg = this.$store.getters.getToolbarState.currentColorFg;

      this.$store.commit("changeColorFg", bg);
      this.$store.commit("changeColorBg", fg);
    },
    startColorChange(type) {
      if (type === 0) {
        //   // Fg
        this.$store.getters.getToolbarState.isChoosingFg = true;
      } else {
        //   // Bg
        this.$store.getters.getToolbarState.isChoosingBg = true;
      }
    },
    onColorChange(color) {
      if (this.$store.getters.getToolbarState.isChoosingFg) {
        this.updateColor(0, color);
      }

      if (this.$store.getters.getToolbarState.isChoosingBg) {
        this.updateColor(1, color);
      }
    },
    updateColor(type, color) {
      if (
        this.$store.getters.getToolbarState.isChoosingBg ||
        this.$store.getters.getToolbarState.isChoosingFg
      ) {
        switch (type) {
          // FG
          case 0:
            this.$store.commit("changeColorFg", color);
            this.currentColorFg = color;
            break;

          // BG
          case 1:
            this.$store.commit("changeColorBg", color);
            this.currentColorBg = color;
            break;
        }

        this.$store.getters.getToolbarState.isChoosingBg = false;
        this.$store.getters.getToolbarState.isChoosingFg = false;

        this.$store.commit(
          "updateToolBarState",
          $store.getters.getToolbarState
        );
      }
    },
  },
};
</script>
