<template>
  <div>
    <t-button
      type="button"
      :style="`background-color: ${mircColours[currentFg]} !important;`"
      class="border-gray-200 w-14 h-14 text-2xl"
      id="currentColourFg"
      @click="$store.commit('changeIsUpdatingFg', !toolbarState.isChoosingFg)"
    >
      FG
    </t-button>

    <t-button
      type="button"
      :style="`background-color: ${mircColours[currentBg]} !important;`"
      class="border-gray-200 w-14 h-14 text-2xl ml-2"
      id="currentColourBg"
      @click="$store.commit('changeIsUpdatingBg', !toolbarState.isChoosingBg)"
    >
      BG
    </t-button>

    <t-button
      type="button"
      class="rounded-3xl w-7 h-7"
      style="margin-left: -75px; margin-top: 12px"
      id="swapColour"
      @click="swapColours()"
    >
      <span class="material-icons">swap_horiz</span>
    </t-button>

    <t-button
      type="button"
      :style="`background-color: ${mircColours[currentBg]} !important;color: ${mircColours[currentFg]};`"
      class="border-gray-200 w-14 h-14 text-2xl ml-14"
      id="currentChar"
      @click="
        $store.commit('changeIsUpdatingChar', !toolbarState.isChoosingChar)
      "
    >
      {{ toolbarState.selectedChar === " " ? "SP" : toolbarState.selectedChar }}
    </t-button>
  </div>
</template>

<script>
import { mircColours99 } from "../ascii";

export default {
  name: "Colours",
  data: () => ({}),
  computed: {
    mircColours() {
      return mircColours99;
    },
    toolbarState() {
      return this.$store.getters.toolbarState;
    },
    currentFg() {
      return this.$store.getters.currentFg;
    },
    currentBg() {
      return this.$store.getters.currentBg;
    },
  },
  methods: {
    swapColours() {
      const bg = this.currentBg;
      const fg = this.currentFg;

      this.$store.commit("changeColourFg", bg);
      this.$store.commit("changeColourBg", fg);
    },
  },
};
</script>
