<template>
  <div>
    <vue-draggable-resizable
      @dragging="onDrag"
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
          <t-card
            v-if="toolbarState.isChoosingFg || toolbarState.isChoosingBg"
          >

          <t-button
            type="button"
            v-for="(value, keyColors) in mircColors"
            :key="keyColors"
            :style="makeColorButtonClass(value)"
            class="border-gray-300 m-1"
            @click="onColorChange(keyColors)"
          ></t-button>

          </t-card>

          <hr />

          <t-button
            type="button"
            :style="makeColorButtonClass(mircColors[toolbarState.currentColorFg])"
            class="border-gray-300 m-1"
            id="currentColorFg"
            @click="startColorChange(0)"
          ></t-button>

          <t-button
            type="button"
            :style="makeColorButtonClass(mircColors[toolbarState.currentColorBg])"
            class="border-gray-300 m-1"
            id="currentColorBg"
            @click="startColorChange(1)"
          ></t-button>

          <h5>Brushes and Shit</h5>

          <t-button
            type="button"
            v-for="(value, keyToolbar) in toolbar"
            :key="keyToolbar + 50"
            :style="makeToolbarButtonClass(value)"
            class="border-gray-300 m-1"
            @click="onToolbarChange(value)"
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
  created() {
    this.mircColors = this.$store.state.mircColors;
    this.charCodes = this.$store.state.charCodes;
    this.toolbar = this.$store.state.toolbar;
    this.toolbarState = this.$store.getters.getToolbarState;
  },
  name: "Toolbar",

  data: () => ({
    mircColors: null,
    charCodes: null,
    toolbar: null,
    floating: {
      width: 0,
      height: 0,
      x: 100,
      y: 100,
    },
    toolbarState: {
      currentColorFg: 0,
      currentColorBg: 1,
      isChoosingFg: false,
      isChoosingBg: false,
      isUpdating: false,
      currentTool: 'default',
    },
  }),
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
    onToolbarChange(item) {
      this.$store.commit("changeTool", item.name);
    },
    makeColorButtonClass(color) {
      return `background-color: ${ color } !important;width:25px;height:25px;`;
    },
    makeToolbarButtonClass(tool) {
      return "background-color: grey !important;width:25px;height:25px;";
    },
    startColorChange(type){
      
      // this.toolbarState.isChoosingColor = true
      if (type === 0) {
      //   // Fg
        this.toolbarState.isChoosingFg = true
      } else {
      //   // Bg
        this.toolbarState.isChoosingBg = true
      }

    },
    onColorChange(color) {
      if (this.toolbarState.isChoosingFg) {
        this.updateColor(0, color)
      }

      if (this.toolbarState.isChoosingBg) {
        this.updateColor(1, color)
      }
    },
    updateColor(type, color) {
      if (this.toolbarState.isChoosingBg || this.toolbarState.isChoosingFg) {
        switch (type) {
          // FG
          case 0:
            this.$store.commit("changeColorFg", color);
            this.currentColorFg = color
            break;

          // BG
          case 1:
            this.$store.commit("changeColorBg", color);
            this.currentColorBg = color
            break;
        }
      

        this.toolbarState.isChoosingBg = false;
        this.toolbarState.isChoosingFg = false;

        this.$store.commit("updateToolBarState", this.toolbarState);

      }
    },
  },
};
</script>
