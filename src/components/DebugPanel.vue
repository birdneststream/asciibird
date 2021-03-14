<template>
  <div>
    <vue-draggable-resizable 
    @dragging="onDrag" 
    style="z-index:5;min-height:300px;"
    :min-width=200
    :max-width=500
    :min-height=100
    :max-height=200
    :x=0
    :y=350
    >
    <div style="height:100%;min-height:300px;max-height:400px;">
      <t-card header="Debug Info" style="height:100%;">
          <p v-html="watchColorChange"></p>
          <p v-html="debugStringTool"></p>
      </t-card>
    </div>
    </vue-draggable-resizable>
    
  </div>
</template>
<script>
export default {
  created() {

  },
  name: "DebugPanel",
  data: () => ({
    floating: {
      width: 0,
      height: 0,
      x: 100,
      y: 100,
    },
    debugString: '',
    debugStringTool: '',
  }),
  computed: {
    watchColorChange() {
      return this.$store.getters.getColor
    },
    watchToolChange() {
      return this.$store.getters.getTool
    },
    makeColorButtonClass(color) {
      return `background-color: ${color} !important;width:25px;height:25px;`;
    },
  },
  watch: {
    watchColorChange(val,old) {
       this.debugString = val
    },
    watchToolChange(val,old) {
       this.debugStringTool = val
    }
  },
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
