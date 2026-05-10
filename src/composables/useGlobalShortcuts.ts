import { watch, onUnmounted } from 'vue';
import hotkeys from 'hotkeys-js';
import { useAsciiBirdStore } from '../store';

/**
 * Global keyboard shortcuts composable.
 *
 * Registers menu shortcuts in scope 'all' (always active regardless of
 * current scope) and tool shortcuts in scope 'editor' (only when editor
 * is active). Replaces dangerous `deleteScope('all')` calls with proper
 * scope transitions.
 *
 * Scope hierarchy:
 * - 'all' — menu shortcuts (Ctrl+Z, Ctrl+Y, Ctrl+M, etc.)
 * - 'editor' — tool shortcuts (B, E, F, S, T, G) + KeyboardShortcuts.vue
 * - 'modals' — active when modal/dialog is open (no editor shortcuts)
 */
export function useGlobalShortcuts() {
  const store = useAsciiBirdStore();

  // ─── Menu shortcuts (scope 'all' — always active) ──────────────
  const menuShortcuts: Record<string, () => void> = {
    'ctrl+m': () => store.openModal('new-ascii'),
    'ctrl+shift+o': () => {
      // Import from file — handled by Dashboard via custom event
      window.dispatchEvent(new CustomEvent('asciibird:import-file'));
    },
    'ctrl+shift+v': () => store.openModal('paste-ascii'),
    'ctrl+e': () => {
      if (store.asciibirdMeta.length) {
        store.openModal('edit-ascii');
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
    'ctrl+o': () => store.openModal('options'),
    'alt+g': () => {
      if (store.asciibirdMeta.length) {
        store.toggleGridView(!store.toolbarState.gridView);
      }
    },
    'f1': () => store.openModal('help'),
    'shift+f1': () => store.openModal('about'),
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
    'b': () => store.changeTool(4),  // brush
    'e': () => store.changeTool(6),  // eraser
    'f': () => store.changeTool(3),  // fill
    's': () => store.changeTool(1),  // select
    't': () => store.changeTool(2),  // text
    'g': () => {
      if (store.asciibirdMeta.length) {
        store.toggleGridView(!store.toolbarState.gridView);
      }
    },
  };

  for (const [key, handler] of Object.entries(toolShortcuts)) {
    hotkeys(key, 'editor', (event) => {
      // Suppress when char picker is active (let KeyboardShortcuts.vue
      // handle single-character input)
      if (store.toolbarState.isChoosingChar) return;
      if (!store.currentAscii) return;
      event.preventDefault();
      handler();
    });
  }

  // ─── Scope management ──────────────────────────────────────────
  // Replace dangerous deleteScope('all') with setScope transitions.
  // Use immediate:true to set initial scope on mount.
  watch(
    () => store.isModalOpen || store.isKeyboardDisabled,
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
  });
}
