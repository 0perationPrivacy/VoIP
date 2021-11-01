// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import VueSweetalert2 from 'vue-sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
// import store from '/core/services/store'
import store from '../src/core/services/store'
import ApiService from '../src/core/services/api.service'
import VueChatScroll from 'vue-chat-scroll'
import formLoading from 'vue2-form-loading'
import vSelect from 'vue-select'
var VueCookie = require('vue-cookie')
window.axios = require('axios')
Vue.use(VueChatScroll)
Vue.component('v-select', vSelect)
// Vue.use(Vuex)
Vue.use(formLoading)
ApiService.init()
Vue.use(VueCookie)
Vue.config.productionTip = false
Vue.use(VueSweetalert2)
Vue.use(require('vue-moment'))

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
