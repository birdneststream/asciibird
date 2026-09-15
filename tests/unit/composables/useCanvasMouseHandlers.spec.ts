// useCanvasMouseHandlers — updateShapeAltKeys held-key lifecycle tests
//
// A (center, Alt-alternate) and Z (1:1, Shift-alternate) are hold-to-apply
// alternate constraint keys for the shape tool, for users whose window
// manager captures Alt. updateShapeAltKeys is the pure state-transition
// helper; the composable wires it into canvasModifierKeyChange.

import { describe, it, expect } from 'vitest';
import { updateShapeAltKeys } from '../../../src/composables/useCanvasMouseHandlers';

/** Minimal fake KeyboardEvent with the fields updateShapeAltKeys reads */
function keyEvent(
  type: 'keydown' | 'keyup',
  key: string,
  opts: { repeat?: boolean; target?: HTMLElement } = {},
): KeyboardEvent {
  return {
    type,
    key,
    repeat: opts.repeat ?? false,
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
