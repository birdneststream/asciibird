<template>
  <vue-draggable-resizable :x="100" :y="100" :w="1100" :h="350">
    <t-card
    class="w-full h-full"
    >
      <t-button
        type="button"
        v-for="(char, keyChar) in charCodes"
        :key="keyChar"
        class="border-gray-200 p-2 min-h-0"
        @click="onCharChange(char)"
      >
        {{ char === " " ? "space" : char }}
      </t-button>
    </t-card>
  </vue-draggable-resizable>
</template>

<script>
import { charCodes } from "../../ascii";

export default {
  name: "CharPicker",
  created() {},
  props: ["canvasX", "canvasY"],
  computed: {
    charCodes() {
      return charCodes;
    },
  },
  methods: {
    onCharChange(char) {
      this.$store.commit("changeChar", char);
    },
  },
};
</script>
