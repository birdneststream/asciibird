<template>
  <vue-draggable-resizable :x="100" :y="100+yOffset" :w="400" :h="278">
    <t-card class="w-full h-full">
      <span v-for="(value, keyColours) in mircColours" :key="keyColours">
        <hr v-if="keyColours === 16" />

        <t-button
          type="button"
          :style="`background-color: ${mircColours[keyColours]} !important;`"
          class="border-gray-200 p-3"
          @click="onColourChange(keyColours)"
        />
      </span>
    </t-card>
  </vue-draggable-resizable>
</template>

<script>
import { mircColours99 } from "../../ascii";

export default {
  name: "ColourPicker",
  created() {},
  props: ["yOffset"],
  computed: {
    mircColours() {
      return mircColours99;
    },
    toolbarState() {
      return this.$store.getters.toolbarState;
    },
  },
  methods: {
    close() {
      this.$store.commit("changeIsUpdatingFg", false);
      this.$store.commit("changeIsUpdatingBg", false);
    },
    onColourChange(colour) {
      if (this.toolbarState.isChoosingFg) {
        this.$store.commit("changeColourFg", colour);
      }

      if (this.toolbarState.isChoosingBg) {
        this.$store.commit("changeColourBg", colour);
      }
    },
  },
};
</script>
