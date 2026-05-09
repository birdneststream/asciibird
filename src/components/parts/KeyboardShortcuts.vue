<template>
  <div />
</template>

<script setup lang="ts">
import { computed, watch, onUnmounted } from 'vue';
import { toolbarIcons } from '../../ascii';
import { useAsciiBirdStore } from '../../store';
import hotkeys from 'hotkeys-js';

const props = defineProps<{
  selectedBlocks?: unknown[];
  textEditing?: object | null;
  selecting?: Record<string, unknown>;
  isInputtingBrushSize?: boolean;
  isShowingDialog?: boolean;
  canvasX?: number | null;
  canvasY?: number | null;
}>();

const emit = defineEmits<{
  updatecanvas: [];
}>();

const store = useAsciiBirdStore();

const toolbarState = computed(() => store.toolbarState);
const currentTool = computed(() => toolbarIcons[store.currentTool]);
const haveOpenTabs = computed(() => store.currentAscii !== false);
const isDefault = computed(() => currentTool.value?.name === 'default');
const isKeyboardDisabled = computed(() => store.isKeyboardDisabled);
const isModalOpen = computed(() => store.isModalOpen);

const disableKeyboard = computed(
  () =>
    props.isInputtingBrushSize ||
    isKeyboardDisabled.value ||
    props.isShowingDialog ||
    isModalOpen.value,
);

// Hotkey: all keys in editor scope
hotkeys('*', 'editor', (event) => {
  event.preventDefault();

  if (
    toolbarState.value.isChoosingChar &&
    event.key.length === 1 &&
    !disableKeyboard.value &&
    !toolbarState.value.persistCharPanel
  ) {
    store.changeChar(event.key);
    return;
  }

  if (
    Number.parseInt(event.key) >= 1 &&
    Number.parseInt(event.key) <= 8 &&
    !toolbarState.value.isChoosingFg &&
    !toolbarState.value.isChoosingBg &&
    event.altKey &&
    haveOpenTabs.value
  ) {
    store.changeTool(Number.parseInt(event.key) - 1);
    emit('updatecanvas');
    return;
  }

  if (
    Number.parseInt(event.key) >= 0 &&
    Number.parseInt(event.key) <= 9 &&
    (toolbarState.value.isChoosingFg ||
      toolbarState.value.isChoosingBg) &&
    haveOpenTabs.value
  ) {
    if (toolbarState.value.isChoosingFg) {
      store.changeColourFg(Number.parseInt(event.key));
      return;
    }

    if (toolbarState.value.isChoosingBg) {
      store.changeColourBg(Number.parseInt(event.key));
      return;
    }
  }
});

// Hotkey: Escape in editor scope
hotkeys('Escape', 'editor', (event) => {
  if (
    !props.textEditing &&
    (toolbarState.value.isChoosingChar ||
      toolbarState.value.isChoosingBg ||
      (toolbarState.value.isChoosingFg && haveOpenTabs.value))
  ) {
    event.preventDefault();
    store.changeIsUpdatingFg(false);
    store.changeIsUpdatingBg(false);
    store.changeIsUpdatingChar(false);
    return;
  }

  if (!isDefault.value) {
    event.preventDefault();
    emit('updatecanvas');
    store.changeTool(0);
    return;
  }
});

// Set initial scope
hotkeys.setScope(disableKeyboard.value ? 'modals' : 'editor');

// Watch for scope changes
watch(disableKeyboard, (val) => {
  hotkeys.setScope(val ? 'modals' : 'editor');
});

// Cleanup hotkeys on unmount
onUnmounted(() => {
  hotkeys.deleteScope('editor');
});
</script>
