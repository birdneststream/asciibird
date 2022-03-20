<template>
  <vue-draggable-resizable
    :x="170"
    :y="100+yOffset"
    :w="650"
    :h="350"
  >
    <t-card class="w-full h-full">
      <t-button
        type="button"
        v-for="(char, keyChar) in charCodes"
        :key="keyChar"
        :style="`background-color: ${mircColours[currentBg]} !important;color: ${mircColours[currentFg]} !important;${outline};font-size: 13px;width: ${blockWidth}px;height: ${blockHeight}px;`"
        class="m-0.5"
        @click="onCharChange(char)"
      >
        {{ char === " " ? "SP" : char }}
      </t-button>
    </t-card>
  </vue-draggable-resizable>
</template>

<script>
import { charCodes, mircColours99, blockWidth, blockHeight } from "../../ascii";

export default {
  name: "CharPicker",
  created() {},
  props: ["canvasX", "canvasY", "yOffset"],
  computed: {
    charCodes() {
      return charCodes;
    },
    mircColours() {
      return mircColours99;
    },
    currentFg() {
      return this.$store.getters.currentFg;
    },
    currentBg() {
      return this.$store.getters.currentBg;
    },
    outline() {
      let outlineColor = this.currentBg === 0 ? 'black' : 'white';
      if (this.currentFg === this.currentBg) {
        return `-webkit-text-stroke-width: 0.5px;-webkit-text-stroke-color: ${outlineColor};`;
      }

      return "";
    },
    blockWidth() {
      return blockWidth*2;
    },
    blockHeight() {
      return blockHeight*2;
    }
  },
  methods: {
    onCharChange(char) {
      this.$store.commit("changeChar", char);
    },
  },
};
</script>
