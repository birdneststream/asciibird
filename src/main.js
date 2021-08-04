import Vue from 'vue';
import './style.css';
import VueTailwind from 'vue-tailwind';
import VueDraggableResizable from 'vue-draggable-resizable';
import VueClipboard from 'vue-clipboard2';
import { tailwindCss } from './tailwindSettings';
import 'vue-draggable-resizable/dist/VueDraggableResizable.css';

import 'hack-font/build/web/hack.css';

import store from './store';
import Dashboard from './Dashboard.vue';

Vue.config.productionTip = false;

import {
  FontAwesomeIcon,
} from '@fortawesome/vue-fontawesome';
import './fontAwesome';

Vue.use(VueTailwind, tailwindCss);
Vue.component('font-awesome-icon', FontAwesomeIcon);
Vue.component('vue-draggable-resizable', VueDraggableResizable);
Vue.use(VueClipboard);

new Vue({
  store,
  render: (h) => h(Dashboard),
}).$mount('#app');
