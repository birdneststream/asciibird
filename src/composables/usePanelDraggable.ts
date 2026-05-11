import { useDraggable, useEventListener } from '@vueuse/core';
import { toValue } from 'vue';
import type { MaybeRefOrGetter } from 'vue';
import type { UseDraggableOptions, UseDraggableReturn } from '@vueuse/core';

/**
 * Wrapper around @vueuse/core's useDraggable with safety nets to prevent
 * drag state from getting stuck.
 *
 * @vueuse/core 14.x already defaults `buttons: [0]`, which filters out
 * right-clicks. However, a left-click drag can still get stuck if the
 * `pointerup` event is lost (e.g. browser context menu, alt-tab, dev-tools).
 * This wrapper dispatches a synthetic `pointerup` on safety-net events
 * (`pointercancel`, `window.blur`, `visibilitychange`) to force-end any
 * active drag.
 */
export function usePanelDraggable(
  el: MaybeRefOrGetter<HTMLElement | SVGElement | null | undefined>,
  options: UseDraggableOptions = {},
): UseDraggableReturn {
  const draggable = useDraggable(el, {
    ...options,
    buttons: options.buttons ?? [0],
  });

  /**
   * Force-end a stuck drag by dispatching a synthetic pointerup event.
   * useDraggable listens for pointerup on window; a bubbling pointerup
   * from the element will reach that listener and reset pressedDelta.
   *
   * This depends on @vueuse/core's internal event wiring. If a future
   * version changes listener targets, the safety net may need updating.
   */
  function forceEndDrag() {
    const element = toValue(el);
    if (element && draggable.isDragging.value) {
      // Use generic Event constructor — PointerEvent may not exist in jsdom
      element.dispatchEvent(new Event('pointerup', { bubbles: true }));
    }
  }

  // Safety net: browser cancels the pointer stream
  useEventListener(window, 'pointercancel', forceEndDrag, { passive: true });

  // Safety net: window loses focus during drag
  useEventListener(window, 'blur', forceEndDrag, { passive: true });

  // Safety net: tab visibility changes during drag (hidden or visible)
  useEventListener(document, 'visibilitychange', () => {
    forceEndDrag();
  });

  return draggable;
}
