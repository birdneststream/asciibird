<template>
  <t-card>


    <t-button
      type="button"
      :style="`background-color: ${this.$store.getters.mircColours[$store.getters.getFgColour]} !important;`"
      class="border-gray-200 p-1"
      id="currentColourFg"
      @click="$store.commit('changeIsUpdatingFg', true)"
      >FG</t-button
    >

    <t-button
      type="button"
      :style="`background-color: ${this.$store.getters.mircColours[$store.getters.getBgColour]} !important;`"
      class="border-gray-200 p-1"
      id="currentColourBg"
      @click="$store.commit('changeIsUpdatingBg', true)"
      >BG</t-button
    >

    <t-button
      type="button"
      class="p-1 bg-white"
      id="swapColour"
      @click="swapColours()"
    >
      <font-awesome-icon :icon="['fas', 'sync']" />
    </t-button>


    <t-button
      type="button"
      :style="`background-color: ${this.$store.getters.mircColours[$store.getters.getBgColour]} !important;color: ${this.$store.getters.mircColours[$store.getters.getFgColour]};`"
      class="border-gray-200 p-1"
      id="currentChar"
      @click="$store.commit('changeIsUpdatingChar', true)"
      >{{ `${$store.getters.getToolbarState.selectedChar}` }}</t-button
    >


  </t-card>
</template>

<script>
export default {
  name: "Colours",
  data: () => ({}),
  methods: {
    swapColours() {
      let bg = this.$store.getters.getToolbarState.currentColourBg;
      let fg = this.$store.getters.getToolbarState.currentColourFg;

      this.$store.commit("changeColourFg", bg);
      this.$store.commit("changeColourBg", fg);
    },
  },
};
</script>
