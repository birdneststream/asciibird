<template>
  <t-card>


    <t-button
      type="button"
      :style="`background-color: ${mircColours[currentFg]} !important;`"
      class="border-gray-200 p-1"
      id="currentColourFg"
      @click="$store.commit('changeIsUpdatingFg', true)"
      >FG</t-button
    >

    <t-button
      type="button"
      :style="`background-color: ${mircColours[currentBg]} !important;`"
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
      :style="`background-color: ${mircColours[currentBg]} !important;color: ${mircColours[currentFg]};`"
      class="border-gray-200 p-1"
      id="currentChar"
      @click="$store.commit('changeIsUpdatingChar', true)"
      >{{ `${toolbarState.selectedChar}` }}</t-button
    >

  </t-card>
</template>

<script>
export default {
  name: "Colours",
  data: () => ({}),
  computed: {
    mircColours() {
      return this.$store.getters.mircColours;
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
      let bg = this.currentBg;
      let fg = this.currentFg;

      this.$store.commit("changeColourFg", bg);
      this.$store.commit("changeColourBg", fg);
    },
  },
};
</script>
