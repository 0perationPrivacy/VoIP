import Vue from 'vue'
import Router from 'vue-router'
import Vuelidate from 'vuelidate'
import Login from '@/components/Login'
import Signup from '@/components/Signup'
import Dashboard from '@/components/Dashboard'
import ErrorPage from '@/components/ErrorPage'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import InputTag from 'vue-input-tag'

// Import Bootstrap an BootstrapVue CSS files (order is important)
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
require('../assets/css/main.css')
Vue.use(BootstrapVue)
// Optionally install the BootstrapVue icon components plugin
Vue.use(IconsPlugin)
Vue.component('input-tag', InputTag)

Vue.use(Router)
Vue.use(Vuelidate)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/404',
      component: ErrorPage
    },
    {
      path: '/',
      component: Login
    },
    {
      path: '/:appdirectory',
      component: Login
    },
    {
      path: '/:appdirectory/signup',
      component: Signup
    },
    {
      path: '/:appdirectory/dashboard',
      component: Dashboard
    },
    { path: '*', component: ErrorPage }
  ]
})
