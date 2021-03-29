<template>
      <div :id=blockId :style=blockClass>
          {{ this.data.char }}
      </div>
</template>

<script>
export default {
  name: 'Block',
  props: ['data',
    'blockWidth',
    'blockHeight'],

  created() {
    console.log(this.data);
  },
  data: () => ({

  }),
  computed: {
    blockId() {
      return `block-${this.data.x}-${this.data.y}`;
    },
    blockClass() {
      return `max-width: ${this.blockWidth}px; min-width: ${this.blockWidth}px; max-height: ${this.blockHeight}px; min-height: ${this.blockHeight}px; Colour: '${this.data.fg}'; background-Colour: '${this.data.bg}';`;
    },
  },
};
</script>
