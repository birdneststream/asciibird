// Panel position migration tests — version-guarded brush panel shift
import { describe, it, expect } from 'vitest';
import {
  migratePanelStates,
  PANEL_LAYOUT_VERSION,
  BRUSH_PANEL_V2_SHIFT,
} from '../../../src/utils/panelPositionMigration';

describe('migratePanelStates', () => {
  it('v1 payload shifts brushPreview down by the toolbar growth', () => {
    const parsed = migratePanelStates({ brushPreview: { x: 16, y: 495 } });
    const brush = parsed.brushPreview as { y: number };
    expect(brush.y).toBe(495 + BRUSH_PANEL_V2_SHIFT);
    expect(parsed.layoutVersion).toBe(PANEL_LAYOUT_VERSION);
  });

  it('v2 payload is not shifted again (idempotent across hydrations)', () => {
    const parsed = migratePanelStates({
      brushPreview: { x: 16, y: 519 },
      layoutVersion: PANEL_LAYOUT_VERSION,
    });
    expect((parsed.brushPreview as { y: number }).y).toBe(519);
    expect(parsed.layoutVersion).toBe(PANEL_LAYOUT_VERSION);
  });

  it('shifts customized v1 positions too (toolbar grew under everyone)', () => {
    const parsed = migratePanelStates({ brushPreview: { x: 40, y: 700 } });
    expect((parsed.brushPreview as { y: number }).y).toBe(700 + BRUSH_PANEL_V2_SHIFT);
  });

  it('missing brushPreview is a no-op', () => {
    const parsed = migratePanelStates({ layersLibrary: { y: 90 } });
    expect(parsed.brushPreview).toBeUndefined();
    expect(parsed.layoutVersion).toBe(PANEL_LAYOUT_VERSION);
  });

  it('non-numeric y is left untouched but the version is still stamped', () => {
    const parsed = migratePanelStates({ brushPreview: { y: 'nope' } });
    expect((parsed.brushPreview as { y: unknown }).y).toBe('nope');
    expect(parsed.layoutVersion).toBe(PANEL_LAYOUT_VERSION);
  });
});
