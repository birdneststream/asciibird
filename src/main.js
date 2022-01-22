import Vue from 'vue';
import VueTailwind from 'vue-tailwind';
import VueDraggableResizable from 'vue-draggable-resizable';
import VueClipboard from 'vue-clipboard2';
import {
  tailwindCss
} from './tailwindSettings';
import 'vue-draggable-resizable/dist/VueDraggableResizable.css';
import store from './store';
import Dashboard from './Dashboard.vue';
import Toasted from 'vue-toasted';
import './style.scss';

Vue.config.productionTip = false;
Vue.use(VueTailwind, tailwindCss);

Vue.component('vue-draggable-resizable', VueDraggableResizable);
Vue.use(VueClipboard);
Vue.use(Toasted, {
  position: 'bottom-center',
  iconPack: 'material',
  type: 'info',
  duration: 1200,
});

// Check for localStorage and asciibird cache
if (localStorage.getItem('vuex')) {
  let asciiCache = JSON.parse(localStorage.getItem('vuex'));

  // Remove old old asciibird cache
  if (asciiCache && asciiCache.ver === undefined) {
    localStorage.removeItem('vuex');
    window.location.reload();
  }

  // Future state file changes can be amended here
}

new Vue({
  store,
  render: (h) => h(Dashboard),
}).$mount('#app');
