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

// ─── Module-level helpers ───────────────────────────────────────

interface DragState {
  x: { value: number };
  y: { value: number };
  isDragging: { value: boolean };
  snapX: number;
  snapY: number;
  onDragMove?: (x: number, y: number) => void;
  onDragStop?: (x: number, y: number) => void;
}

function createDragHandlers(state: DragState) {
  let startClientX = 0;
  let startClientY = 0;
  let startPosX = 0;
  let startPosY = 0;

  function onPointerDown(e: PointerEvent, disabled: boolean) {
    // Middle button (1) always works regardless of disabled state,
    // enabling canvas drag in any tool mode via middle-click.
    if (e.button !== 0 && e.button !== 1) return;
    if (disabled && e.button !== 1) return;
    e.preventDefault();
    e.stopPropagation();

    state.isDragging.value = true;
    startClientX = e.clientX;
    startClientY = e.clientY;
    startPosX = state.x.value;
    startPosY = state.y.value;

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  }

  function onPointerMove(e: PointerEvent) {
    if (!state.isDragging.value) return;

    const dx = e.clientX - startClientX;
    const dy = e.clientY - startClientY;
    const snappedX = snapToGrid(startPosX + dx, state.snapX);
    const snappedY = snapToGrid(startPosY + dy, state.snapY);

    state.x.value = snappedX;
    state.y.value = snappedY;
    state.onDragMove?.(snappedX, snappedY);
  }

  function onPointerUp() {
    if (!state.isDragging.value) return;
    state.isDragging.value = false;
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);
    state.onDragStop?.(state.x.value, state.y.value);
  }

  return { onPointerDown, onPointerMove, onPointerUp };
}

interface ResizeState {
  x: { value: number };
  y: { value: number };
  width: { value: number };
  height: { value: number };
  isResizing: { value: boolean };
  snapX: number;
  snapY: number;
  onResizeStop?: (x: number, y: number, w: number, h: number) => void;
}

function createResizeHandlers(state: ResizeState) {
  let startX = 0;
  let startY = 0;
  let startWidth = 0;
  let startHeight = 0;
  let startPosX = 0;
  let startPosY = 0;
  let handle: ResizeHandlePosition | null = null;

  function startResize(h: ResizeHandlePosition) {
    return (e: PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();

      state.isResizing.value = true;
      handle = h;
      startX = e.clientX;
      startY = e.clientY;
      startWidth = state.width.value;
      startHeight = state.height.value;
      startPosX = state.x.value;
      startPosY = state.y.value;

      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', onPointerUp);
    };
  }

  function onPointerMove(e: PointerEvent) {
    if (!state.isResizing.value || !handle) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    let newWidth = startWidth;
    let newHeight = startHeight;
    let newX = startPosX;
    let newY = startPosY;

    if (handle === 'br' || handle === 'tr' || handle === 'mr') {
      newWidth = snapDimensionToGrid(startWidth + dx, state.snapX, 1);
    }
    if (handle === 'br' || handle === 'bl' || handle === 'bm') {
      newHeight = snapDimensionToGrid(startHeight + dy, state.snapY, 1);
    }
    if (handle === 'tl' || handle === 'ml' || handle === 'bl') {
      newWidth = snapDimensionToGrid(startWidth - dx, state.snapX, 1);
      newX = startPosX + startWidth - newWidth;
    }
    if (handle === 'tl' || handle === 'tm' || handle === 'tr') {
      newHeight = snapDimensionToGrid(startHeight - dy, state.snapY, 1);
      newY = startPosY + startHeight - newHeight;
    }

    state.width.value = newWidth;
    state.height.value = newHeight;
    state.x.value = newX;
    state.y.value = newY;
  }

  function onPointerUp() {
    if (!state.isResizing.value) return;
    state.isResizing.value = false;
    handle = null;
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);
    state.onResizeStop?.(
      state.x.value, state.y.value,
      state.width.value, state.height.value,
    );
  }

  return { startResize, onPointerMove, onPointerUp };
}

// ─── Composable ─────────────────────────────────────────────────

export function useCanvasPanel(options: UseCanvasPanelOptions) {
  const {
    snapX, snapY, disabled,
    initialX = 0, initialY = 0,
    initialWidth = 512, initialHeight = 512,
    onDragStop, onDragMove, onResizeStop,
  } = options;

  const dragX = ref(initialX);
  const dragY = ref(initialY);
  const isDragging = ref(false);
  const panelWidth = ref(initialWidth);
  const panelHeight = ref(initialHeight);
  const isResizing = ref(false);

  const currentSnapX = computed(() => toValue(snapX));
  const currentSnapY = computed(() => toValue(snapY));

  const drag = createDragHandlers({
    x: dragX, y: dragY, isDragging,
    get snapX() { return currentSnapX.value; },
    get snapY() { return currentSnapY.value; },
    onDragStop, onDragMove,
  });

  const resize = createResizeHandlers({
    x: dragX, y: dragY,
    width: panelWidth, height: panelHeight,
    isResizing,
    get snapX() { return currentSnapX.value; },
    get snapY() { return currentSnapY.value; },
    onResizeStop,
  });

  const style = computed(() => ({
    position: 'absolute' as const,
    left: `${dragX.value}px`,
    top: `${dragY.value}px`,
    width: `${panelWidth.value}px`,
    height: `${panelHeight.value}px`,
  }));

  function setPosition(newX: number, newY: number) {
    dragX.value = snapToGrid(newX, currentSnapX.value);
    dragY.value = snapToGrid(newY, currentSnapY.value);
  }

  function setDimensions(newWidth: number, newHeight: number) {
    panelWidth.value = newWidth;
    panelHeight.value = newHeight;
  }

  function cleanup() {
    document.removeEventListener('pointermove', drag.onPointerMove);
    document.removeEventListener('pointerup', drag.onPointerUp);
    document.removeEventListener('pointermove', resize.onPointerMove);
    document.removeEventListener('pointerup', resize.onPointerUp);
    isDragging.value = false;
    isResizing.value = false;
  }

  return {
    x: dragX, y: dragY,
    width: panelWidth, height: panelHeight,
    isDragging, isResizing,
    style,
    onDragPointerDown: (e: PointerEvent) =>
      drag.onPointerDown(e, toValue(disabled) ?? false),
    startResize: resize.startResize,
    setPosition, setDimensions, cleanup,
  };
}
