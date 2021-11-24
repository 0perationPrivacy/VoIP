<template>
    <div>
        <h6 class="border-bottom mx-1 pb-1">Hardware Key</h6>
        <div class="card m-1">
            <div class="card-body">
              <div class="row align-items-center">
                <div class="col-auto">
                  <div class="col-auto">
                    <div class="d-flex justify-content-between">
                      <div class="pr-1 mr-2">
                        <input type="text" class="form-control" v-model="title">
                      </div>
                      <div class="pl-1 ml-2">
                        <button class="btn btn-success" @click="register()">
                          <b-icon icon="plus"></b-icon>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </div>
    </div>
</template>

<script>
import { post } from '../../../core/module/common.module'
export default {
  data () {
    return {
      title: ''
    }
  },
  mounted: function () {
    this.getMfaStatus()
  },
  methods: {
    register () {
      /* if (this.title.trim() === '') {
        this.$swal.fire('Please enter title', '', 'error')
      } else {
        if (window.u2f && window.u2f.register) {
          var request = {
            data: {},
            url: 'hardwarekey/register-key'
          }
          this.$store
            .dispatch(post, request)
            .then((result) => {
              if (result) {
                window.u2f.register(result.appId, [result], [], response => {
                  console.log('============================registerResponse==========================')
                  console.log(response)
                  console.log(window.u2f)
                  console.log(window.u2f.RegisteredKey)
                  console.log('============================/registerResponse==========================')
                  var request2 = {
                    data: {registerResponse: response, result: result, title: this.title},
                    url: 'hardwarekey/register'
                  }
                  this.$store
                    .dispatch(post, request2)
                    .then((result) => {
                      if (result) {
                        console.log(result)
                      }
                    })
                    .catch((e) => {

                    })
                })
              }
            })
            .catch((e) => {

            })
        }
      } */
    },
    login () {
      if (window.u2f && window.u2f.sign) {
        var request = {
          data: {user: '61875b966249ac551883d42c'},
          url: 'hardwarekey/login-key'
        }
        this.$store
          .dispatch(post, request)
          .then((result) => {
            if (result) {
              window.u2f.sign(result.appId, [result.challenge], [result], response => {
                this.register()
                /* var request2 = {
                  data: {loginResponse: response, result: result, user: this.activeUser.user._id},
                  url: 'hardwarekey/login'
                }
                this.$store
                  .dispatch(post, request2)
                  .then((result) => {
                    if (result) {
                      this.$cookie.set('access_token', this.activeUser.token, 30)
                      this.$cookie.set('userdata', JSON.stringify(this.activeUser.user), 30)
                      this.activeUser.token = ''
                      this.activeUser.user = null
                      this.$router.push(`/${this.$route.params.appdirectory}/dashboard`)
                      // console.log(result)
                    }
                  })
                  .catch((e) => {

                  }) */
              })
            }
          })
          .catch((e) => {

          })
      }
    }
  }
}
</script>
