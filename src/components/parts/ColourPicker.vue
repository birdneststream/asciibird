<template>
  <vue-draggable-resizable
    style="z-index: 5"
    :x="100"
    :y="100"
    :w="400"
    :h="278"
  >
    <t-card>
      <t-button
        type="button"
        class="border-gray-200 p-1"
        @click="close()"
      >
        X
      </t-button><br>

      <span
        v-for="(value, keyColours) in mircColours"
        :key="keyColours"
      >
        <hr v-if="keyColours === 16">

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
import { mircColours99 } from '../../ascii';

export default {
  name: 'ColourPicker',
  created() {},
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
      this.$store.commit('changeIsUpdatingFg', false);
      this.$store.commit('changeIsUpdatingBg', false);
    },
    onColourChange(colour) {
      if (this.toolbarState.isChoosingFg) {
        this.$store.commit('changeColourFg', colour);
      }

      if (this.toolbarState.isChoosingBg) {
        this.$store.commit('changeColourBg', colour);
      }
    },
  },
};
</script>
