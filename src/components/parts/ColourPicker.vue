<template>
  <div
    ref="el"
    :style="style"
    class="fixed z-50"
  >
    <div class="ab-card w-full h-full">
      <span
        v-for="(value, keyColours) in mircColours"
        :key="keyColours"
      >
        <hr v-if="keyColours === 16">

        <button
          type="button"
          :style="`background-color: ${mircColours[keyColours]} !important;`"
          class="ab-button border-gray-200 p-3"
          @click="onColourChange(keyColours)"
        />
      </span>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { mircColours99 } from "../../ascii";
import { useAsciiBirdStore } from '../../store';
import { useToast } from '../../composables/useToast';
import { useDialog } from '../../composables/useDialog';
import { useClipboard } from '../../composables/useClipboard';
import { useDraggable } from '@vueuse/core';

export default {
  name: "ColourPicker",
  setup(props) {
    const store = useAsciiBirdStore();
    const toast = useToast();
    const dialog = useDialog();
    const clipboard = useClipboard();
    const el = ref(null);
    const { style } = useDraggable(el, {
      initialValue: { x: 100, y: 100 + (props.yOffset || 0) },
    });
    return { store, toast, dialog, clipboard, el, style };
  },
  props: { yOffset: { type: Number, default: 0 } },
  computed: {
    mircColours() {
      return mircColours99;
    },
    toolbarState() {
      return this.store.toolbarState;
    },
  },
  methods: {
    close() {
      this.store.changeIsUpdatingFg(false);
      this.store.changeIsUpdatingBg(false);
    },
    onColourChange(colour) {
      if (this.toolbarState.isChoosingFg) {
        this.store.changeColourFg(colour);
      }

      if (this.toolbarState.isChoosingBg) {
        this.store.changeColourBg(colour);
      }
    },
  },
};
</script>
