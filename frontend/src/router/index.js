import Vue from 'vue'
import Router from 'vue-router'
import Vuelidate from 'vuelidate'
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
      path: '/:appdirectory/test-key',
      component: () => import('@/components/HardwarkeyTest')
    },
    {
      path: '/404',
      component: () => import('@/components/ErrorPage')
    },
    {
      path: '/',
      component: () => import('@/components/Login')
    },
    {
      path: '/:appdirectory',
      component: () => import('@/components/Login')
    },
    {
      path: '/:appdirectory/signup',
      component: () => import('@/components/Signup')
    },
    {
      path: '/:appdirectory/dashboard',
      component: () => import('@/components/Dashboard')
    },
    { path: '*', component: () => import('@/components/ErrorPage') }
  ]
})
