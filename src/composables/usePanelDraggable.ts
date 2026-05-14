import { useDraggable, useEventListener } from '@vueuse/core';
import type { MaybeRefOrGetter } from 'vue';
import type { UseDraggableOptions, UseDraggableReturn } from '@vueuse/core';

/**
 * Wrapper around @vueuse/core's useDraggable with safety nets to prevent
 * drag state from getting stuck.
 *
 * Supports a `handle` option to restrict drag initiation to a specific
 * element (e.g. the PanelHeader). This prevents interactive elements
 * like <select>, <input>, and <textarea> inside the panel from
 * accidentally triggering a drag.
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
   *
   * VueUse's useDraggable attaches a capture-phase `pointerup` listener on
   * `window` (or `draggingElement`). We dispatch directly on `window` to
   * ensure the synthetic event reaches that listener and resets
   * `pressedDelta`, which drives `isDragging`.
   *
   * Uses `PointerEvent` when available (real browsers) and falls back to
   * generic `Event` for jsdom test environments.
   */
  function forceEndDrag() {
    if (!draggable.isDragging.value) return;

    const hasPointerEvent = typeof PointerEvent !== 'undefined';
    const EventConstructor = hasPointerEvent ? PointerEvent : Event;

    window.dispatchEvent(
      new EventConstructor('pointerup', {
        bubbles: true,
        ...(hasPointerEvent
          ? { button: 0, buttons: 0, pointerId: 1, pointerType: 'mouse' }
          : {}),
      } as EventInit),
    );
  }

  // Safety net: browser cancels the pointer stream
  useEventListener(window, 'pointercancel', forceEndDrag, { passive: true });

  // Safety net: window loses focus during drag
  useEventListener(window, 'blur', forceEndDrag, { passive: true });

  // Safety net: tab visibility changes during drag (hidden or visible)
  useEventListener(document, 'visibilitychange', () => {
    forceEndDrag();
  });

  // Safety net: right-click context menu during drag — pointerup does not fire.
  // Use capture phase so this always runs before consumer handlers can stop
  // propagation.
  useEventListener(window, 'contextmenu', forceEndDrag, { capture: true });

  return draggable;
}
