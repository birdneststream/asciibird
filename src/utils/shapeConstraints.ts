// Shape Constraint Utilities — modifier-key constraints for the two-click
// shape flow.
//
// Pure geometry helpers that adjust shape start/end coordinates before they
// reach the drawing functions:
//   Shift → equal width and height in grid units (1:1); the dominant drag
//           axis wins and drag direction is preserved.
//   Alt   → the first click (anchor) is the CENTER of the shape; the shape
//           expands symmetrically around it, with the cursor on the boundary.
//   Shift+Alt combine: the 1:1-constrained delta expands from the center.
//
// The line tool ignores modifiers (passthrough) per spec. Coordinates are
// unit-agnostic integers: full-block mode passes cells, half-block mode
// passes half-rows (double-Y) — "equal grid units" is in the active grid's
// units, not pixels (no aspect-ratio correction, mirroring shapes.ts).
// Draw functions normalize corner order, so the returned corner order is
// irrelevant.

import type { ShapeType } from './shapes';

// ─── Modifier State ──────────────────────────────────────────────

/** Keyboard modifier state for shape drawing */
export interface ShapeModifiers {
  /** Shift held → equal width/height in grid units */
  shift: boolean;
  /** Alt held → anchor is the shape center */
  alt: boolean;
}

/** No modifiers — default, unconstrained drawing (frozen: safe to share) */
export const NO_MODIFIERS: Readonly<ShapeModifiers> = Object.freeze({
  shift: false,
  alt: false,
});

/** Shape corners entering/leaving constrainShapeCoords */
export interface ShapeCoords {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

/**
 * Extract shape drawing modifiers from a mouse or keyboard event (the
 * keyboard path serves the Shift/Alt preview refresh). Touch events and
 * absent events carry no modifier state and fall back to NO_MODIFIERS.
 */
export function modifiersFromEvent(
  e?: MouseEvent | TouchEvent | KeyboardEvent,
): ShapeModifiers {
  if (!e || !('shiftKey' in e)) return NO_MODIFIERS;
  return { shift: e.shiftKey, alt: e.altKey };
}

// ─── Constraint ──────────────────────────────────────────────────

/**
 * Constrain shape coordinates for modifier-assisted drawing.
 *
 * Returns the (possibly adjusted) opposite corners of the shape's bounding
 * box. Corner order is irrelevant — the draw functions normalize with
 * min/max. Applies to rect and ellipse shapes only; the line tool and
 * modifier-less drags pass through unchanged.
 */
export function constrainShapeCoords(
  shapeType: ShapeType,
  coords: ShapeCoords,
  modifiers: Readonly<ShapeModifiers> = NO_MODIFIERS,
): ShapeCoords {
  // The line tool ignores modifiers per spec; plain drags are unconstrained
  if (shapeType === 'line' || (!modifiers.shift && !modifiers.alt)) {
    return coords;
  }

  const { startX, startY } = coords;
  let dx = coords.endX - startX;
  let dy = coords.endY - startY;

  // Shift: equal width and height in grid units — the dominant axis wins
  // and drag direction is preserved (zero components grow positive)
  if (modifiers.shift) {
    const m = Math.max(Math.abs(dx), Math.abs(dy));
    dx = (Math.sign(dx) || 1) * m;
    dy = (Math.sign(dy) || 1) * m;
  }

  // Alt: the anchor becomes the center — expand the (shift-constrained)
  // delta symmetrically around the start point
  if (modifiers.alt) {
    const hx = Math.abs(dx);
    const hy = Math.abs(dy);
    return {
      startX: startX - hx,
      startY: startY - hy,
      endX: startX + hx,
      endY: startY + hy,
    };
  }

  // Shift only: anchor plus the constrained delta
  return {
    startX,
    startY,
    endX: startX + dx,
    endY: startY + dy,
  };
}
