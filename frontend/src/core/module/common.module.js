import ApiService from '@/core/services/api.service'
import router from '../../router'
import Vue from 'vue'
// action types
export const VERIFY_AUTH = 'verifyAuth'
export const LOGIN = 'login'
export const LOGOUT = 'logout'
export const REGISTER = 'register'
export const UPDATE_PASSWORD = 'updateUser'

export const post = 'post'
export const get = 'get'

export default {
  actions: {
    [post] (context, request) {
      return new Promise(resolve => {
        ApiService.setHeader()
        ApiService.post(request.url, request.data)
          .then(({ data }) => {
            resolve(data)
          })
          .catch(({ response }) => {
            if (response.status === 401) {
              Vue.swal.fire({
                title: 'Error',
                text: 'Unauthorized Access!',
                icon: 'error',
                confirmButtonClass: 'btn btn-secondary',
                heightAuto: false
              })
              Vue.cookie.delete('access_token')
              Vue.cookie.delete('userdata')
              var path = window.location.pathname.split('/')[1]
              router.push(`/${path}/`)
            }
            if (response.status === 400) {
              Vue.swal.fire({
                title: 'Error',
                text: response.data.message,
                icon: 'error',
                confirmButtonClass: 'btn btn-secondary',
                heightAuto: false
              })
            }
            resolve(false)
          })
      })
    },
    [get] (context, request) {
      console.log(window.location.pathname)
      return new Promise(resolve => {
        ApiService.setHeader()
        ApiService.get(request.url)
          .then(({ data }) => {
            resolve(data)
          })
          .catch(({ response }) => {
            if (response.status === 401) {
              Vue.swal.fire({
                title: 'Error',
                text: response.data.error,
                icon: 'error',
                confirmButtonClass: 'btn btn-secondary',
                heightAuto: false
              })
              Vue.cookie.delete('access_token')
              Vue.cookie.delete('userdata')
              var path = window.location.pathname.split('/')[1]
              router.push(`/${path}/`)
            }
            if (response.status === 400) {
              Vue.swal.fire({
                title: 'Error',
                text: response.data.message,
                icon: 'error',
                confirmButtonClass: 'btn btn-secondary',
                heightAuto: false
              })
            }
            resolve(false)
          })
      })
    }
  },

  mutations: {
    SET_ERROR (state, error) {
      state.errors = error
    }
  },

  state: {
    panel: []
  },

  getters: {
  }
}
