// Toolbar store persistence integration tests — real hydration path:
// seed localStorage, init the adapter (falls back to localStorage in
// jsdom), register pinia-plugin-persistedstate on an installed app
// (Pinia 3 only activates plugins once the pinia instance is passed
// through app.use), create the store and verify the deserialize
// tool-index migration ran on the live state.
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { createApp, defineComponent } from 'vue';
import { setActivePinia, createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import { useToolbarStore } from '../../../src/store/toolbar';
import { toolbarIcons } from '../../../src/utils/uiConstants';
import { TOOL_LAYOUT_VERSION } from '../../../src/utils/toolIndexMigration';
import { idbPersistAdapter } from '../../../src/utils/idbPersistAdapter';

const TOOLBAR_KEY = 'asciibird-toolbar';

/** Create a hydrated toolbar store from a persisted payload */
function hydrateStore(payload: Record<string, unknown>): ReturnType<typeof useToolbarStore> {
  localStorage.setItem(TOOLBAR_KEY, JSON.stringify(payload));
  const pinia = createPinia();
  pinia.use(piniaPluginPersistedstate);
  // Install on a scratch app so Pinia 3 flushes queued plugins (_p)
  createApp(defineComponent({ render: () => null })).use(pinia);
  setActivePinia(pinia);
  return useToolbarStore();
}

describe('toolbar store hydration — tool index migration', () => {
  beforeAll(async () => {
    localStorage.clear();
    // jsdom has no IndexedDB → adapter falls back to localStorage
    await idbPersistAdapter.init();
  });

  beforeEach(() => {
    localStorage.removeItem(TOOLBAR_KEY);
  });

  it('v1 payload with shapes (10) remaps to the v2 shapes tool', () => {
    const store = hydrateStore({ toolbarState: { currentTool: 10 } });
    expect(toolbarIcons[store.toolbarState.currentTool].name).toBe('shapes');
    expect(store.toolbarState.toolLayoutVersion).toBe(TOOL_LAYOUT_VERSION);
  });

  it('v1 payload with gradient (9) lands on gradient-vertical', () => {
    const store = hydrateStore({ toolbarState: { currentTool: 9 } });
    expect(toolbarIcons[store.toolbarState.currentTool].name)
      .toBe('gradient-vertical');
  });

  it('v2 payload on gradient-horizontal (10) is NOT remapped', () => {
    const store = hydrateStore({
      toolbarState: { currentTool: 10, toolLayoutVersion: TOOL_LAYOUT_VERSION },
    });
    expect(toolbarIcons[store.toolbarState.currentTool].name)
      .toBe('gradient-horizontal');
  });

  it('stale out-of-range index clamps to the default tool', () => {
    const store = hydrateStore({ toolbarState: { currentTool: 999 } });
    expect(toolbarIcons[store.toolbarState.currentTool].name).toBe('default');
  });

  it('payload without currentTool keeps default state values', () => {
    const store = hydrateStore({ toolbarState: { shapeType: 'rectFilled' } });
    expect(store.toolbarState.shapeType).toBe('rectFilled');
    // Untouched field falls back to the store default
    expect(toolbarIcons[store.toolbarState.currentTool].name).toBe('default');
  });

  it('default state persists the current layout version', () => {
    const store = useToolbarStore();
    expect(store.toolbarState.toolLayoutVersion).toBe(TOOL_LAYOUT_VERSION);
  });
});
