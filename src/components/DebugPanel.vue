<template>
  <div>
    <div
      ref="panelEl"
      :style="panelStyle"
      class="fixed"
    >
      <div class="ab-card h-full">
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

        <span
          class="ml-5"
        >State Internal Size: {{ asciiStats.stateSize }}
        </span>
        <br>

        <div class="mb-4 border-t-2">
          <div
            class="mt-1 p-2 bg-red-300 rounded-md cursor-pointer"
            @click="copyUriToClipboard()"
          >
            Copy URI Encoded String
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import {
  toolbarIcons,
  mircColours99,
  blockWidth,
  blockHeight,
  exportMirc,
  mergeLayers,
} from "../ascii";
import LZString from "lz-string";
import { useAsciiBirdStore } from "../store";
import { useToast } from "../composables/useToast";
import { useClipboard } from "../composables/useClipboard";
import { useDraggable } from "@vueuse/core";
import { ref } from "vue";

export default {
  setup() {
    const store = useAsciiBirdStore();
    const toastShow = useToast();
    const copyText = useClipboard();
    const panelEl = ref(null);
    const { style: panelStyle } = useDraggable(panelEl, {
      initialValue: { x: store.debugPanel.x, y: store.debugPanel.y },
    });
    return { store, toastShow, copyText, panelEl, panelStyle };
  },
  created() {
    this.panel.x = this.store.debugPanel.x;
    this.panel.y = this.store.debugPanel.y;
    this.panel.w = this.store.debugPanel.w;
    this.panel.h = this.store.debugPanel.h;
  },
  name: "DebugPanel",
  props: ["canvasX", "canvasY"],
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
      return blockWidth * this.store.blockSizeMultiplier;
    },
    blockHeight() {
      return blockHeight * this.store.blockSizeMultiplier;
    },
    blockSizeMultiplier() {
      return this.store.blockSizeMultiplier;
    },
    getToolName() {
      return toolbarIcons[this.store.currentTool]
        ? toolbarIcons[this.store.currentTool].name
        : "none";
    },
    debugPanelState() {
      return this.store.debugPanel;
    },
    currentAscii() {
      return this.store.currentAscii;
    },
    asciiStats() {
      const byteSize = (str) => new Blob([str]).size;

      const stateSize = (byteSize(JSON.stringify(this.state)) / 1024).toFixed(
        2
      );
      return {
        stateSize: `${stateSize}kb`,
      };
    },
    currentTool() {
      return toolbarIcons[this.store.currentTool];
    },
    mircColours() {
      return mircColours99;
    },
    canFg() {
      return this.store.isTargettingFg;
    },
    canBg() {
      return this.store.isTargettingBg;
    },
    canText() {
      return this.store.isTargettingChar;
    },
    currentFg() {
      return this.store.currentFg;
    },
    currentBg() {
      return this.store.currentBg;
    },
    currentChar() {
      return this.store.currentChar;
    },
    isTextEditing() {
      return this.currentTool.name === "text";
    },
    isSelecting() {
      return this.currentTool.name === "select";
    },
    isSelected() {
      return (
        this.selecting.startX &&
        this.selecting.startY &&
        this.selecting.endX &&
        this.selecting.endY
      );
    },
    brushBlocks() {
      return this.store.brushBlocks;
    },
    toolbarState() {
      return this.store.toolbarState;
    },
    mirrorX() {
      return this.toolbarState.mirrorX;
    },
    mirrorY() {
      return this.toolbarState.mirrorY;
    },
    state() {
      return this.store.state;
    },
  },
  watch: {},
  methods: {
    copyUriToClipboard() {
      let ascii = LZString.compressToEncodedURIComponent(
        JSON.stringify(mergeLayers())
      );

      this.copyText(ascii).then(
        () => {
          this.toastShow("Copied URI encoded ASCII for Splash Ascii!", {
            type: "success",
          });
        },
        () => {
          this.toastShow("Error when copying URI encoded ASCII!", {
            type: "error",
          });
        }
      );
    },
    exportMirc() {
      return exportMirc();
    },
  },
};
</script>
