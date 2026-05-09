import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createPersistedState } from 'pinia-plugin-persistedstate';
import Dashboard from './Dashboard.vue';
import { setStore } from './ascii';
import { useAsciiBirdStore } from './store';
import './style.scss';

// Check for localStorage and asciibird cache
if (localStorage.getItem('vuex')) {
  try {
    const asciiCache = JSON.parse(localStorage.getItem('vuex') || '{}');

    // Remove old asciibird cache (no version field)
    if (asciiCache && asciiCache.ver === undefined) {
      localStorage.removeItem('vuex');
      window.location.reload();
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

// Break circular dependency: set store reference in ascii module
const store = useAsciiBirdStore();
setStore(store);

app.mount('#app');
