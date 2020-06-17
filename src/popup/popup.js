import Vue from 'vue'
import App from './app/MainApp'
import Clipboard from 'v-clipboard'
import Toasted from 'vue-toasted';
import BootstrapVue from 'bootstrap-vue'

import * as Sentry from '@sentry/browser';
import * as Integrations from '@sentry/integrations';
import VModal from 'vue-js-modal';

global.browser = require('webextension-polyfill')
Vue.prototype.$browser = global.browser

Vue.use(Clipboard)
Vue.use(Toasted, { duration: 1000 })
Vue.use(BootstrapVue)
Vue.use(VModal)


Sentry.init({
  dsn: 'https://dfc7a7727433452fbe5741b602058cc5@sentry.io/1839562',
  integrations: [new Integrations.Vue({ Vue, attachProps: true, logErrors: true })],
});

var filter = function(text, length, clamp){
  // Thanks to: https://stackoverflow.com/questions/35070271/vue-js-components-how-to-truncate-the-text-in-the-slot-element-in-a-component
  clamp = clamp || '...';
  var node = document.createElement('div');
  node.innerHTML = text;
  var content = node.textContent;
  return content.length > length ? content.slice(0, length) + clamp : content;
};

Vue.filter('truncate', filter);
/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App)
})
