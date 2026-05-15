<template>
  <context-menu
    ref="menuRef"
    class="z-picker"
  >
    <ul>
      <li
        @click="emit('save-png')"
        class="ab-context-menu-item"
      >
        Save as PNG
      </li>
      <li
        @click="emit('export-mirc', 'clipboard')"
        class="ab-context-menu-item"
      >
        Export ASCII to mIRC Clipboard
      </li>
      <li
        @click="emit('export-mirc', 'file')"
        class="ab-context-menu-item"
      >
        Export ASCII to mIRC File
      </li>
      <li
        @click="emit('export-plain-text')"
        class="ab-context-menu-item"
      >
        Export Plain Text to Clipboard
      </li>
      <li
        @click="emit('export-html')"
        class="ab-context-menu-item"
      >
        Export as HTML File
      </li>
      <template v-if="hasSelection">
        <li class="ab-context-menu-separator" />
        <li
          @click="emit('transform-selection', 'rotate-cw')"
          class="ab-context-menu-item"
        >
          Rotate 90° CW
          <span class="ab-shortcut">Ctrl+Shift+&gt;</span>
        </li>
        <li
          @click="emit('transform-selection', 'rotate-ccw')"
          class="ab-context-menu-item"
        >
          Rotate 90° CCW
          <span class="ab-shortcut">Ctrl+Shift+&lt;</span>
        </li>
        <li
          @click="emit('transform-selection', 'flip-h')"
          class="ab-context-menu-item"
        >
          Flip Horizontal
          <span class="ab-shortcut">Ctrl+Shift+H</span>
        </li>
        <li
          @click="emit('transform-selection', 'flip-v')"
          class="ab-context-menu-item"
        >
          Flip Vertical
          <span class="ab-shortcut">Ctrl+Shift+X</span>
        </li>
        <li class="ab-context-menu-separator" />
        <li
          @click="emit('replace-color')"
          class="ab-context-menu-item"
        >
          Replace Color in Selection
          <span class="ab-shortcut">R</span>
        </li>
      </template>
      <template v-if="hasSelection">
        <li class="ab-context-menu-separator" />
        <li
          @click="emit('copy-selection')"
          class="ab-context-menu-item"
        >
          Copy
          <span class="ab-shortcut">Ctrl+C</span>
        </li>
        <li
          @click="emit('cut-selection')"
          class="ab-context-menu-item"
        >
          Cut
          <span class="ab-shortcut">Ctrl+X</span>
        </li>
        <li
          @click="emit('delete-selection')"
          class="ab-context-menu-item"
        >
          Delete Selection
          <span class="ab-shortcut">Delete</span>
        </li>
      </template>
      <template v-if="haveSelectBlocks">
        <li class="ab-context-menu-separator" />
        <li
          @click="emit('paste')"
          class="ab-context-menu-item"
        >
          Paste Selection
          <span class="ab-shortcut">Ctrl+V</span>
        </li>
      </template>
      <li class="ab-context-menu-separator" />
      <li
        @click="emit('border-generator')"
        class="ab-context-menu-item"
      >
        Add Border...
      </li>
      <li
        @click="emit('crop-to-content')"
        class="ab-context-menu-item"
      >
        Crop to Content
      </li>
      <template v-if="hasSelection">
        <li class="ab-context-menu-separator" />
        <li
          @click="emit('align-selection', 'center')"
          class="ab-context-menu-item"
        >
          Align Center
        </li>
        <li
          @click="emit('align-selection', 'left')"
          class="ab-context-menu-item"
        >
          Align Left
        </li>
        <li
          @click="emit('align-selection', 'right')"
          class="ab-context-menu-item"
        >
          Align Right
        </li>
      </template>
    </ul>
  </context-menu>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ContextMenu from './ContextMenu.vue';

defineOptions({ name: 'EditorContextMenu' });

defineProps<{
  hasSelection: boolean;
  haveSelectBlocks: boolean;
}>();

const emit = defineEmits<{
  'save-png': [];
  'export-mirc': [target: 'clipboard' | 'file'];
  'export-plain-text': [];
  'export-html': [];
  'transform-selection': [type: string];
  'replace-color': [];
  'copy-selection': [];
  'cut-selection': [];
  'delete-selection': [];
  'paste': [];
  'border-generator': [];
  'crop-to-content': [];
  'align-selection': [alignment: 'center' | 'left' | 'right'];
}>();

const menuRef = ref<InstanceType<typeof ContextMenu> | null>(null);

function open(evt: { clientX: number; clientY: number }) {
  menuRef.value?.open(evt);
}

defineExpose({ open });
</script>
