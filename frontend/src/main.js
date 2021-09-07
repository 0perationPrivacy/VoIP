// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import VueSweetalert2 from 'vue-sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

import VueChatScroll from 'vue-chat-scroll'
import formLoading from 'vue2-form-loading'
window.axios = require('axios')
Vue.use(VueChatScroll)
Vue.use(formLoading)

Vue.config.productionTip = false
Vue.use(VueSweetalert2)
Vue.use(require('vue-moment'))

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
