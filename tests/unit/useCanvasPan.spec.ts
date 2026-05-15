import { describe, it, expect, vi } from 'vitest';
import { ref, type Ref } from 'vue';
import { useCanvasPan } from '../../src/composables/useCanvasPan';

// ─── Helpers ────────────────────────────────────────────────────

function setup(overrides?: {
  scrollContainerRef?: Ref<HTMLElement | null>;
  canvasMouseMove?: (e: MouseEvent) => void;
}) {
  const mockEl = { scrollBy: vi.fn() } as unknown as HTMLElement;
  const scrollContainerRef = overrides?.scrollContainerRef
    ?? ref<HTMLElement | null>(mockEl);
  const canvasMouseMove = overrides?.canvasMouseMove ?? vi.fn();

  return {
    scrollContainerRef,
    canvasMouseMove,
    ...useCanvasPan({ scrollContainerRef, canvasMouseMove }),
  };
}

function makeMouseEvent(overrides: Partial<MouseEvent> = {}): MouseEvent {
  return {
    clientX: 100,
    clientY: 100,
    ...overrides,
  } as MouseEvent;
}

// ─── useCanvasPan ────────────────────────────────────────────────

describe('useCanvasPan', () => {
  it('returns startPan, onCanvasMouseMove, and panCursorStyle', () => {
    const result = setup();
    expect(result.startPan).toBeTypeOf('function');
    expect(result.onCanvasMouseMove).toBeTypeOf('function');
    expect(result.panCursorStyle).toBeDefined();
  });

  it('panCursorStyle is empty string by default', () => {
    const { panCursorStyle } = setup();
    expect(panCursorStyle.value).toBe('');
  });

  it('panCursorStyle shows grabbing cursor while panning', () => {
    const { panCursorStyle, startPan } = setup();
    startPan(makeMouseEvent());
    expect(panCursorStyle.value).toBe('cursor: grabbing;');
  });

  it('onCanvasMouseMove delegates to canvasMouseMove when not panning', () => {
    const mockMove = vi.fn();
    const { onCanvasMouseMove } = setup({ canvasMouseMove: mockMove });
    const e = makeMouseEvent();
    onCanvasMouseMove(e);
    expect(mockMove).toHaveBeenCalledWith(e);
  });

  it('onCanvasMouseMove scrolls container while panning', () => {
    const mockEl = { scrollBy: vi.fn() } as unknown as HTMLElement;
    const scrollContainerRef = ref<HTMLElement | null>(mockEl);
    const mockMove = vi.fn();
    const { startPan, onCanvasMouseMove } = setup({
      scrollContainerRef,
      canvasMouseMove: mockMove,
    });

    // Start pan at (100, 100)
    startPan(makeMouseEvent({ clientX: 100, clientY: 100 }));

    // Move to (80, 70) — should scroll by (20, 30)
    onCanvasMouseMove(makeMouseEvent({ clientX: 80, clientY: 70 }));
    expect(mockEl.scrollBy).toHaveBeenCalledWith(20, 30);
    expect(mockMove).not.toHaveBeenCalled();
  });

  it('stops panning on mouseup', () => {
    const mockMove = vi.fn();
    const { startPan, onCanvasMouseMove, panCursorStyle } = setup({
      canvasMouseMove: mockMove,
    });

    startPan(makeMouseEvent());
    expect(panCursorStyle.value).toBe('cursor: grabbing;');

    // Simulate document-level mouseup listener firing
    document.dispatchEvent(new MouseEvent('mouseup'));

    expect(panCursorStyle.value).toBe('');
    // Now onCanvasMouseMove should delegate to tool handler
    const e = makeMouseEvent();
    onCanvasMouseMove(e);
    expect(mockMove).toHaveBeenCalledWith(e);
  });

  it('handles null scroll container gracefully', () => {
    const scrollContainerRef = ref<HTMLElement | null>(null);
    const { startPan, onCanvasMouseMove } = setup({
      scrollContainerRef,
      canvasMouseMove: vi.fn(),
    });

    // Should not throw
    startPan(makeMouseEvent({ clientX: 100, clientY: 100 }));
    expect(() => {
      onCanvasMouseMove(makeMouseEvent({ clientX: 80, clientY: 70 }));
    }).not.toThrow();
  });
});
