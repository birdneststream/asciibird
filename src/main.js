import Vue from 'vue';
import './style.css';
import VueTailwind from 'vue-tailwind';
import VueDraggableResizable from 'vue-draggable-resizable';
import VueClipboard from 'vue-clipboard2';
import { tailwindCss } from './tailwindSettings';
import 'vue-draggable-resizable/dist/VueDraggableResizable.css';
import store from './store';
import Dashboard from './Dashboard.vue';
import Toasted from 'vue-toasted';

Vue.config.productionTip = false;
Vue.use(VueTailwind, tailwindCss);

Vue.component('vue-draggable-resizable', VueDraggableResizable);
Vue.use(VueClipboard);
Vue.use(Toasted, {
  position: 'bottom-center',
  iconPack: 'fontawesome',
  type: 'info',
  duration: 1000,
});

new Vue({
  store,
  render: (h) => h(Dashboard),
}).$mount('#app');
