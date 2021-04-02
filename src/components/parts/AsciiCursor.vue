<template>
    <div :style="cssPosition">
        <font-awesome-icon v-if="currentTool" :icon="icon"  />
    </div>    
</template>

<script>
export default {
  name: "AsciiCursor",
  props: ["mousex","mousey"],
  async created() {},
  computed: {
      currentTool() {
          return this.$store.getters.getToolbarIcons[this.$store.getters.getCurrentTool] ?? null
      },
      icon() {
          return [this.currentTool.fa ?? 'fas', this.currentTool.icon ?? 'mouse-pointer']
      },
      cssPosition() {
          return `position:absolute;left:${this.mousex}px;top:${this.mousey}px;z-index:1;pointer-events: none;`
      }
  },
  methods: {
      
  },
};
</script>
