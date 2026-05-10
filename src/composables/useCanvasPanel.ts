// useCanvasPanel — composable for draggable + resizable canvas with snap-to-grid
// Replaces the legacy vue-draggable-resizable component (Vue 2 only)

import { ref, computed, toValue, type MaybeRefOrGetter } from 'vue';
import {
  snapToGrid,
  snapDimensionToGrid,
  type ResizeHandlePosition,
} from '../utils/geometry';

export interface UseCanvasPanelOptions {
  /** Grid snap size in pixels for X axis */
  snapX: MaybeRefOrGetter<number>;
  /** Grid snap size in pixels for Y axis */
  snapY: MaybeRefOrGetter<number>;
  /** Whether dragging is disabled (e.g. when a drawing tool is active) */
  disabled?: MaybeRefOrGetter<boolean>;
  /** Initial X position in pixels */
  initialX?: number;
  /** Initial Y position in pixels */
  initialY?: number;
  /** Initial width in pixels */
  initialWidth?: number;
  /** Initial height in pixels */
  initialHeight?: number;
  /** Callback when drag ends with snapped position */
  onDragStop?: (_x: number, _y: number) => void;
  /** Callback during drag with snapped position */
  onDragMove?: (_x: number, _y: number) => void;
  /** Callback when resize ends with snapped dimensions */
  onResizeStop?: (
    _x: number,
    _y: number,
    _width: number,
    _height: number,
  ) => void;
}

export function useCanvasPanel(options: UseCanvasPanelOptions) {
  const {
    snapX,
    snapY,
    disabled,
    initialX = 0,
    initialY = 0,
    initialWidth = 512,
    initialHeight = 512,
    onDragStop,
    onDragMove,
    onResizeStop,
  } = options;

  // ─── Drag State ──────────────────────────────────────────────────
  const dragX = ref(initialX);
  const dragY = ref(initialY);

  const isDragging = ref(false);

  // ─── Resize State ────────────────────────────────────────────────
  const panelWidth = ref(initialWidth);
  const panelHeight = ref(initialHeight);
  const isResizing = ref(false);

  // Store resize start state
  let resizeStartX = 0;
  let resizeStartY = 0;
  let resizeStartWidth = 0;
  let resizeStartHeight = 0;
  let resizeHandle: ResizeHandlePosition | null = null;

  // ─── Snap Computed ───────────────────────────────────────────────
  const currentSnapX = computed(() => toValue(snapX));
  const currentSnapY = computed(() => toValue(snapY));

  // ─── Drag Implementation ─────────────────────────────────────────
  // We implement custom drag instead of useDraggable for snap control
  let dragStartClientX = 0;
  let dragStartClientY = 0;
  let dragStartPosX = 0;
  let dragStartPosY = 0;

  function onDragPointerDown(e: PointerEvent) {
    if (toValue(disabled)) return;
    if (e.button !== 0) return; // left button only

    e.preventDefault();
    e.stopPropagation();

    isDragging.value = true;
    dragStartClientX = e.clientX;
    dragStartClientY = e.clientY;
    dragStartPosX = dragX.value;
    dragStartPosY = dragY.value;

    document.addEventListener('pointermove', onDragPointerMove);
    document.addEventListener('pointerup', onDragPointerUp);
  }

  function onDragPointerMove(e: PointerEvent) {
    if (!isDragging.value) return;

    const dx = e.clientX - dragStartClientX;
    const dy = e.clientY - dragStartClientY;

    const rawX = dragStartPosX + dx;
    const rawY = dragStartPosY + dy;

    const snappedX = snapToGrid(rawX, currentSnapX.value);
    const snappedY = snapToGrid(rawY, currentSnapY.value);

    // Update position for live feedback
    dragX.value = snappedX;
    dragY.value = snappedY;

    onDragMove?.(snappedX, snappedY);
  }

  function onDragPointerUp() {
    if (!isDragging.value) return;

    isDragging.value = false;
    document.removeEventListener('pointermove', onDragPointerMove);
    document.removeEventListener('pointerup', onDragPointerUp);

    onDragStop?.(dragX.value, dragY.value);
  }

  // ─── Resize Implementation ───────────────────────────────────────
  function startResize(handle: ResizeHandlePosition) {
    return (e: PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();

      isResizing.value = true;
      resizeHandle = handle;
      resizeStartX = e.clientX;
      resizeStartY = e.clientY;
      resizeStartWidth = panelWidth.value;
      resizeStartHeight = panelHeight.value;

      document.addEventListener('pointermove', onResizePointerMove);
      document.addEventListener('pointerup', onResizePointerUp);
    };
  }

  function onResizePointerMove(e: PointerEvent) {
    if (!isResizing.value || !resizeHandle) return;

    const dx = e.clientX - resizeStartX;
    const dy = e.clientY - resizeStartY;

    let newWidth = resizeStartWidth;
    let newHeight = resizeStartHeight;

    // Handle-specific dimension changes
    switch (resizeHandle) {
      case 'br':
        newWidth = resizeStartWidth + dx;
        newHeight = resizeStartHeight + dy;
        break;
      case 'bm':
        newHeight = resizeStartHeight + dy;
        break;
      case 'mr':
        newWidth = resizeStartWidth + dx;
        break;
    }

    // Snap and clamp to minimum 1 block
    panelWidth.value = snapDimensionToGrid(newWidth, currentSnapX.value, 1);
    panelHeight.value = snapDimensionToGrid(newHeight, currentSnapY.value, 1);
  }

  function onResizePointerUp() {
    if (!isResizing.value) return;

    isResizing.value = false;
    resizeHandle = null;
    document.removeEventListener('pointermove', onResizePointerMove);
    document.removeEventListener('pointerup', onResizePointerUp);

    onResizeStop?.(dragX.value, dragY.value, panelWidth.value, panelHeight.value);
  }

  // ─── Computed Style ──────────────────────────────────────────────
  const style = computed(() => ({
    position: 'absolute' as const,
    left: `${dragX.value}px`,
    top: `${dragY.value}px`,
    width: `${panelWidth.value}px`,
    height: `${panelHeight.value}px`,
  }));

  // ─── Public API ──────────────────────────────────────────────────
  /**
   * Reset position (e.g. on tab switch)
   */
  function setPosition(newX: number, newY: number) {
    dragX.value = snapToGrid(newX, currentSnapX.value);
    dragY.value = snapToGrid(newY, currentSnapY.value);
  }

  /**
   * Update panel dimensions (e.g. when ASCII dimensions change externally)
   */
  function setDimensions(newWidth: number, newHeight: number) {
    panelWidth.value = newWidth;
    panelHeight.value = newHeight;
  }

  /**
   * Cleanup event listeners (call on component unmount)
   */
  function cleanup() {
    document.removeEventListener('pointermove', onDragPointerMove);
    document.removeEventListener('pointerup', onDragPointerUp);
    document.removeEventListener('pointermove', onResizePointerMove);
    document.removeEventListener('pointerup', onResizePointerUp);
    isDragging.value = false;
    isResizing.value = false;
  }

  return {
    // Position
    x: dragX,
    y: dragY,
    // Dimensions
    width: panelWidth,
    height: panelHeight,
    // State
    isDragging,
    isResizing,
    // Style
    style,
    // Drag handler (attach to the panel element via @pointerdown)
    onDragPointerDown,
    // Resize handler factory
    startResize,
    // Utility methods
    setPosition,
    setDimensions,
    cleanup,
  };
}
