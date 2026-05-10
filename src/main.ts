import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createPersistedState } from 'pinia-plugin-persistedstate';
import Dashboard from './Dashboard.vue';
import { setStore, setModalStore } from './ascii';
import { useAsciiBirdStore } from './store';
import { useModalStore } from './store/modal';
import { useDesktopStore } from './store/desktop';
import { usePanelStore } from './store/panels';
import 'material-icons/iconfont/material-icons.css';
import './style.scss';

// ── Check for localStorage and asciibird cache ────────────────────
if (localStorage.getItem('vuex')) {
  try {
    const asciiCache = JSON.parse(localStorage.getItem('vuex') || '{}');

    // Remove old asciibird cache (no version field)
    if (asciiCache && asciiCache.ver === undefined) {
      localStorage.removeItem('vuex');
      window.location.reload();
    }

    // Migrate extracted state to separate localStorage keys.
    // Idempotent — only writes if the target key doesn't already exist.
    // Old 'vuex' key is KEPT — main store still reads/writes it.
    if (!localStorage.getItem('asciibird-modal')) {
      if (asciiCache.modalState) {
        localStorage.setItem(
          'asciibird-modal',
          JSON.stringify({
            modalState: asciiCache.modalState,
            isKeyboardDisabled: asciiCache.isKeyboardDisabled ?? false,
          }),
        );
      }
    }

    if (!localStorage.getItem('asciibird-desktop')) {
      if (asciiCache.desktopState) {
        localStorage.setItem(
          'asciibird-desktop',
          JSON.stringify({ desktopState: asciiCache.desktopState }),
        );
      }
    }

    if (!localStorage.getItem('asciibird-panel')) {
      const hasPanelData =
        asciiCache.debugPanelState ||
        asciiCache.brushLibraryState ||
        asciiCache.brushPreviewState ||
        asciiCache.layersLibraryState;

      if (hasPanelData) {
        localStorage.setItem(
          'asciibird-panel',
          JSON.stringify({
            debugPanel: asciiCache.debugPanelState,
            brushLibrary: asciiCache.brushLibraryState,
            brushPreview: asciiCache.brushPreviewState,
            layersLibrary: asciiCache.layersLibraryState,
          }),
        );
      }
    }
  } catch {
    localStorage.removeItem('vuex');
    window.location.reload();
  }
}

const pinia = createPinia();
pinia.use(createPersistedState());

const app = createApp(Dashboard);
app.use(pinia);

// Break circular dependency: set store references in ascii module
const store = useAsciiBirdStore();
setStore(store);

const modalStore = useModalStore();
setModalStore(modalStore);

// Initialize desktop + panel stores (needed for lazy registration)
useDesktopStore();
usePanelStore();

app.mount('#app');
