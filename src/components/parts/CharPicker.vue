<template>
  <div
    ref="el"
    :style="style"
    class="fixed z-50"
  >
    <div class="ab-card w-full h-full">
      <div class="p-1">
        <input
          type="checkbox"
          class="ab-checkbox"
          name="leave-open"
          v-model="persistChars"
          @click="changePersistChars"
        /> <small>Persist this panel after character changes</small>
      </div>
      <button
        type="button"
        v-for="(char, keyChar) in charCodes"
        :key="keyChar"
        :style="`background-color: ${mircColours[currentBg]} !important;color: ${mircColours[currentFg]} !important;${outline};font-size: 13px;width: ${blockWidth}px;height: ${blockHeight}px;`"
        class="ab-button m-0.5"
        @click="onCharChange(char)"
      >
        {{ char === " " ? "SP" : char }}
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import { charCodes, mircColours99, blockWidth, blockHeight } from "../../ascii";
import { useAsciiBirdStore } from '../../store';
import { useToast } from '../../composables/useToast';
import { useDialog } from '../../composables/useDialog';
import { useClipboard } from '../../composables/useClipboard';
import { useDraggable } from '@vueuse/core';

export default {
  name: "CharPicker",
  setup(props) {
    const store = useAsciiBirdStore();
    const toast = useToast();
    const dialog = useDialog();
    const clipboard = useClipboard();
    const el = ref(null);
    const { style } = useDraggable(el, {
      initialValue: { x: 170, y: 100 + (props.yOffset || 0) },
    });
    return { store, toast, dialog, clipboard, el, style };
  },
  props: ["canvasX", "canvasY", "yOffset"],
  data: () => ({
    persistChars: false,
  }),
  computed: {
    charCodes() {
      return charCodes;
    },
    mircColours() {
      return mircColours99;
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
    blockWidth() {
      return blockWidth*2;
    },
    blockHeight() {
      return blockHeight*2;
    },
    persistCharPanel() {
      return this.store.toolbarState.persistCharPanel;
    }
  },
  methods: {
    onCharChange(char) {
      this.store.changeChar(char);
    },
    changePersistChars() {
      this.store.persistCharPanel(!this.persistChars);
    }
  },
};
</script>
