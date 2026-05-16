import { watch, toValue } from 'vue';
import { useDraggable, useEventListener } from '@vueuse/core';
import type { MaybeRefOrGetter } from 'vue';
import type { UseDraggableOptions, UseDraggableReturn } from '@vueuse/core';
import { snapToGrid } from '../utils/geometry';

/**
 * Wrapper around @vueuse/core's useDraggable with safety nets to prevent
 * drag state from getting stuck and to exclude interactive form elements.
 *
 * Supports a `handle` option to restrict drag initiation to a specific
 * element (e.g. the PanelHeader). This prevents interactive elements
 * like <select>, <input>, and <textarea> inside the panel from
 * accidentally triggering a drag.
 *
 * Additionally intercepts `pointerdown` on the target element and cancels
 * the drag if the event originated from a form control (<select>,
 * <input>, <textarea>, or <button>). This prevents native dropdown
 * interactions from leaving the panel in a dragging state.
 *
 * @vueuse/core 14.x already defaults `buttons: [0]`, which filters out
 * right-clicks. However, a left-click drag can still get stuck if the
 * `pointerup` event is lost (e.g. browser context menu, alt-tab, dev-tools).
 * This wrapper dispatches a synthetic `pointerup` on safety-net events
 * (`pointercancel`, `window.blur`, `visibilitychange`) to force-end any
 * active drag.
 */

/** CSS selector for interactive form elements that should NOT start a drag. */
const FORM_ELEMENT_SELECTOR = 'select, input, textarea, button';

function isFormElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.matches(FORM_ELEMENT_SELECTOR);
}

export interface UsePanelDraggableOptions extends UseDraggableOptions {
  /** Called when the panel receives a pointerdown (for z-index stacking) */
  onBringToFront?: () => void;
  /** Grid snap size for X axis (px). Omit or 0 to disable snap. */
  snapX?: MaybeRefOrGetter<number>;
  /** Grid snap size for Y axis (px). Omit or 0 to disable snap. */
  snapY?: MaybeRefOrGetter<number>;
}

export function usePanelDraggable(
  el: MaybeRefOrGetter<HTMLElement | SVGElement | null | undefined>,
  options: UsePanelDraggableOptions = {},
): UseDraggableReturn {
  const { onBringToFront, snapX, snapY, ...draggableOptions } = options;
  const draggable = useDraggable(el, {
    ...draggableOptions,
    buttons: draggableOptions.buttons ?? [0],
  });

  // Snap position to grid during drag when snapX/snapY are provided.
  // Uses flush: 'sync' so the snapped value is applied before the
  // browser paints — no visible jitter.
  if (snapX !== undefined || snapY !== undefined) {
    watch(
      [draggable.x, draggable.y],
      () => {
        const sx = toValue(snapX) || 1;
        const sy = toValue(snapY) || 1;
        draggable.x.value = snapToGrid(draggable.x.value, sx);
        draggable.y.value = snapToGrid(draggable.y.value, sy);
      },
      { flush: 'sync' },
    );
  }

  // Toggle is-dragging class for glow effect on background grid
  watch(draggable.isDragging, (dragging) => {
    const element = toValue(el);
    if (element instanceof HTMLElement) {
      element.classList.toggle('is-dragging', dragging);
    }
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

  // Safety net: pointerdown on a form element inside the panel target should
  // NOT start a drag. Even with the `handle` option restricting drag to the
  // panel header, native <select> dropdown interactions can leave the panel
  // in a stuck dragging state. Intercept in capture phase and stop immediate
  // propagation so VueUse's useDraggable never sees the event.
  useEventListener(
    el,
    'pointerdown',
    (e: PointerEvent) => {
      if (isFormElement(e.target as EventTarget | null)) {
        e.stopImmediatePropagation();
      }
      // Bring panel to front on any pointerdown (click, drag start)
      onBringToFront?.();
    },
    { capture: true },
  );

  return draggable;
}
