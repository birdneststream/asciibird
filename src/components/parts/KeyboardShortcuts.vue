<template>
  <div />
</template>

<script setup lang="ts">
import { computed, watch, onUnmounted } from 'vue';
import { toolbarIcons } from '../../ascii';
import { useAsciiBirdStore } from '../../store';
import { useToolbarStore } from '../../store/toolbar';
import { useModalStore } from '../../store/modal';
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
const toolbarStore = useToolbarStore();
const modalStore = useModalStore();

const toolbarState = computed(() => toolbarStore.toolbarState);
const currentTool = computed(() => toolbarIcons[toolbarStore.currentTool]);
const haveOpenTabs = computed(() => store.currentAscii !== false);
const isDefault = computed(() => currentTool.value?.name === 'default');
const isKeyboardDisabled = computed(() => modalStore.isKeyboardDisabled);
const isModalOpen = computed(() => modalStore.isModalOpen);

const disableKeyboard = computed(
  () =>
    props.isInputtingBrushSize ||
    isKeyboardDisabled.value ||
    props.isShowingDialog ||
    isModalOpen.value,
);

// Hotkey: all keys in editor scope
hotkeys('*', 'editor', (event) => {
  if (
    toolbarState.value.isChoosingChar &&
    event.key.length === 1 &&
    !disableKeyboard.value &&
    !toolbarState.value.persistCharPanel
  ) {
    event.preventDefault();
    toolbarStore.changeChar(event.key);
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
    event.preventDefault();
    toolbarStore.changeTool(Number.parseInt(event.key) - 1);
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
    event.preventDefault();
    if (toolbarState.value.isChoosingFg) {
      toolbarStore.changeColourFg(Number.parseInt(event.key));
      return;
    }

    if (toolbarState.value.isChoosingBg) {
      toolbarStore.changeColourBg(Number.parseInt(event.key));
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
    toolbarStore.changeIsUpdatingFg(false);
    toolbarStore.changeIsUpdatingBg(false);
    toolbarStore.changeIsUpdatingChar(false);
    return;
  }

  if (!isDefault.value) {
    event.preventDefault();
    emit('updatecanvas');
    toolbarStore.changeTool(0);
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
  // Unbind only the keys registered by this component,
  // preserving tool shortcuts registered by useGlobalShortcuts.ts
  hotkeys.unbind('*', 'editor');
  hotkeys.unbind('Escape', 'editor');
});
</script>
