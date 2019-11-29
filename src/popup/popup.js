import Vue from 'vue'
import App from './App'
import Clipboard from 'v-clipboard'
import Toasted from 'vue-toasted';
import BootstrapVue from 'bootstrap-vue'



global.browser = require('webextension-polyfill')
Vue.prototype.$browser = global.browser

Vue.use(Clipboard)
Vue.use(Toasted, {duration: 1000})
Vue.use(BootstrapVue)




/* eslint-disable no-new */
new Vue({
  el: '#app',
  
  
  render: h => h(App)
})
