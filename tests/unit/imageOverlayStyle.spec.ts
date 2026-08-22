import { describe, it, expect } from 'vitest';
import { buildImageOverlayStyle } from '@/utils/imageOverlayStyle';
import { defaultImageOverlay } from '@/ascii';
import type { ImageOverlay } from '@/types';

/** Build a visible overlay with sensible defaults, applying overrides */
function makeOverlay(overrides: Partial<ImageOverlay> = {}): ImageOverlay {
  return {
    ...defaultImageOverlay(),
    url: 'https://example.com/image.png',
    visible: true,
    ...overrides,
  };
}

describe('buildImageOverlayStyle', () => {
  it('paints visible overlay above the wrapper background (z-index 0, never -1)', () => {
    const style = buildImageOverlayStyle(makeOverlay());
    expect(style).toContain('z-index: 0;');
    // Regression: z-index -1 painted the overlay behind .canvas-wrapper's
    // opaque background (no stacking context) — invisible for every URL.
    expect(style).not.toContain('z-index: -1');
    expect(style).toContain('position: absolute;');
  });

  it('emits the exact declaration sequence for a canonical visible overlay', () => {
    expect(buildImageOverlayStyle(makeOverlay())).toBe(
      "background-image: url('https://example.com/image.png');"
      + ' background-size: 100%; background-repeat: repeat;'
      + ' left: 0%; top: 0%; opacity: 0.95; z-index: 0; position: absolute;',
    );
  });

  it('hidden overlay emits only the positioning rule', () => {
    expect(buildImageOverlayStyle(makeOverlay({ visible: false })))
      .toBe('position: absolute;');
  });

  it('omits background-image when url is null', () => {
    const style = buildImageOverlayStyle(makeOverlay({ url: null }));
    expect(style).not.toContain('background-image');
    // Remaining layout rules still apply
    expect(style).toContain('z-index: 0;');
    expect(style).toContain('background-repeat: repeat;');
  });

  it('omits background-image when url is an empty string', () => {
    const style = buildImageOverlayStyle(makeOverlay({ url: '' }));
    expect(style).not.toContain('background-image');
  });

  it("percent-encodes single quotes so they can't terminate the url() string", () => {
    const style = buildImageOverlayStyle(makeOverlay({ url: "https://ex.com/a'b.png" }));
    expect(style).toContain("url('https://ex.com/a%27b.png')");
    expect(style).not.toContain("a'b");
  });

  it.each([
    [{ repeatx: true, repeaty: true }, 'repeat'],
    [{ repeatx: true, repeaty: false }, 'repeat-x'],
    [{ repeatx: false, repeaty: true }, 'repeat-y'],
    [{ repeatx: false, repeaty: false }, 'no-repeat'],
  ])('repeat flags %j produce %s', (flags, expected) => {
    expect(buildImageOverlayStyle(makeOverlay(flags)))
      .toContain(`background-repeat: ${expected};`);
  });

  it('stretched overlay fits 100% width', () => {
    expect(buildImageOverlayStyle(makeOverlay({ stretched: true })))
      .toContain('background-size: 100%;');
  });

  it('non-stretched overlay uses the size percentage', () => {
    expect(buildImageOverlayStyle(makeOverlay({ stretched: false, size: 40 })))
      .toContain('background-size: 40%;');
  });

  it('converts opacity from percentage to a 0–1 fraction', () => {
    expect(buildImageOverlayStyle(makeOverlay({ opacity: 95 })))
      .toContain('opacity: 0.95;');
  });

  it('positions with left/top percentages, negatives included', () => {
    const style = buildImageOverlayStyle(makeOverlay({ left: -25, top: 50 }));
    expect(style).toContain('left: -25%;');
    expect(style).toContain('top: 50%;');
  });
});
