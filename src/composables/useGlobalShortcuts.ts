import { watch, onUnmounted } from 'vue';
import hotkeys from 'hotkeys-js';
import { toolbarIcons } from '../ascii';
import { useAsciiBirdStore } from '../store';
import { useToolbarStore } from '../store/toolbar';
import { useModalStore } from '../store/modal';

/**
 * Global keyboard shortcuts composable.
 *
 * Registers menu shortcuts in scope 'all' (always active regardless of
 * current scope) and tool shortcuts in scope 'editor' (only when editor
 * is active). Replaces dangerous `deleteScope('all')` calls with proper
 * scope transitions.
 *
 * Scope hierarchy:
 * - 'all' — menu shortcuts (Ctrl+Z, Ctrl+Y, Ctrl+Shift+Z, Cmd+Z, etc.)
 * - 'editor' — tool shortcuts (B, E, F, S, T, G) + KeyboardShortcuts.vue
 * - 'modals' — active when modal/dialog is open (no editor shortcuts)
 */
export function useGlobalShortcuts() {
  const store = useAsciiBirdStore();
  const toolbarStore = useToolbarStore();
  const modalStore = useModalStore();

  // ─── Menu shortcuts (scope 'all' — always active) ──────────────
  const menuShortcuts: Record<string, () => void> = {
    'ctrl+m': () => modalStore.openModal('new-ascii'),
    'ctrl+shift+o': () => {
      // Import from file — handled by Dashboard via custom event
      window.dispatchEvent(new CustomEvent('asciibird:import-file'));
    },
    'ctrl+shift+v': () => modalStore.openModal('paste-ascii'),
    'ctrl+e': () => {
      if (store.asciibirdMeta.length) {
        modalStore.openModal('edit-ascii');
      }
    },
    'ctrl+z': () => {
      if (store.asciibirdMeta.length) {
        store.undoBlocks();
      }
    },
    'ctrl+y': () => {
      if (store.asciibirdMeta.length) {
        store.redoBlocks();
      }
    },
    'ctrl+shift+z': () => {
      if (store.asciibirdMeta.length) {
        store.redoBlocks();
      }
    },
    'cmd+z': () => {
      if (store.asciibirdMeta.length) {
        store.undoBlocks();
      }
    },
    'cmd+shift+z': () => {
      if (store.asciibirdMeta.length) {
        store.redoBlocks();
      }
    },
    'cmd+y': () => {
      if (store.asciibirdMeta.length) {
        store.redoBlocks();
      }
    },
    'ctrl+o': () => modalStore.openModal('options'),
    'alt+g': () => {
      if (store.asciibirdMeta.length) {
        toolbarStore.toggleGridView(!toolbarStore.toolbarState.gridView);
      }
    },
    'f1': () => modalStore.openModal('help'),
    'shift+f1': () => modalStore.openModal('about'),

    // Copy selected blocks to clipboard — handled by Dashboard
    'ctrl+c': () => {
      if (store.asciibirdMeta.length && !modalStore.isModalOpen) {
        window.dispatchEvent(new CustomEvent('asciibird:copy-blocks'));
      }
    },

    // Paste copied blocks as brush
    'ctrl+v': () => {
      if (!store.asciibirdMeta.length || modalStore.isModalOpen) return;
      const copied = toolbarStore.selectBlocks;
      if (copied.length > 0) {
        toolbarStore.setBrushBlocks(copied);
        toolbarStore.changeTool(4); // brush tool
      }
    },
  };

  // Register all menu shortcuts in scope 'all'
  for (const [key, handler] of Object.entries(menuShortcuts)) {
    hotkeys(key, 'all', (event) => {
      event.preventDefault();
      handler();
    });
  }

  // ─── Tool shortcuts (scope 'editor') ───────────────────────────
  // Single-key tool switching — only when no char picker active
  const toolShortcuts: Record<string, () => void> = {
    'b': () => toolbarStore.changeTool(4),  // brush
    'e': () => toolbarStore.changeTool(6),  // eraser
    'f': () => toolbarStore.changeTool(3),  // fill
    's': () => toolbarStore.changeTool(1),  // select
    't': () => toolbarStore.changeTool(2),  // text
    'g': () => {
      if (store.asciibirdMeta.length) {
        toolbarStore.toggleGridView(!toolbarStore.toolbarState.gridView);
      }
    },
  };

  for (const [key, handler] of Object.entries(toolShortcuts)) {
    hotkeys(key, 'editor', (event) => {
      // Suppress when char picker is active (let KeyboardShortcuts.vue
      // handle single-character input)
      if (toolbarStore.toolbarState.isChoosingChar) return;
      if (!store.currentAscii) return;
      event.preventDefault();
      handler();
    });
  }

  // ─── Brush shortcuts (scope 'editor') ──────────────────────────
  // Shift+E: horizontal flip brush, Shift+Q: vertical rotate brush
  // Only active when brush or eraser tool is selected
  const brushShortcuts: Record<string, string> = {
    'shift+e': 'flip',
    'shift+q': 'rotate',
  };

  for (const [key, action] of Object.entries(brushShortcuts)) {
    hotkeys(key, 'editor', (event) => {
      if (!store.currentAscii) return;
      const tool = toolbarIcons[toolbarStore.currentTool];
      if (tool?.name !== 'brush' && tool?.name !== 'eraser') return;
      event.preventDefault();
      toolbarStore.flipRotateBlocks({ type: action });
    });
  }

  // ─── Scope management ──────────────────────────────────────────
  // Replace dangerous deleteScope('all') with setScope transitions.
  // Use immediate:true to set initial scope on mount.
  watch(
    () => modalStore.isModalOpen || modalStore.isKeyboardDisabled,
    (disabled) => {
      if (disabled) {
        hotkeys.setScope('modals');
      } else {
        hotkeys.setScope('editor');
      }
    },
    { immediate: true },
  );

  // ─── Cleanup ───────────────────────────────────────────────────
  onUnmounted(() => {
    // Unbind all menu shortcuts
    for (const key of Object.keys(menuShortcuts)) {
      hotkeys.unbind(key, 'all');
    }
    // Unbind all tool shortcuts
    for (const key of Object.keys(toolShortcuts)) {
      hotkeys.unbind(key, 'editor');
    }
    // Unbind all brush shortcuts
    for (const key of Object.keys(brushShortcuts)) {
      hotkeys.unbind(key, 'editor');
    }
  });
}
