<template>
  <div>
    <t-button
      type="button"
      :style="`background-color: ${mircColours[currentFg]} !important;`"
      class="border-gray-200 w-12 h-12 text-2xl"
      id="currentColourFg"
      @click="$store.commit('changeIsUpdatingFg', ! toolbarState.isChoosingFg )"
    >
      FG
    </t-button>

    <t-button
      type="button"
      :style="`background-color: ${mircColours[currentBg]} !important;`"
      class="border-gray-200 w-12 h-12 text-2xl ml-2"
      id="currentColourBg"
      @click="$store.commit('changeIsUpdatingBg', ! toolbarState.isChoosingBg )"
    >
      BG
    </t-button>

    <t-button
      type="button"
      class="bg-white absolute rounded-3xl"
      style="margin-left: -62px; margin-top: 12px"
      id="swapColour"
      @click="swapColours()"
    >
      <font-awesome-icon :icon="['fas', 'sync']" />
    </t-button>

    <t-button
      type="button"
      :style="`background-color: ${mircColours[currentBg]} !important;color: ${mircColours[currentFg]};`"
      class="border-gray-200 w-12 h-12 text-2xl ml-2"
      id="currentChar"
      @click="$store.commit('changeIsUpdatingChar', ! toolbarState.isChoosingChar )"
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
