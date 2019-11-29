import Vue from 'vue'
import App from './App'
import Clipboard from 'v-clipboard'
import Toasted from 'vue-toasted';



global.browser = require('webextension-polyfill')
Vue.prototype.$browser = global.browser

Vue.use(Clipboard)
Vue.use(Toasted, {duration: 1000})



/* eslint-disable no-new */
new Vue({
  el: '#app',
  
  
  render: h => h(App)
})
