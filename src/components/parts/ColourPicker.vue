<template>
    <vue-draggable-resizable
      style="z-index: 5;"
      :x="100"
      :y="100"
      :w="100"
      :h="278"
    >
    <t-card>
    <t-button
      type="button"
      v-for="(value, keyColours) in mircColours"
      :key="keyColours"
      :style="`background-color: ${mircColours[keyColours]} !important;`"
      class="border-gray-200 p-3"
      @click="onColourChange(keyColours)"
    ></t-button>
    </t-card>
    </vue-draggable-resizable>
    
</template>

<script>
export default {
  name: "ColourPicker",
  created() {},
  computed: {
    mircColours() {
      return this.$store.getters.mircColours;
    },
    toolbarState() {
      return this.$store.getters.toolbarState;
    },
  },
  methods: {
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
