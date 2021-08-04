<template>
  <div>
    <t-button
      type="button"
      :style="`background-color: ${mircColours[currentFg]} !important;`"
      class="border-gray-200 p-3 w-14 h-14 text-2xl"
      id="currentColourFg"
      @click="$store.commit('changeIsUpdatingFg', true)"
    >
      FG
    </t-button>

    <t-button
      type="button"
      :style="`background-color: ${mircColours[currentBg]} !important;`"
      class="border-gray-200 p-3 w-14 h-14 text-2xl"
      id="currentColourBg"
      @click="$store.commit('changeIsUpdatingBg', true)"
    >
      BG
    </t-button>

    <t-button
      type="button"
      class="bg-white absolute rounded-full"
      style="margin-left: -67px; margin-top: 15px"
      id="swapColour"
      @click="swapColours()"
    >
      <font-awesome-icon :icon="['fas', 'sync']" size="lg"/>
    </t-button>

    <t-button
      type="button"
      :style="`background-color: ${mircColours[currentBg]} !important;color: ${mircColours[currentFg]};`"
      class="border-gray-200 p-3 w-14 h-14 text-2xl"
      id="currentChar"
      @click="$store.commit('changeIsUpdatingChar', true)"
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
