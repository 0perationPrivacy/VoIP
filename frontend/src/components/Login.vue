<template>
    <div>
        <div class="login-box dark-mode p-3">
            <theme-button id-hide="false" />
            <h1 class="dark-mode">Login</h1>
            <form @submit.prevent="handleSubmit" class="ml-2 mr-2" v-if="!otpScreen && !keyScreen">
              <div class="form-group mt-4">
                <b-input-group>
                  <b-input-group-prepend is-text>
                    <b-icon icon="person-fill"></b-icon>
                  </b-input-group-prepend>
                <input class="form-control chat-input" type="text" placeholder="Username" v-model="user.email" :class="{ 'is-invalid': submitted && $v.user.email.$error }" title="Enter Username">
                 </b-input-group>
                <div v-if="submitted && $v.user.email.$error" class="invalid-feedback">
                  <span v-if="!$v.user.email.required">Username is required</span>
                  <span v-if="!$v.user.email.minLength">Username is invalid</span>
                </div>
              </div>
              <div class="form-group mb-2 mt-4">
                <b-input-group>
                  <b-input-group-prepend is-text>
                    <b-icon icon="shield-lock"></b-icon>
                  </b-input-group-prepend>
                <input class="chat-input form-control" v-model="user.password"  type="password" placeholder="Password" :class="{ 'is-invalid': submitted && $v.user.password.$error }" title="Enter Password">
               </b-input-group>
                <div v-if="submitted && $v.user.password.$error" class="invalid-feedback">
                    <span v-if="!$v.user.password.required">Password is required</span>
                    <span v-if="!$v.user.password.minLength">Password is invalid</span>
                </div>
              </div>
              <div class="d-grid">
                <button class="btn btn-success mt-3" type="submit" id="login-button">Login</button>
              </div>
              <div class="my-2 small" v-if="signUpOption">
                Don’t have an account yet? <router-link :to="signupRoute" class="mx-2"> Sign up</router-link>
              </div>
              <div  class="d-grid d-md-flex mt-2 small" v-else>
                New registrations are disabled
              </div>
            </form>
            <form class="ml-2 mr-2 text-center" v-bind:class="{ 'd-none': !otpScreen }">
              <div class="form-group my-4">
                <label>Enter Verification Code</label>
                <input class="totp" v-model="otpForm.otp"  type="form-control" maxlength="6" placeholder="000000" :class="{ 'is-invalid': submitted2 && otpError }">
                <div v-if="submitted2 && otpError" class="invalid-feedback">
                    <span>Verification code is required</span>
                </div>
              </div>
              <div class="text-center">
                <button class="btn btn-success m-3 px-5" type="button" v-on:click="handleSubmit2($event)" id="login-button2">Verify</button>
              </div>
            </form>

            <form class="ml-2 mr-2 text-center" v-if="keyScreen">
              <div class="form-group my-4">
                <label>Please connect your hardware key</label>
              </div>
            </form>

            <div class="d-flex my-4 justify-content-center">
                 <a href="https://www.twitter.com/0perationP" target="_blank" rel="noopener noreferrer" aria-label="Twitter" title="Twitter">
                    <b-icon font-scale="2" icon="twitter" variant="secondary" class="mx-2"></b-icon>
                 </a>
                 <a href="https://github.com/0perationPrivacy/" target="_blank" rel="noopener noreferrer" aria-label="Github" title="Github">
                  <b-icon font-scale="2" icon="github" variant="secondary" class="mx-2"></b-icon>
                 </a>
                 <a href="https://www.OperationPrivacy.com/Donate" target="_blank" rel="noopener noreferrer" aria-label="Donate" title="Donate">
                  <b-icon font-scale="2" icon="credit-card" variant="secondary" class="mx-2"></b-icon>
                 </a>
              </div>
        </div>
        <p class="version">{{versionOption}}</p>
    </div>
</template>

