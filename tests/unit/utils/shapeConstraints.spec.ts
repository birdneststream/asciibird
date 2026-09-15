// shapeConstraints util tests
import { describe, it, expect } from 'vitest';
import {
  constrainShapeCoords,
  modifiersFromEvent,
  NO_MODIFIERS,
  type ShapeCoords,
  type ShapeModifiers,
} from '../../../src/utils/shapeConstraints';

const mods = (shift: boolean, alt: boolean): ShapeModifiers => ({ shift, alt });

const coords = (startX: number, startY: number, endX: number, endY: number): ShapeCoords =>
  ({ startX, startY, endX, endY });

// ─── constrainShapeCoords: passthrough ───────────────────────────

describe('constrainShapeCoords passthrough', () => {
  it('passes through for the line tool regardless of modifiers', () => {
    const c = coords(2, 3, 9, 1);
    expect(constrainShapeCoords('line', c, mods(true, true))).toBe(c);
  });

  it('passes through when no modifiers are held', () => {
    const shapeTypes = ['rectOutline', 'rectFilled', 'ellipseOutline', 'ellipseFilled'] as const;
    for (const shapeType of shapeTypes) {
      const c = coords(1, 1, 7, 4);
      expect(constrainShapeCoords(shapeType, c, NO_MODIFIERS)).toBe(c);
      expect(constrainShapeCoords(shapeType, c, mods(false, false))).toBe(c);
    }
  });

  it('defaults to no modifiers when omitted', () => {
    const c = coords(0, 0, 5, 3);
    expect(constrainShapeCoords('rectFilled', c)).toBe(c);
  });
});

// ─── constrainShapeCoords: shift (1:1 in grid units) ─────────────

describe('constrainShapeCoords shift', () => {
  it('constrains to equal grid units when dx dominates', () => {
    // (2,2)->(7,4): |dx|=5 > |dy|=2 → end snaps to (7,7)
    expect(constrainShapeCoords('rectFilled', coords(2, 2, 7, 4), mods(true, false)))
      .toEqual(coords(2, 2, 7, 7));
  });

  it('constrains to equal grid units when dy dominates', () => {
    // (2,2)->(4,7): |dy|=5 > |dx|=2 → end snaps to (7,7)
    expect(constrainShapeCoords('ellipseFilled', coords(2, 2, 4, 7), mods(true, false)))
      .toEqual(coords(2, 2, 7, 7));
  });

  it('preserves drag direction up-left', () => {
    // (10,10)->(4,8): |dx|=6 dominates → end snaps to (4,4)
    expect(constrainShapeCoords('rectOutline', coords(10, 10, 4, 8), mods(true, false)))
      .toEqual(coords(10, 10, 4, 4));
  });

  it('preserves mixed directions (right and up)', () => {
    // (10,10)->(16,6): |dx|=6 dominates → end snaps to (16,4)
    expect(constrainShapeCoords('rectOutline', coords(10, 10, 16, 6), mods(true, false)))
      .toEqual(coords(10, 10, 16, 4));
  });

  it('grows the zero axis positive when dragging straight along an axis', () => {
    // (5,5)->(5,9): dx=0 → snaps to (9,9), expanding right
    expect(constrainShapeCoords('rectFilled', coords(5, 5, 5, 9), mods(true, false)))
      .toEqual(coords(5, 5, 9, 9));
    // (5,5)->(9,5): dy=0 → snaps to (9,9), expanding down
    expect(constrainShapeCoords('rectFilled', coords(5, 5, 9, 5), mods(true, false)))
      .toEqual(coords(5, 5, 9, 9));
  });

  it('keeps an already-square drag unchanged', () => {
    // |dx| === |dy| — no ambiguity, stays put
    expect(constrainShapeCoords('rectFilled', coords(2, 2, 6, 6), mods(true, false)))
      .toEqual(coords(2, 2, 6, 6));
  });

  it('keeps a zero-delta drag as a single point', () => {
    expect(constrainShapeCoords('ellipseOutline', coords(3, 3, 3, 3), mods(true, false)))
      .toEqual(coords(3, 3, 3, 3));
  });

  it('works with half-row Y coordinates (half-block mode)', () => {
    // Half-block space: (2,1)->(8,4): |dx|=6 dominates → end (8,7)
    expect(constrainShapeCoords('rectFilled', coords(2, 1, 8, 4), mods(true, false)))
      .toEqual(coords(2, 1, 8, 7));
  });
});

// ─── constrainShapeCoords: alt (anchor-centered) ─────────────────

