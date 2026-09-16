// useCanvasMouseHandlers — updateShapeAltKeys held-key lifecycle tests
// plus the gradient ghost-preview delegation wiring.
//
// A (center, Alt-alternate) and Z (1:1, Shift-alternate) are hold-to-apply
// alternate constraint keys for the shape tool, for users whose window
// manager captures Alt. updateShapeAltKeys is the pure state-transition
// helper; the composable wires it into canvasModifierKeyChange.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { ref, computed } from 'vue';
import {
  useCanvasMouseHandlers,
  updateShapeAltKeys,
} from '../../../src/composables/useCanvasMouseHandlers';
import { useToolbarStore } from '../../../src/store/toolbar';
import { toolbarIcons } from '../../../src/utils/uiConstants';
import { emptyBlock } from '../../../src/ascii';
import type { Block } from '../../../src/types';

vi.mock('../../../src/utils/gradientPreview', () => ({
  drawGradientPreview: vi.fn(),
}));

import { drawGradientPreview as drawGradientGhost } from '../../../src/utils/gradientPreview';

/** Keydown/keyup event factory for updateShapeAltKeys */

/** Minimal fake KeyboardEvent with the fields updateShapeAltKeys reads */
function keyEvent(
  type: 'keydown' | 'keyup',
  key: string,
  opts: { repeat?: boolean; target?: HTMLElement; ctrlKey?: boolean; metaKey?: boolean } = {},
): KeyboardEvent {
  return {
    type,
    key,
    repeat: opts.repeat ?? false,
    ctrlKey: opts.ctrlKey ?? false,
    metaKey: opts.metaKey ?? false,
    target: opts.target ?? document.body,
  } as unknown as KeyboardEvent;
}

function inputTarget(): HTMLElement {
  const el = document.createElement('input');
  return el;
}

describe('updateShapeAltKeys', () => {
  it('keydown A sets the alt (center) flag', () => {
    const held = { alt: false, shift: false };
    expect(updateShapeAltKeys(held, keyEvent('keydown', 'a'), true)).toBe(true);
    expect(held).toEqual({ alt: true, shift: false });
  });

  it('keydown Z sets the shift (1:1) flag', () => {
    const held = { alt: false, shift: false };
    expect(updateShapeAltKeys(held, keyEvent('keydown', 'z'), true)).toBe(true);
    expect(held).toEqual({ alt: false, shift: true });
  });

  it('keyup clears the flag — processed without the picking guard', () => {
    const held = { alt: true, shift: true };
    // A keyup arriving AFTER the pick completed must still clear state
    expect(updateShapeAltKeys(held, keyEvent('keyup', 'a'), true)).toBe(true);
    expect(held.alt).toBe(false);
    expect(updateShapeAltKeys(held, keyEvent('keyup', 'z'), true)).toBe(true);
    expect(held.shift).toBe(false);
  });

  it('uppercase key variants are recognised', () => {
    const held = { alt: false, shift: false };
    expect(updateShapeAltKeys(held, keyEvent('keydown', 'A'), true)).toBe(true);
    expect(held.alt).toBe(true);
  });

  it('ignores key repeats (state already correct)', () => {
    const held = { alt: false, shift: false };
    expect(updateShapeAltKeys(held, keyEvent('keydown', 'a', { repeat: true }), true))
      .toBe(false);
    expect(held.alt).toBe(false);
  });

  it('ignores keys when the shapes tool is not active', () => {
    const held = { alt: false, shift: false };
    expect(updateShapeAltKeys(held, keyEvent('keydown', 'a'), false)).toBe(false);
    expect(held.alt).toBe(false);
  });

  it('ignores Ctrl/Cmd combos — Ctrl+Z undo and Ctrl+A must not latch', () => {
    const held = { alt: false, shift: false };
    expect(updateShapeAltKeys(
      held, keyEvent('keydown', 'z', { ctrlKey: true }), true,
    )).toBe(false);
    expect(updateShapeAltKeys(
      held, keyEvent('keydown', 'a', { ctrlKey: true }), true,
    )).toBe(false);
    expect(updateShapeAltKeys(
      held, keyEvent('keydown', 'a', { metaKey: true }), true,
    )).toBe(false);
    expect(held).toEqual({ alt: false, shift: false });
  });

  it('ignores events targeting INPUT fields (typing must not latch)', () => {
    const held = { alt: false, shift: false };
    expect(updateShapeAltKeys(
      held, keyEvent('keydown', 'a', { target: inputTarget() }), true,
    )).toBe(false);
    expect(held.alt).toBe(false);
  });

  it('ignores events targeting TEXTAREA fields', () => {
    const held = { alt: false, shift: false };
    const textarea = document.createElement('textarea');
    expect(updateShapeAltKeys(
      held, keyEvent('keydown', 'z', { target: textarea }), true,
    )).toBe(false);
    expect(held.shift).toBe(false);
  });

  it('ignores events targeting contenteditable elements', () => {
    const held = { alt: false, shift: false };
    const editable = document.createElement('div');
    editable.setAttribute('contenteditable', 'true');
    // jsdom does not reflect the attribute onto isContentEditable —
    // stub the property so the guard logic itself is exercised
    Object.defineProperty(editable, 'isContentEditable', { value: true });
    expect(updateShapeAltKeys(
      held, keyEvent('keydown', 'a', { target: editable }), true,
    )).toBe(false);
    expect(held.alt).toBe(false);
  });

  it('ignores unrelated keys', () => {
    const held = { alt: false, shift: false };
    for (const key of ['b', 'e', 'q', 's', 'l', 'Shift', 'Alt', 'Enter', ' ']) {
      expect(updateShapeAltKeys(held, keyEvent('keydown', key), true)).toBe(false);
    }
    expect(held).toEqual({ alt: false, shift: false });
  });

  it('A and Z combine — both flags set independently', () => {
    const held = { alt: false, shift: false };
    updateShapeAltKeys(held, keyEvent('keydown', 'a'), true);
    updateShapeAltKeys(held, keyEvent('keydown', 'z'), true);
    expect(held).toEqual({ alt: true, shift: true });
  });
});

