<template>
  <vue-draggable-resizable
    style="z-index: 5;"
    :x="100"
    :y="100"
    :w="1000"
  >
    <t-button
      type="button"
      v-for="(char, keyChar) in charCodes"
      :key="keyChar"
      class="border-gray-200 p-2 min-h-0"
      @click="onCharChange(char)"
    >
      {{ (char === " ") ? 'space' : char }}
    </t-button>
  </vue-draggable-resizable>
</template>

<script>
import { charCodes } from '../../ascii';

export default {
  name: 'CharPicker',
  created() {},
  props: ['canvasX', 'canvasY'],
  computed: {
    charCodes() {
      return charCodes;
    },
  },
  methods: {
    onCharChange(char) {
      this.$store.commit('changeChar', char);
    },
  },
};
</script>
