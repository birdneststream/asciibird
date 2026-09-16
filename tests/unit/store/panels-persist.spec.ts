// Panel store hydration integration tests — real plugin path for the
// brush-panel position migration (toolbar-persist.spec.ts pattern:
// seed localStorage, adapter falls back to it in jsdom, install the
// pinia plugin on a scratch app so Pinia 3 activates it, hydrate).
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { createApp, defineComponent } from 'vue';
import { setActivePinia, createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import { usePanelStore } from '../../../src/store/panels';
import { PANEL_LAYOUT_VERSION } from '../../../src/utils/panelPositionMigration';
import { idbPersistAdapter } from '../../../src/utils/idbPersistAdapter';

const PANEL_KEY = 'asciibird-panel';

function hydratePanelStore(payload: Record<string, unknown>): void {
  localStorage.setItem(PANEL_KEY, JSON.stringify(payload));
  const pinia = createPinia();
  pinia.use(piniaPluginPersistedstate);
  createApp(defineComponent({ render: () => null })).use(pinia);
  setActivePinia(pinia);
  usePanelStore();
}

describe('panel store hydration — brush panel migration', () => {
  beforeAll(async () => {
    localStorage.clear();
    await idbPersistAdapter.init();
  });

  beforeEach(() => {
    localStorage.removeItem(PANEL_KEY);
  });

  it('v1 payload shifts brushPreview below the grown toolbar', () => {
    hydratePanelStore({ brushPreview: { x: 16, y: 495, visible: true } });
    const store = usePanelStore();
    expect(store.brushPreview.y).toBe(519);
    expect(store.layoutVersion).toBe(PANEL_LAYOUT_VERSION);
  });

  it('v2 payload keeps its position (no double shift)', () => {
    hydratePanelStore({
      brushPreview: { x: 16, y: 519, visible: true },
      layoutVersion: PANEL_LAYOUT_VERSION,
    });
    const store = usePanelStore();
    expect(store.brushPreview.y).toBe(519);
  });

  it('default state carries the current layout version', () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const store = usePanelStore();
    expect(store.layoutVersion).toBe(PANEL_LAYOUT_VERSION);
    // Default position sits flush under the grown toolbar
    expect(store.brushPreview.y).toBe(519);
  });
});
