<template>
  <div>
    <vue-draggable-resizable
      :grid="[currentAscii.blockWidth, currentAscii.blockHeight]"
      :min-width="blockWidth * 50"
      :max-width="blockWidth * 50"
      :min-height="blockHeight * 50"
      :max-height="blockHeight * 50"
      :w="blockWidth * 50"
      :h="blockWidth * 50"
      :x="blockWidth * 150"
      :y="blockHeight * 3"
    >

    <t-card class="h-full">

      <div class="flex mx-auto">
        <div class="w-1/2">
          <t-button type="button" class="block w-full" @click="tab = 1">Library</t-button>
        </div>
        <div class="w-1/2">
          <t-button type="button" class="block w-full" @click="tab = 0">History</t-button>
        </div>
      </div>

      <div v-if="tab === 0">
        <div v-for="(brush, key) in brushHistory" :key="key">
          <BrushCanvas :blocks="decompressBlock(brush.blocks)" />
         
          <t-button type="button" @click="reuseBlocks(decompressBlock(brush.blocks))">Reuse</t-button>
          <t-button type="button" @click="saveToLibrary(decompressBlock(brush.blocks))">Save to Library</t-button>
        </div>
      </div>

      <div v-if="tab === 1">
        <div v-for="(brush, key) in brushLibrary" :key="key">
          <BrushCanvas :blocks="decompressBlock(brush.blocks)" />
          <t-button type="button" @click="reuseBlocks(decompressBlock(brush.blocks))">Reuse</t-button>
        </div>
      </div>

    </t-card>

    </vue-draggable-resizable>
  </div>
</template>

<script>
import { mircColours99, blockWidth, blockHeight } from "../ascii";
import BrushCanvas from "./parts/BrushCanvas.vue"
import LZString from 'lz-string';

export default {
  name: "BrushLibrary",
  mounted() {
  },
  data: () => ({
    tab: 1
  }),
  components: {
    BrushCanvas,
  },
  computed: {
    blockWidth() {
      return blockWidth;
    },
    blockHeight() {
      return blockHeight;
    },
    currentAscii() {
      return this.$store.getters.currentAscii;
    },
    toolbarState() {
      return this.$store.getters.toolbarState;
    },
    isTargettingBg() {
      return this.$store.getters.isTargettingBg;
    },
    isTargettingFg() {
      return this.$store.getters.isTargettingFg;
    },
    isTargettingChar() {
      return this.$store.getters.isTargettingChar;
    },
    currentFg() {
      return this.$store.getters.currentFg;
    },
    currentBg() {
      return this.$store.getters.currentBg;
    },
    currentChar() {
      return this.$store.getters.currentChar;
    },
    brushSizeHeight() {
      return this.$store.getters.brushSizeHeight;
    },
    brushSizeWidth() {
      return this.$store.getters.brushSizeWidth;
    },
    brushSizeType() {
      return this.$store.getters.brushSizeType;
    },
    brushHistory() {
      return this.$store.getters.brushHistory.slice(0,5);
    },
    brushLibrary() {
      return this.$store.getters.brushLibrary;
    },
    mircColours() {
      return mircColours99;
    },
    options() {
      return this.$store.getters.options;
    },
    brushBlocks() {
      return this.$store.getters.brushBlocks;
    },
  },
  watch: {
  },
  methods: {
    changeTab(tab) {
      this.tab = tab
    },
    decompressBlock(item) {
      console.log(JSON.parse(LZString.decompressFromUTF16(item)))
      return JSON.parse(LZString.decompressFromUTF16(item))
    },
    reuseBlocks(value) {
      // this.$store.commit('pushBrushHistory', this.brushBlocks)
      // this.$store.commit('changeColourFg', value[0][0].fg )
      // this.$store.commit('changeColourBg', value[0][0].bg )
      // this.$store.commit('changeChar', value[0][0].char )
      this.$store.commit('brushBlocks', value)
    },
    saveToLibrary(value) {
      this.$store.commit('pushBrushLibrary', value)
    }    
  },
};
</script>
