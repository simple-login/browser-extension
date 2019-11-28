import Vue from 'vue'
import App from './App'
import Clipboard from 'v-clipboard'



global.browser = require('webextension-polyfill')
Vue.prototype.$browser = global.browser

Vue.use(Clipboard)


/* eslint-disable no-new */
new Vue({
  el: '#app',
  
  
  render: h => h(App)
})
