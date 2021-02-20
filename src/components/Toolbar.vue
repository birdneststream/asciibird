<template>
  <div>
    <vue-draggable-resizable 
    @dragging="onDrag" 
    style="z-index:5;min-height:500px;"
    :min-width=200
    :max-width=500
    :min-height=500
    :max-height=700
    :x=800
    >
    <div style="height:100%;min-height:500px;max-height:700px;">
      <t-card header="Tools and Stuff" style="height:100%;">
         
        <t-button
          type="button"
          v-for="(value, keyColors) in mircColors"
          :key="keyColors"
          :style="makeColorButtonClass(value)"
          class="border-gray-300 m-1"
          @click="onColorChange(value)"
        ></t-button>
        
        <h5>Brushes and Shit</h5>
        
        <t-button
          type="button"
          v-for="(value, keyToolbar) in toolbar"
          :key="keyToolbar+50"
          :style="makeToolbarButtonClass(value)"
          class="border-gray-300 m-1"
          v-html="value.icon"
          @click="onToolbarChange(value)"
        ></t-button>

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
    this.toolbarState = this.$store.state.toolbarState;
  },
  name: "Toolbar",
  
  data: () => ({
    mircColors: null,
    charCodes: null,
    toolbar: null,
    toolbarState: {
      currentColor: 0,
      currentTool : null,
    },
    floating: {
      width: 0,
      height: 0,
      x: 100,
      y: 100,
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
        this.$store.commit('changeTool', item.name);
    },
    onColorChange(item) {
        this.$store.commit('changeColor', item);
    },
    makeColorButtonClass(color) {
      return `background-color: ${color} !important;width:25px;height:25px;`;
    },
    makeToolbarButtonClass() {
      return `background-color: grey !important;width:25px;height:25px;`;
    },
  },
};
</script>
