<template>
  <div>
    <button
      type="button"
      :style="`background-color: ${mircColours[currentFg]} !important;`"
      class="ab-button border-gray-200 w-14 h-14 text-2xl"
      id="currentColourFg"
      @click="store.changeIsUpdatingFg(!toolbarState.isChoosingFg)"
    >
      FG
    </button>

    <button
      type="button"
      :style="`background-color: ${mircColours[currentBg]} !important;`"
      class="ab-button border-gray-200 w-14 h-14 text-2xl ml-2"
      id="currentColourBg"
      @click="store.changeIsUpdatingBg(!toolbarState.isChoosingBg)"
    >
      BG
    </button>

    <button
      type="button"
      class="ab-button rounded-3xl w-7 h-7"
      style="margin-left: -75px; margin-top: 12px"
      id="swapColour"
      @click="swapColours()"
    >
      <span class="material-icons">swap_horiz</span>
    </button>

    <button
      type="button"
      :style="`background-color: ${mircColours[currentBg]} !important;color: ${mircColours[currentFg]};${outline}`"
      class="ab-button border-gray-200 w-14 h-14 text-2xl ml-14"
      id="currentChar"
      :disabled="halfBlockEditing"
      @click="store.changeIsUpdatingChar(!toolbarState.isChoosingChar)"
    >
      {{ toolbarState.selectedChar === " " ? "SP" : toolbarState.selectedChar }}
    </button>
  </div>
</template>

<script>
import { mircColours99 } from "../ascii";
import { useAsciiBirdStore } from '../store';
import { useToast } from '../composables/useToast';
import { useDialog } from '../composables/useDialog';
import { useClipboard } from '../composables/useClipboard';

export default {
  name: "Colours",
  setup() {
    const store = useAsciiBirdStore();
    const toast = useToast();
    const dialog = useDialog();
    const clipboard = useClipboard();
    return { store, toast, dialog, clipboard };
  },
  data: () => ({}),
  computed: {
    mircColours() {
      return mircColours99;
    },
    toolbarState() {
      return this.store.toolbarState;
    },
    currentFg() {
      return this.store.currentFg;
    },
    currentBg() {
      return this.store.currentBg;
    },
    outline() {
      let outlineColor = this.currentBg === 0 ? 'black' : 'white';
      if (this.currentFg === this.currentBg) {
        return `-webkit-text-stroke-width: 0.5px;-webkit-text-stroke-color: ${outlineColor};`;
      }

      return "";
    },
    halfBlockEditing() {
      return this.toolbarState.halfBlockEditing;
    },
  },
  methods: {
    swapColours() {
      const bg = this.currentBg;
      const fg = this.currentFg;

      this.store.changeColourFg(bg);
      this.store.changeColourBg(fg);
    },
  },
};
</script>
