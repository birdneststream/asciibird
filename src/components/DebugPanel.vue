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
          <p v-html="debugStringTool"></p>
          <p v-html="debugStringFg"></p>
          <p v-html="debugStringBg"></p>
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
    debugStringFg: '',
    debugStringBg: '',
  }),
  computed: {
    watchToolChange() {
      return this.$store.getters.getCurrentTool
    },
    watchBgColor() {
      return this.$store.getters.getBgColor
    },
    watchFgColor() {
      return this.$store.getters.getFgColor
    },
  },
  watch: {
    watchToolChange(val) {
      this.debugStringTool = val
    },
    watchBgColor(val) {
      this.debugStringBg = val
    },
    watchFgColor(val) {
      this.debugStringFg = val
    },
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
