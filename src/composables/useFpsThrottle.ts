// FPS-throttled canvas redraw composable
// Shared by Editor.vue, BrushCanvas.vue, MainBrushCanvas.vue
import { ref, onUnmounted } from 'vue';

export interface FpsThrottleControls {
  /** Schedule a redraw, throttled by FPS. No-op if already pending. */
  scheduleRedraw: (force?: boolean) => void;
  /** Cancel any pending redraw timer/frame. */
  cancelRedraw: () => void;
  /** Whether the throttle is ready for a new redraw. */
  redrawReady: () => boolean;
}

/**
 * FPS-throttled redraw scheduler.
 *
 * Throttles canvas redraws to `fpsSource()` frames per second using
 * setTimeout + requestAnimationFrame. Automatically cleans up timers
 * on component unmount.
 *
 * @param drawFn - The drawing function to call (sync or async).
 * @param fpsSource - Returns the target FPS (typically store.options.fps).
 */
export function useFpsThrottle(
  drawFn: (force?: boolean) => void | Promise<void>,
  fpsSource: () => number,
): FpsThrottleControls {
  let pendingTimeout: ReturnType<typeof setTimeout> | null = null;
  let pendingFrame: number | null = null;
  const canRedraw = ref(true);

  function cancelRedraw() {
    if (pendingTimeout !== null) {
      clearTimeout(pendingTimeout);
      pendingTimeout = null;
    }
    if (pendingFrame !== null) {
      cancelAnimationFrame(pendingFrame);
      pendingFrame = null;
    }
  }

  function scheduleRedraw(force = false) {
    if (canRedraw.value) {
      canRedraw.value = false;

      // Cancel any previous pending redraw
      cancelRedraw();

      pendingTimeout = setTimeout(() => {
        pendingTimeout = null;
        pendingFrame = requestAnimationFrame(async () => {
          pendingFrame = null;
          try {
            await drawFn(force);
          } finally {
            canRedraw.value = true;
          }
        });
      }, 1000 / fpsSource());
    }
  }

  // Auto-cleanup on unmount
  onUnmounted(() => {
    cancelRedraw();
  });

  return {
    scheduleRedraw,
    cancelRedraw,
    redrawReady: () => canRedraw.value,
  };
}
