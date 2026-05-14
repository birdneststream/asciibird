import { ref, nextTick, type Ref } from 'vue';

/**
 * Composable for inline rename functionality.
 *
 * Shared between layer rename (Layers.vue) and tab rename (Dashboard.vue).
 * Provides reactive state and handlers for double-click → input → save/cancel.
 *
 * @param onSave - callback invoked with (key, newName) when user commits
 * @param onCancel - optional callback when user cancels editing
 */
export function useInlineRename<T extends number>(
  onSave: (key: T, newName: string) => void,
  onCancel?: () => void,
) {
  const editingKey: Ref<T | null> = ref(null);
  const editingName = ref('');

  /** Start editing — sets the key and name, then focuses the input */
  function startEdit(key: T, currentName: string) {
    editingKey.value = key;
    editingName.value = currentName;
    nextTick(() => {
      const input = document.querySelector(
        '[data-inline-rename-input]',
      ) as HTMLInputElement | null;
      if (input) {
        input.focus();
        input.select();
      }
    });
  }

  /** Commit the rename if name is non-empty */
  function commitEdit() {
    if (editingKey.value === null) return;
    const trimmed = editingName.value.trim();
    if (trimmed.length > 0) {
      onSave(editingKey.value, trimmed);
    }
    cancelEdit();
  }

  /** Cancel editing — revert without saving */
  function cancelEdit() {
    editingKey.value = null;
    editingName.value = '';
    onCancel?.();
  }

  /** Check if a specific key is currently being edited */
  function isEditing(key: T): boolean {
    return editingKey.value === key;
  }

  /** Force-cancel editing (e.g. when layer count changes) */
  function forceCancel() {
    editingKey.value = null;
    editingName.value = '';
  }

  return {
    editingKey,
    editingName,
    startEdit,
    commitEdit,
    cancelEdit,
    isEditing,
    forceCancel,
  };
}
