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
 * - 'editor' — tool shortcuts (B, E, F, S, T, G, Q) + KeyboardShortcuts.vue
 * - 'modals' — active when modal/dialog is open (no editor shortcuts)
 */
export function useGlobalShortcuts() {
  const store = useAsciiBirdStore();
  const toolbarStore = useToolbarStore();
  const modalStore = useModalStore();

  // Suppress hotkeys when typing in inputs/textareas (e.g. inline rename).
  // hotkeys.filter is assignable at runtime but typed as method-only.
  (hotkeys as unknown as { filter: (event: KeyboardEvent) => boolean }).filter =
    function (event) {
      const target = event.target as HTMLElement;
      const tagName = target.tagName;
      if (tagName === 'INPUT' || tagName === 'TEXTAREA') return false;
      return true;
    };

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
    'ctrl+f': () => {
      if (store.asciibirdMeta.length) {
        modalStore.openModal('find-replace');
      }
    },
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

    // Zoom in/out/reset (ctrl+plus covers numpad +; ctrl+= covers main keyboard)
    'ctrl+=': () => {
      store.setBlockMultiplier(store.blockSizeMultiplier + 0.25);
    },
    'ctrl+plus': () => {
      store.setBlockMultiplier(store.blockSizeMultiplier + 0.25);
    },
    'ctrl+-': () => {
      store.setBlockMultiplier(store.blockSizeMultiplier - 0.25);
    },
    'ctrl+0': () => {
      store.setBlockMultiplier(1);
    },

    // Selection transforms (only when select tool active + selection exists)
    'ctrl+shift+.': () => {
      if (!modalStore.isModalOpen) {
        window.dispatchEvent(
          new CustomEvent('asciibird:selection-transform', { detail: 'rotate-cw' }),
        );
      }
    },
    'ctrl+shift+,'  : () => {
      if (!modalStore.isModalOpen) {
        window.dispatchEvent(
          new CustomEvent('asciibird:selection-transform', { detail: 'rotate-ccw' }),
        );
      }
    },
    'ctrl+shift+h': () => {
      if (!modalStore.isModalOpen) {
        window.dispatchEvent(
          new CustomEvent('asciibird:selection-transform', { detail: 'flip-h' }),
        );
      }
    },
    'ctrl+shift+x': () => {
      if (!modalStore.isModalOpen) {
        window.dispatchEvent(
          new CustomEvent('asciibird:selection-transform', { detail: 'flip-v' }),
        );
      }
    },

    // Layer operations
    'ctrl+shift+m': () => {
      if (!store.asciibirdMeta.length || modalStore.isModalOpen) return;
      store.mergeLayerDown();
    },
    'ctrl+shift+d': () => {
      if (!store.asciibirdMeta.length || modalStore.isModalOpen) return;
      store.duplicateLayer();
    },

    // Shape type cycling (when shapes tool is active)
    'shift+s': () => {
      const toolName = toolbarIcons[toolbarStore.currentTool]?.name;
      if (toolName === 'shapes' && !modalStore.isModalOpen) {
        toolbarStore.cycleShapeType();
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
  // Single-key tool switching — only when no char picker active.
  // E and Q are context-sensitive: when brush/eraser is active they
  // trigger rotate/flip instead of tool switching.
  const toolShortcuts: Record<string, () => void> = {
    'b': () => toolbarStore.changeTool(4),  // brush
    'e': () => {
      // When brush or eraser tool is active, E rotates the brush
      const toolName = toolbarIcons[toolbarStore.currentTool]?.name;
      if (toolName === 'brush' || toolName === 'eraser') {
        toolbarStore.transformBrush({ type: 'flip-h' });
      } else {
        toolbarStore.changeTool(6); // eraser
      }
    },
    'q': () => {
      // When brush or eraser tool is active, Q flips the brush
      const toolName = toolbarIcons[toolbarStore.currentTool]?.name;
      if (toolName === 'brush' || toolName === 'eraser') {
        toolbarStore.transformBrush({ type: 'flip-v' });
      }
    },
    'f': () => toolbarStore.changeTool(3),  // fill
    's': () => toolbarStore.changeTool(1),  // select
    't': () => toolbarStore.changeTool(2),  // text
    'g': () => {
      if (store.asciibirdMeta.length) {
        toolbarStore.toggleGridView(!toolbarStore.toolbarState.gridView);
      }
    },
    'r': () => toolbarStore.changeTool(8), // replace-color
    'l': () => toolbarStore.changeTool(10), // shapes
  };

  for (const [key, handler] of Object.entries(toolShortcuts)) {
    hotkeys(key, 'editor', (event) => {
      // Suppress when char picker is active (let KeyboardShortcuts.vue
      // handle single-character input)
      if (toolbarStore.toolbarState.isChoosingChar) return;
      if (!store.currentAscii) return;
      // Suppress when text tool is active — single-key shortcuts (b, e,
      // f, s, t, g, q) would interfere with typing characters onto the
      // canvas. The wildcard handler in Editor.vue routes keypresses
      // to canvasKeyDown() for character input instead.
      const currentToolName = toolbarIcons[toolbarStore.currentTool]?.name;
      if (currentToolName === 'text') return;
      event.preventDefault();
      handler();
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
  });
}