describe('constrainShapeCoords alt', () => {
  it('expands symmetrically around the anchor (down-right)', () => {
    // (10,10)->(13,12): dx=3, dy=2 → corners (7,8)..(13,12), center (10,10)
    expect(constrainShapeCoords('rectFilled', coords(10, 10, 13, 12), mods(false, true)))
      .toEqual(coords(7, 8, 13, 12));
  });

  it('expands symmetrically around the anchor (up-left, same box)', () => {
    // (10,10)->(7,8): |dx|=3, |dy|=2 → identical box (7,8)..(13,12)
    expect(constrainShapeCoords('rectFilled', coords(10, 10, 7, 8), mods(false, true)))
      .toEqual(coords(7, 8, 13, 12));
  });

  it('expands symmetrically around the anchor (up-right)', () => {
    // (10,10)->(6,13): |dx|=4, |dy|=3 → corners (6,7)..(14,13)
    expect(constrainShapeCoords('ellipseOutline', coords(10, 10, 6, 13), mods(false, true)))
      .toEqual(coords(6, 7, 14, 13));
  });

  it('expands symmetrically around the anchor (down-left)', () => {
    // (10,10)->(15,7): |dx|=5, |dy|=3 → corners (5,7)..(15,13)
    expect(constrainShapeCoords('rectOutline', coords(10, 10, 15, 7), mods(false, true)))
      .toEqual(coords(5, 7, 15, 13));
  });

  it('keeps the anchor as the exact center and the cursor on the boundary', () => {
    const start = { x: 12, y: 9 };
    const end = { x: 8, y: 14 };
    const out = constrainShapeCoords(
      'ellipseFilled',
      coords(start.x, start.y, end.x, end.y),
      mods(false, true),
    );
    // Center of the returned box equals the anchor
    expect((out.startX + out.endX) / 2).toBe(start.x);
    expect((out.startY + out.endY) / 2).toBe(start.y);
    // Cursor lies on the box boundary (here: left edge x, inside y range)
    expect(out.startX).toBe(end.x);
    expect(out.startY).toBeLessThanOrEqual(end.y);
    expect(out.endY).toBeGreaterThanOrEqual(end.y);
  });

  it('keeps a zero-delta drag as a single point at the anchor', () => {
    expect(constrainShapeCoords('rectFilled', coords(4, 4, 4, 4), mods(false, true)))
      .toEqual(coords(4, 4, 4, 4));
  });

  it('works with half-row Y coordinates (half-block mode)', () => {
    // (3,4)->(3,9) in half rows: |dy|=5 → corners (3,-1)..(3,9)
    expect(constrainShapeCoords('rectOutline', coords(3, 4, 3, 9), mods(false, true)))
      .toEqual(coords(3, -1, 3, 9));
  });
});

// ─── constrainShapeCoords: shift+alt combined ────────────────────

describe('constrainShapeCoords shift+alt', () => {
  it('expands the post-shift delta from the center (square result)', () => {
    // (0,0)->(4,2): shift delta (4,4), then centered → (-4,-4)..(4,4) = 9x9
    expect(constrainShapeCoords('rectFilled', coords(0, 0, 4, 2), mods(true, true)))
      .toEqual(coords(-4, -4, 4, 4));
  });

  it('combined keeps the anchor centered', () => {
    const out = constrainShapeCoords('ellipseOutline', coords(10, 10, 14, 12), mods(true, true));
    // shift delta (4,4) → corners (6,6)..(14,14), center (10,10)
    expect(out).toEqual(coords(6, 6, 14, 14));
  });

  it('combined with dy dominant expands to a square', () => {
    // (3,3)->(5,8): |dy|=5 dominates → delta (5,5) → corners (-2,-2)..(8,8)
    expect(constrainShapeCoords('ellipseFilled', coords(3, 3, 5, 8), mods(true, true)))
      .toEqual(coords(-2, -2, 8, 8));
  });
});

// ─── constrainShapeCoords: purity ────────────────────────────────

describe('constrainShapeCoords purity', () => {
  it('does not mutate the input coords on constrained paths', () => {
    const input = coords(10, 10, 13, 12);
    constrainShapeCoords('rectFilled', input, mods(true, true));
    expect(input).toEqual(coords(10, 10, 13, 12));
  });
});

// ─── modifiersFromEvent ──────────────────────────────────────────

describe('modifiersFromEvent', () => {
  it('returns NO_MODIFIERS for an absent event', () => {
    expect(modifiersFromEvent()).toEqual(NO_MODIFIERS);
  });

  it('returns NO_MODIFIERS for touch events', () => {
    const touch = new Event('touchstart') as TouchEvent;
    expect(modifiersFromEvent(touch)).toEqual(NO_MODIFIERS);
  });

  it('reads shift/alt state from mouse events', () => {
    expect(modifiersFromEvent(new MouseEvent('mousedown'))).toEqual(NO_MODIFIERS);
    expect(modifiersFromEvent(new MouseEvent('mousedown', { shiftKey: true })))
      .toEqual({ shift: true, alt: false });
    expect(modifiersFromEvent(new MouseEvent('mousedown', { altKey: true })))
      .toEqual({ shift: false, alt: true });
    expect(modifiersFromEvent(new MouseEvent('mousedown', { shiftKey: true, altKey: true })))
      .toEqual({ shift: true, alt: true });
  });

  it('reads shift/alt state from keyboard events (modifier refresh path)', () => {
    expect(modifiersFromEvent(new KeyboardEvent('keydown'))).toEqual(NO_MODIFIERS);
    expect(modifiersFromEvent(new KeyboardEvent('keydown', { shiftKey: true })))
      .toEqual({ shift: true, alt: false });
    expect(modifiersFromEvent(new KeyboardEvent('keyup', { altKey: true })))
      .toEqual({ shift: false, alt: true });
  });
});
