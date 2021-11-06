<template>
  <div>
    <vue-draggable-resizable
      @dragstop="onDragStop"
      :grid="[blockWidth, blockHeight]"
      :min-width="blockWidth * 40"
      :max-width="blockWidth * 40"
      :min-height="blockHeight * 20"
      :max-height="blockHeight * 20"
      :w="debugPanelState.w"
      :h="debugPanelState.h"
      :x="debugPanelState.x"
      :y="debugPanelState.y"
    >
      <t-card class="h-full">
        <span
          class="ml-5"
          v-html="`Tool: ${getToolName}`"
        /> <br>
        <span
          class="ml-5"
          v-html="`FgColour: ${currentFg}`"
        /> <br>
        <span
          class="ml-5"
          v-html="`BgColor: ${currentBg}`"
        /> <br>
        <span
          class="ml-5"
          v-html="`Char: ${currentChar}`"
        /> <br>

        <span
          class="ml-5"
          v-html="`canvasX: ${canvasX}`"
        /> <br>
        <span
          class="ml-5"
          v-html="`canvasY: ${canvasY}`"
        /> <br>

        <span
          class="ml-5"
          v-html="`mirrorX: ${mirrorX}`"
        /> <br>
        <span
          class="ml-5"
          v-html="`mirrorY: ${mirrorY}`"
        />
        
        <br>

        <span class="ml-5"> Size: {{ asciiStats.sizeCompressed }} ({{ asciiStats.sizeUncompressed }} / {{ asciiStats.sizePercentage }}%) </span> <br>

        <span class="ml-5"> State Size: {{ asciiStats.stateSize }}</span> <br>


        <div class="mb-4 border-t-2">
            <div class="mt-1 p-2 bg-red-300 rounded-md cursor-pointer" @click="copyUriToClipboard()">Copy URI Encoded String</div>
        </div>



      </t-card>
    </vue-draggable-resizable>
  </div>
</template>
<script>
import { toolbarIcons, mircColours99, blockWidth, blockHeight, exportMirc } from '../ascii';
import LZString from "lz-string";

export default {
  created() {
    this.panel.x = this.debugPanelState.x;
    this.panel.y = this.debugPanelState.y;
    this.panel.w = this.debugPanelState.w;
    this.panel.h = this.debugPanelState.h;
  },
  name: 'DebugPanel',
  props: ['canvasX', 'canvasY'],
  data: () => ({
    panel: {
      w: 0,
      h: 0,
      x: 100,
      y: 100,
      visible: true,
    },
    throttle: true,
  }),
  computed: {
    blockWidth() {
      return blockWidth * this.blockSizeMultiplier;
    },
    blockHeight() {
      return blockHeight * this.blockSizeMultiplier;
    },
    blockSizeMultiplier() {
      return this.$store.getters.blockSizeMultiplier
    },
    getToolName() {
      return toolbarIcons[this.$store.getters.currentTool] ? toolbarIcons[this.$store.getters.currentTool].name : 'none';
    },
    debugPanelState() {
      return this.$store.getters.debugPanel;
    },
    currentAscii() {
      return this.$store.getters.currentAscii;
    },
    currentAsciiBlocks() {
      return this.$store.getters.currentAsciiBlocks;
    },
    asciiStats() {
      const compressed = (this.currentAscii.blocks.length / 1024).toFixed(2);
      const uncompressed = (JSON.stringify(this.currentAsciiBlocks).length / 1024).toFixed(2);

      const stateSize = (JSON.stringify(this.state).length / 1024).toFixed(2);
      return {
        sizeCompressed: `${compressed}kb`,
        sizeUncompressed: `${uncompressed}kb`,
        stateSize: `${stateSize}kb`,
        sizePercentage: (100 - (uncompressed / compressed)).toFixed(2),
      };
    },
    currentTool() {
      return toolbarIcons[
        this.$store.getters.currentTool
      ];
    },
    mircColours() {
      return mircColours99;
    },
    canFg() {
      return this.$store.getters.isTargettingFg;
    },
    canBg() {
      return this.$store.getters.isTargettingBg;
    },
    canText() {
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
    isTextEditing() {
      return this.currentTool.name === 'text';
    },
    isSelecting() {
      return this.currentTool.name === 'select';
    },
    isSelected() {
      return (
        this.selecting.startX
        && this.selecting.startY
        && this.selecting.endX
        && this.selecting.endY
      );
    },
    brushBlocks() {
      return this.$store.getters.brushBlocks;
    },
    toolbarState() {
      return this.$store.getters.toolbarState;
    },
    mirrorX() {
      return this.toolbarState.mirrorX;
    },
    mirrorY() {
      return this.toolbarState.mirrorY;
    },
    state() {
      return this.$store.getters.state;
    },
  },
  watch: {},
  methods: {
    copyUriToClipboard() {
        let ascii = LZString.compressToEncodedURIComponent(JSON.stringify(this.currentAsciiBlocks));

        this.$copyText(ascii).then(
          (e) => {
            this.$toasted.show("Copied URI encoded ASCII for Splash Ascii!", {
              type: "success",
            });
          },
          (e) => {
            this.$toasted.show("Error when copying URI encoded ASCII!", {
              type: "error",
            });
          }
        );
    },
    onResize(x, y, w, h) {
      this.panel.x = x;
      this.panel.y = y;
      this.panel.w = w;
      this.panel.h = h;

      this.$store.commit('changeDebugPanelState', this.panel);
    },
    onDragStop(x, y) {
      this.panel.x = x;
      this.panel.y = y;

      this.$store.commit('changeDebugPanelState', this.panel);
    },
  },
};
</script>
