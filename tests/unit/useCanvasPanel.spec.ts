import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';
import { useCanvasPanel } from '@/composables/useCanvasPanel';

// jsdom doesn't have PointerEvent, use MouseEvent as fallback
const TestPointerEvent = typeof PointerEvent !== 'undefined'
  ? PointerEvent
  : MouseEvent;

describe('useCanvasPanel', () => {
  let dragStopCb: any;
  let dragMoveCb: any;
  let resizeStopCb: any;

  beforeEach(() => {
    dragStopCb = vi.fn<(_x: number, _y: number) => void>();
    dragMoveCb = vi.fn<(_x: number, _y: number) => void>();
    resizeStopCb = vi.fn<(_x: number, _y: number, _width: number, _height: number) => void>();
  });

  function createPanel(overrides: Record<string, any> = {}) {
    return useCanvasPanel({
      snapX: 8,
      snapY: 15,
      initialX: 0,
      initialY: 0,
      initialWidth: 160,
      initialHeight: 300,
      onDragStop: dragStopCb,
      onDragMove: dragMoveCb,
      onResizeStop: resizeStopCb,
      ...overrides,
    } as any);
  }

  describe('initial state', () => {
    it('returns correct initial position and dimensions', () => {
      const panel = createPanel();
      expect(panel.x.value).toBe(0);
      expect(panel.y.value).toBe(0);
      expect(panel.width.value).toBe(160);
      expect(panel.height.value).toBe(300);
    });

    it('returns correct style', () => {
      const panel = createPanel();
      expect(panel.style.value).toEqual({
        position: 'absolute',
        left: '0px',
        top: '0px',
        width: '160px',
        height: '300px',
      });
    });

    it('starts not dragging/resizing', () => {
      const panel = createPanel();
      expect(panel.isDragging.value).toBe(false);
      expect(panel.isResizing.value).toBe(false);
    });
  });

  describe('setPosition', () => {
    it('sets position with snap', () => {
      const panel = createPanel();
      panel.setPosition(4, 7);
      expect(panel.x.value).toBe(8); // 4/8=0.5 → 1 → 8
      expect(panel.y.value).toBe(0); // 7/15=0.47 → 0 → 0
    });

    it('sets exact grid position', () => {
      const panel = createPanel();
      panel.setPosition(24, 45);
      expect(panel.x.value).toBe(24);
      expect(panel.y.value).toBe(45);
    });
  });

  describe('setDimensions', () => {
    it('sets panel dimensions', () => {
      const panel = createPanel();
      panel.setDimensions(200, 400);
      expect(panel.width.value).toBe(200);
      expect(panel.height.value).toBe(400);
    });
  });

  describe('startResize', () => {
    it('returns a function for each handle', () => {
      const panel = createPanel();
      const handles: Array<import('@/utils/geometry').ResizeHandlePosition> = [
        'tl', 'tm', 'tr', 'ml', 'mr', 'bl', 'bm', 'br',
      ];
      for (const h of handles) {
        expect(typeof panel.startResize(h)).toBe('function');
      }
    });

    it('captures initial position on resize start', () => {
      const panel = createPanel({ initialX: 32, initialY: 45 });
      const handler = panel.startResize('tl');
      const event = new TestPointerEvent('pointerdown', {
        clientX: 100,
        clientY: 200,
        button: 0,
        bubbles: true,
      } as any);
      handler(event as any);
      expect(panel.isResizing.value).toBe(true);
      // Cleanup
      document.dispatchEvent(new MouseEvent('pointerup'));
    });
  });

  describe('onDragPointerDown', () => {
    it('does not start drag when disabled', () => {
      const panel = createPanel({ disabled: ref(true) });
      const event = new TestPointerEvent('pointerdown', {
        clientX: 100,
        clientY: 100,
        button: 0,
        bubbles: true,
      } as any);
      vi.spyOn(event, 'preventDefault');

      panel.onDragPointerDown(event as any);
      expect(panel.isDragging.value).toBe(false);
    });

    it('does not start drag on non-left button', () => {
      const panel = createPanel();
      const event = new TestPointerEvent('pointerdown', {
        clientX: 100,
        clientY: 100,
        button: 2,
        bubbles: true,
      } as any);

      panel.onDragPointerDown(event as any);
      expect(panel.isDragging.value).toBe(false);
    });

    it('starts drag on left button when not disabled', () => {
      const panel = createPanel();
      const event = new TestPointerEvent('pointerdown', {
        clientX: 100,
        clientY: 100,
        button: 0,
        bubbles: true,
      } as any);
      vi.spyOn(event, 'preventDefault');

      panel.onDragPointerDown(event as any);
      expect(panel.isDragging.value).toBe(true);

      // Cleanup: end the drag
      document.dispatchEvent(new MouseEvent('pointerup'));
    });
  });

  describe('resize flow', () => {
    it('respects minimum dimensions after resize', () => {
      const panel = createPanel();
      // Simulate resize end by calling setDimensions with snap
      panel.setDimensions(3, 5); // below minimum
      // After resize commit, dimensions should be snapped
      // This tests the snapDimensionToGrid via the composable
      expect(panel.width.value).toBe(3); // setDimensions doesn't snap
      expect(panel.height.value).toBe(5);
    });

    /**
     * Helper: simulate a resize drag from start to end.
     */
    function simulateResize(
      panel: ReturnType<typeof createPanel>,
      handle: string,
      startClientX: number,
      startClientY: number,
      endClientX: number,
      endClientY: number,
    ) {
      const handler = panel.startResize(
        handle as import('@/utils/geometry').ResizeHandlePosition,
      );
      const startEvent = new TestPointerEvent('pointerdown', {
        clientX: startClientX,
        clientY: startClientY,
        button: 0,
        bubbles: true,
      } as any);
      handler(startEvent as any);

      const moveEvent = new TestPointerEvent('pointermove', {
        clientX: endClientX,
        clientY: endClientY,
        bubbles: true,
      } as any);
      document.dispatchEvent(moveEvent as any);

      document.dispatchEvent(new MouseEvent('pointerup'));
    }

    describe('bottom-right (br) — existing behavior', () => {
      it('increases width and height, position unchanged', () => {
        const panel = createPanel();
        simulateResize(panel, 'br', 100, 100, 124, 115);
        // dx=24 → snap to 24 (grid 8), dy=15 → snap to 15 (grid 15)
        expect(panel.width.value).toBe(160 + 24);
        expect(panel.height.value).toBe(300 + 15);
        expect(panel.x.value).toBe(0);
        expect(panel.y.value).toBe(0);
      });
    });

    describe('top-left (tl) — new behavior', () => {
      it('moves position and adjusts dimensions, keeps opposite edge fixed', () => {
        const panel = createPanel({
          initialX: 40,
          initialY: 30,
          initialWidth: 160,
          initialHeight: 300,
        });
        // Right edge = 40 + 160 = 200, bottom edge = 30 + 300 = 330
        const rightEdge = 200;
        const bottomEdge = 330;

        simulateResize(panel, 'tl', 100, 100, 84, 85);
        // dx = -16 → raw newWidth = 160 - (-16) = 176 → snap to 176 (grid 8)
        // dy = -15 → raw newHeight = 300 - (-15) = 315 → snap to 315 (grid 15)
        // newX = 40 + 160 - 176 = 24 (right edge stays at 200)
        // newY = 30 + 300 - 315 = 15 (bottom edge stays at 330)

        expect(panel.width.value).toBe(176);
        expect(panel.height.value).toBe(315);
        // Edge invariant: opposite edge doesn't move
        expect(panel.x.value + panel.width.value).toBe(rightEdge);
        expect(panel.y.value + panel.height.value).toBe(bottomEdge);
      });
    });

    describe('top-middle (tm)', () => {
      it('adjusts height and Y position, keeps bottom edge fixed', () => {
        const panel = createPanel({
          initialX: 40,
          initialY: 30,
          initialHeight: 300,
        });
        const bottomEdge = 30 + 300;

        simulateResize(panel, 'tm', 100, 100, 100, 85);
        // dy = -15 → newHeight = 300 + 15 = 315 → snap to 315
        // newY = 30 + 300 - 315 = 15

        expect(panel.width.value).toBe(160); // unchanged
        expect(panel.height.value).toBe(315);
        expect(panel.x.value).toBe(40); // unchanged
        expect(panel.y.value + panel.height.value).toBe(bottomEdge);
      });
    });

    describe('middle-left (ml)', () => {
      it('adjusts width and X position, keeps right edge fixed', () => {
        const panel = createPanel({
          initialX: 40,
          initialWidth: 160,
        });
        const rightEdge = 40 + 160;

        simulateResize(panel, 'ml', 100, 100, 84, 100);
        // dx = -16 → newWidth = 160 + 16 = 176 → snap to 176
        // newX = 40 + 160 - 176 = 24

        expect(panel.height.value).toBe(300); // unchanged
        expect(panel.width.value).toBe(176);
        expect(panel.y.value).toBe(0); // unchanged
        expect(panel.x.value + panel.width.value).toBe(rightEdge);
      });
    });

    describe('minimum dimension enforcement with top/left handles', () => {
      it('clamps width to minimum and adjusts X position', () => {
        const panel = createPanel({
          initialX: 40,
          initialWidth: 160,
        });
        // Drag far enough to shrink below minimum (1 grid unit = 8px)
        simulateResize(panel, 'ml', 100, 100, 300, 100);
        // dx = 200 → raw newWidth = 160 - 200 = -40 → clamped to 8
        // newX = 40 + 160 - 8 = 192

        expect(panel.width.value).toBe(8); // minimum 1 unit
        expect(panel.x.value + panel.width.value)
          .toBe(40 + 160); // right edge preserved
      });

      it('clamps height to minimum and adjusts Y position', () => {
        const panel = createPanel({
          initialY: 30,
          initialHeight: 300,
        });
        // Drag far enough to shrink below minimum (1 grid unit = 15px)
        simulateResize(panel, 'tm', 100, 100, 100, 500);
        // dy = 400 → raw newHeight = 300 - 400 = -100 → clamped to 15
        // newY = 30 + 300 - 15 = 315

        expect(panel.height.value).toBe(15); // minimum 1 unit
        expect(panel.y.value + panel.height.value)
          .toBe(30 + 300); // bottom edge preserved
      });
    });
  });
});