<script>
import { post } from '../core/module/common.module'
import ThemeButton from '@/components/ThemeButton.vue'
import { required, minLength } from 'vuelidate/lib/validators'
export default {
  name: 'Login',
  components: { ThemeButton },
  data () {
    return {
      baseurl: '',
      switch1: true,
      otpScreen: false,
      otpError: false,
      loginId: 0,
      signUpOption: false,
      versionOption: 'v1.0.0',
      activeUser: {
        user: null,
        token: ''
      },
      user: {
        email: '',
        password: ''
      },
      otpForm: {
        otp: ''
      },
      submitted: false,
      submitted2: false,
      signupRoute: '',
      keyScreen: false,
      keyTotpScreen: false
    }
  },
  validations: {
    user: {
      email: { required, minLength: minLength(2) },
      password: { required, minLength: minLength(6) }
    }
  },
  mounted: function () {
    this.signupRoute = `/${this.$route.params.appdirectory}/signup`
    this.fnLogin()
    this.getsignup()
    this.getVersion()
  },
  methods: {
    fnLogin () {
      // console.log('login')
      var request = {
        url: 'auth/check-directoryname',
        data: {dirname: this.$route.params.appdirectory}
      }
      this.$store
        .dispatch(post, request)
        .then((response) => {
          if (this.$cookie.get('access_token')) {
            // alert('login')
            if (response.data.status === 'nodir' || response.data.status === 'no-name') {
              this.$router.push(`/${response.data.dir}/dashboard`)
            } else if (response.data.status === 'false') {
              this.$router.push(`/404`)
            } else if (response.data.status === 'true') {
              this.$router.push(`/${response.data.dir}/dashboard`)
            }
          } else {
            // alert(JSON.stringify(response.data))
            if (response.data.status === 'nodir' && response.data.dir === 'voip') {
              // this.$router.push(`/404`)
              this.$router.push(`/${response.data.dir}`)
            } else if (response.data.status === 'no-name' && response.data.dir === 'voip') {
              this.$router.push(`/${response.data.dir}`)
            } else if (response.data.status === 'false' || response.data.status === 'no-name') {
              this.$router.push(`/404`)
            }
            // else if (response.data.status === 'nodir' && response.data.dir === 'voip') {
            //   this.$router.push(`/${response.data.dir}`)
            // }
          }
        })
        .catch((e) => {
          this.old_version = false
          console.log(e)
          // resolve(false)
        })
    },
    getsignup () {
      var request = {
        data: {},
        url: 'auth/get-signup'
      }
      this.$store
        .dispatch(post, request)
        .then((response) => {
          if (response && response.data === 'on') {
            this.signUpOption = true
          } else {
            this.signUpOption = false
          }
        })
        .catch((e) => {
          this.signUpOption = false
        })
    },
    getVersion () {
      var request = {
        data: {},
        url: 'auth/get-version'
      }
      this.$store
        .dispatch(post, request)
        .then((response) => {
          if (response) {
            this.versionOption = response.data
          }
        })
        .catch((e) => {
          // this.signUpOption = false
        })
    },
    handleSubmit (e) {
      e.preventDefault()
      this.submitted = true
      this.$v.$touch()
      if (this.$v.$invalid) {
        return
      }

      var request = {
        data: this.user,
        url: 'auth/login'
      }
      this.$store
        .dispatch(post, request)
        .then((response) => {
          if (response) {
            /* if (response.status === 'hardwarekey') {
              this.activeUser.token = response.token
              this.activeUser.user = response.data
              this.keyScreen = true
              this.otpScreen = false
              this.login()
            } */ if (response.status === 'mfa') {
              this.activeUser.token = response.token
              this.activeUser.user = response.data
              this.otpScreen = true
            } else {
              this.$cookie.set('access_token', response.token, 30)
              this.$cookie.set('userdata', JSON.stringify(response.data), 30)
              this.$router.push(`/${this.$route.params.appdirectory}/dashboard`)
            }
          }
        })
        .catch((e) => {
          // this.signUpOption = false
        })
    },
    /* login () {
      try {
        if (window.u2f && window.u2f.sign) {
          console.log('============================login uf2 response==========================')
          console.log(window.u2f)
          console.log('============================/login uf2 response==========================')
          console.log('============================sign response==========================')
          console.log(window.u2f.sign)
          console.log('============================/sign response==========================')
          var request = {
            data: {user: this.activeUser.user._id},
            url: 'hardwarekey/login-key'
          }
          this.$store
            .dispatch(post, request)
            .then((result) => {
              if (result) {
                window.u2f.sign(result.appId, [result.challenge], [result], response => {
                  console.log('============================loginResponse==========================')
                  console.log(response)
                  console.log('============================/loginResponse==========================')
                  var request2 = {
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

                    })
                })
              }
            })
            .catch((e) => {

            })
        }
      } catch (error) {
        console.log(error)
      }
    }, */
    handleSubmit2 (e) {
      this.submitted2 = true
      if (this.otpForm.otp.trim() !== '') {
        var request = {
          data: { user: this.activeUser.user._id, verification_code: this.otpForm.otp },
          url: 'auth/otp-verify'
        }
        this.$store
          .dispatch(post, request)
          .then((response) => {
            if (response) {
              if (response.status === 'true') {
                this.$cookie.set('access_token', this.activeUser.token, 30)
                this.$cookie.set('userdata', JSON.stringify(this.activeUser.user), 30)
                this.activeUser.token = ''
                this.activeUser.user = null
                this.$router.push(`/${this.$route.params.appdirectory}/dashboard`)
              }
            }
          })
          .catch((e) => {
            // this.signUpOption = false
          })
      } else {
        this.otpError = true
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