describe('gradient ghost preview delegation (canvasMouseMove)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.mocked(drawGradientGhost).mockClear();
  });

  /** Minimal EditorState-shaped state bag for the gradient path */
  function makeState() {
    const x = ref(0);
    const y = ref(0);
    return {
      x,
      y,
      isTopHalf: ref(true),
      halfBlockEditing: ref(false),
      canTool: ref(false),
      isDefault: ref(false),
      currentTool: computed(
        () => toolbarIcons[useToolbarStore().currentTool] ?? { name: 'default', icon: '' },
      ),
      blockWidthComp: ref(8),
      blockHeightComp: ref(15),
      blockSizeMultiplier: ref(1),
      asciiBlockAtXy: computed(() => ({ ...emptyBlock })),
      currentAsciiLayerBlocks: ref<Block[][]>([[{ ...emptyBlock }]]),
      currentAsciiWidth: ref(1),
      currentAsciiHeight: ref(1),
      toolbarState: ref(useToolbarStore().toolbarState),
    } as unknown as Parameters<typeof useCanvasMouseHandlers>[0]['state'];
  }

  /** Wire the composable with mocked tools/rendering callbacks */
  function makeHandlers(state: ReturnType<typeof makeState>) {
    return useCanvasMouseHandlers({
      state,
      tools: {
        pasteMode: {
          isPasteMode: ref(false),
          confirmPaste: vi.fn(),
          drawPastePreview: vi.fn(),
        },
        colorReplace: { applyReplaceFromBlock: vi.fn() },
        gradientTool: {
          isGradientPicking: ref(true),
          gradientStart: ref({ x: 0, y: 0 }),
          gradientStartColor: ref(4), // pick-start colour (red)
          setStartPoint: vi.fn(),
          applyGradient: vi.fn(),
        },
        shapeTool: {
          isShapePicking: ref(false),
          shapeStart: ref(null),
          setShapeStart: vi.fn(),
          applyShape: vi.fn(),
        },
        toolApp: { drawBrush: vi.fn(), eraser: vi.fn(), fill: vi.fn() },
      },
      rendering: {
        getToolCtx: () => ({}) as CanvasRenderingContext2D,
        clearToolCanvas: vi.fn(async () => {}),
        drawIndicator: vi.fn(async () => {}),
        drawTextIndicator: vi.fn(async () => {}),
        delayRedrawCanvas: vi.fn(async () => {}),
        redrawSelect: vi.fn(async () => {}),
      },
      callbacks: {
        dispatchBlocks: vi.fn(async () => {}),
        processSelect: vi.fn(async () => {}),
        getSelectionBounds: () => null,
      },
      emit: { coords: vi.fn() },
    });
  }

  function mouseMoveEvent(offsetX: number, offsetY: number): MouseEvent {
    return { offsetX, offsetY } as unknown as MouseEvent;
  }

  it.each([
    ['gradient-vertical', 'vertical'],
    ['gradient-horizontal', 'horizontal'],
    ['gradient-corner', 'diagonal'],
  ] as const)(
    '%s delegates the locked direction and the pick-start colour',
    async (toolName, expectedDirection) => {
      const toolbarStore = useToolbarStore();
      toolbarStore.changeTool(
        toolbarIcons.findIndex(t => t.name === toolName),
      );
      toolbarStore.changeColourFg(1); // live FG differs — must NOT be used
      toolbarStore.changeColourBg(12);

      const state = makeState();
      const handlers = makeHandlers(state);
      await handlers.canvasMouseMove(mouseMoveEvent(0, 0)); // enter cell 0,0
      await handlers.canvasMouseMove(mouseMoveEvent(8, 0)); // move to 1,0

      expect(drawGradientGhost).toHaveBeenCalledTimes(1);
      const arg = vi.mocked(drawGradientGhost).mock.calls[0][0];
      expect(arg.direction).toBe(expectedDirection);
      expect(arg.startColorIdx).toBe(4); // gradientStartColor, not live FG
      expect(arg.endColorIdx).toBe(12); // live BG (matches applyGradient)
      expect(arg.startX).toBe(0);
      expect(arg.startY).toBe(0);
      expect(arg.endX).toBe(1); // cursor cell
      expect(arg.endY).toBe(0);
    },
  );

  it('does not delegate when no gradient tool is active', async () => {
    useToolbarStore().changeTool(0); // default tool
    const state = makeState();
    const handlers = makeHandlers(state);
    await handlers.canvasMouseMove(mouseMoveEvent(8, 0));
    expect(drawGradientGhost).not.toHaveBeenCalled();
  });
});
