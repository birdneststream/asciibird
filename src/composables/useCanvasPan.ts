// Canvas Pan composable — middle-click drag panning for the editor.
//
// Extracted from Editor.vue. Handles middle-mouse-button panning
// that scrolls the canvas container. The composable provides:
// - startPan: mousedown.middle handler
// - onCanvasMouseMove: dispatcher that delegates to pan or the tool
//   mousemove handler
// - panCursorStyle: CSS cursor override while panning

import { ref, computed, type Ref } from 'vue';

export interface UseCanvasPanOptions {
  /** Ref to the scrollable container element */
  scrollContainerRef: Ref<HTMLElement | null>;
  /** The tool canvas mousemove handler to delegate to when not panning */
  canvasMouseMove: (e: MouseEvent) => void;
}

export interface UseCanvasPanReturn {
  /** Start panning — bind to @mousedown.middle */
  startPan: (e: MouseEvent) => void;
  /** Mouse move dispatcher — bind to @mousemove on canvas */
  onCanvasMouseMove: (e: MouseEvent) => void;
  /** CSS style string for cursor while panning */
  panCursorStyle: Ref<string>;
}

export function useCanvasPan(
  opts: UseCanvasPanOptions,
): UseCanvasPanReturn {
  const { scrollContainerRef, canvasMouseMove } = opts;

  const isPanning = ref(false);
  const panLastX = ref(0);
  const panLastY = ref(0);

  const panCursorStyle = computed(() =>
    isPanning.value ? 'cursor: grabbing;' : '',
  );

  function startPan(e: MouseEvent) {
    isPanning.value = true;
    panLastX.value = e.clientX;
    panLastY.value = e.clientY;
    // Listen for mouseup at document level so pan ends even
    // if the mouse is released outside the canvas element.
    const onMouseUp = () => {
      isPanning.value = false;
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mouseup', onMouseUp);
  }

  function doPan(e: MouseEvent) {
    if (!isPanning.value) return;
    const dx = panLastX.value - e.clientX;
    const dy = panLastY.value - e.clientY;
    panLastX.value = e.clientX;
    panLastY.value = e.clientY;
    const el = scrollContainerRef.value;
    if (el) {
      el.scrollBy(dx, dy);
    }
  }

  /** Canvas mousemove dispatcher: delegates to pan or tool handler */
  function onCanvasMouseMove(e: MouseEvent) {
    if (isPanning.value) {
      doPan(e);
      return;
    }
    canvasMouseMove(e);
  }

  return {
    startPan,
    onCanvasMouseMove,
    panCursorStyle,
  };
}
