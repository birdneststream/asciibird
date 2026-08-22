import { describe, it, expect } from 'vitest';
import { backfillImageOverlays } from '@/utils/imageOverlayBackfill';
import { defaultImageOverlay } from '@/ascii';
import type { AsciibirdMeta } from '@/types';

/** Build a complete meta, applying overrides */
function makeMeta(overrides: Partial<AsciibirdMeta> = {}): AsciibirdMeta {
  return {
    title: 'test',
    layers: '',
    selectedLayer: 0,
    imageOverlay: defaultImageOverlay(),
    history: [],
    historyIndex: -1,
    x: 0,
    y: 0,
    ...overrides,
  };
}

/** Simulate a meta persisted before the imageOverlay field existed */
function makeLegacyMeta(): AsciibirdMeta {
  const meta = makeMeta();
  delete meta.imageOverlay;
  return meta;
}

describe('backfillImageOverlays', () => {
  it('adds default overlay to metas lacking the field', () => {
    const metas = [makeLegacyMeta(), makeLegacyMeta()];
    backfillImageOverlays(metas);
    expect(metas[0].imageOverlay).toEqual(defaultImageOverlay());
    expect(metas[1].imageOverlay).toEqual(defaultImageOverlay());
  });

  it('leaves existing overlays untouched', () => {
    const overlay = { ...defaultImageOverlay(), opacity: 42 };
    const metas = [makeMeta({ imageOverlay: overlay })];
    backfillImageOverlays(metas);
    expect(metas[0].imageOverlay).toBe(overlay);
    expect(metas[0].imageOverlay.opacity).toBe(42);
  });

  it('is idempotent — re-running does not replace backfilled defaults', () => {
    const metas = [makeLegacyMeta()];
    backfillImageOverlays(metas);
    const first = metas[0].imageOverlay;
    first.url = 'https://example.com/a.png';
    backfillImageOverlays(metas);
    expect(metas[0].imageOverlay).toBe(first);
    expect(metas[0].imageOverlay.url).toBe('https://example.com/a.png');
  });

  it('ignores null, undefined, and non-array input without throwing', () => {
    expect(() => backfillImageOverlays(null)).not.toThrow();
    expect(() => backfillImageOverlays(undefined)).not.toThrow();
    expect(() => backfillImageOverlays({} as never)).not.toThrow();
    expect(() => backfillImageOverlays('corrupt' as never)).not.toThrow();
  });

  it('handles an empty array', () => {
    expect(() => backfillImageOverlays([])).not.toThrow();
  });
});
