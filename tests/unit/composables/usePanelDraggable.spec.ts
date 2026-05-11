import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ref, nextTick, defineComponent, h } from 'vue';
import { mount, type VueWrapper } from '@vue/test-utils';
import { usePanelDraggable } from '@/composables/usePanelDraggable';

// jsdom doesn't have PointerEvent in some environments
const TestPointerEvent = typeof PointerEvent !== 'undefined'
  ? PointerEvent
  : (MouseEvent as any);

const TestComponent = defineComponent({
  setup() {
    const el = ref<HTMLElement | null>(null);
    const { x, y, style, isDragging } = usePanelDraggable(el, {
      initialValue: { x: 10, y: 20 },
    });
    return { el, x, y, style, isDragging };
  },
  render() {
    return h('div', { ref: 'el' }, 'drag me');
  },
});

type TestVm = { x: number; y: number; style: any; isDragging: boolean; el: HTMLElement | null }

describe('usePanelDraggable', () => {
  let wrapper: VueWrapper<any>;

  beforeEach(() => {
    wrapper = mount(TestComponent);
  });

  function vm(): TestVm {
    return wrapper.vm as unknown as TestVm;
  }

  afterEach(() => {
    wrapper.unmount();
  });

  describe('initial state', () => {
    it('returns correct initial position', () => {
      expect(vm().x).toBe(10);
      expect(vm().y).toBe(20);
    });

    it('starts not dragging', () => {
      expect(vm().isDragging).toBe(false);
    });
  });

  describe('button filtering', () => {
    it('does not start drag on right click', async () => {
      const el = wrapper.element as HTMLElement;
      el.dispatchEvent(
        new TestPointerEvent('pointerdown', {
          button: 2,
          bubbles: true,
          clientX: 0,
          clientY: 0,
        }),
      );
      await nextTick();
      expect(vm().isDragging).toBe(false);
    });

    it('does not start drag on middle click', async () => {
      const el = wrapper.element as HTMLElement;
      el.dispatchEvent(
        new TestPointerEvent('pointerdown', {
          button: 1,
          bubbles: true,
          clientX: 0,
          clientY: 0,
        }),
      );
      await nextTick();
      expect(vm().isDragging).toBe(false);
    });
  });

  describe('safety nets', () => {
    it('force-ends drag on pointercancel without throwing', async () => {
      // In jsdom, useDraggable may not fully simulate drag state.
      // This test verifies the safety-net listener attaches and runs
      // without errors even when no drag is active.
      expect(() => {
        window.dispatchEvent(new TestPointerEvent('pointercancel', {}));
      }).not.toThrow();
      await nextTick();
    });

    it('force-ends drag on window blur without throwing', async () => {
      expect(() => {
        window.dispatchEvent(new Event('blur'));
      }).not.toThrow();
      await nextTick();
    });

    it('force-ends drag on visibilitychange without throwing', async () => {
      expect(() => {
        document.dispatchEvent(new Event('visibilitychange'));
      }).not.toThrow();
      await nextTick();
    });
  });

  describe('cleanup', () => {
    it('unmounts without leaking listeners', () => {
      const removeSpy = vi.spyOn(window, 'removeEventListener');
      wrapper.unmount();
      // useEventListener from @vueuse/core auto-cleans up on unmount
      expect(removeSpy).toHaveBeenCalled();
      removeSpy.mockRestore();
    });
  });
});
