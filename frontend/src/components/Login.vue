<template>
    <div>
        <div class="login-box dark-mode p-3">
            <theme-button />
            <h1 class="dark-mode">Login</h1>
            <form @submit.prevent="handleSubmit" class="ml-2 mr-2" v-if="!otpScreen">
              <div class="form-group mt-4">
                <b-input-group>
                  <b-input-group-prepend is-text>
                    <b-icon icon="person-fill"></b-icon>
                  </b-input-group-prepend>
                <input class="form-control chat-input" type="text" placeholder="Username" id="login-input" v-model="user.email" :class="{ 'is-invalid': submitted && $v.user.email.$error }">
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
                <input class="chat-input form-control" v-model="user.password"  type="password" placeholder="Password" id="login-input" :class="{ 'is-invalid': submitted && $v.user.password.$error }">
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
                Don’t have an account yet? <router-link to="/signup" class="mx-2"> Sign up</router-link>
              </div>
              <div  class="d-grid d-md-flex mt-2 small" v-else>
                New registrations are disabled
              </div>
            </form>
            <form class="ml-2 mr-2" v-bind:class="{ 'd-none': !otpScreen }">
              <div class="form-group mb-2 mt-4">
                <input class="chat-input form-control" v-model="otpForm.otp"  type="text" placeholder="OTP" :class="{ 'is-invalid': submitted2 && otpError }">
                <div v-if="submitted2 && otpError" class="invalid-feedback">
                    <span>OTP is required</span>
                </div>
              </div>
              <div class="d-grid d-md-flex">
                <button class="btn btn-success mt-3" type="button" v-on:click="handleSubmit2($event)" id="login-button">Submit</button>
              </div>
            </form>
            <div class="d-flex my-4 justify-content-center">
                 <a href="https://www.twitter.com/0perationP" target="_blank" aria-label="Twitter" title="Twitter">
                    <b-icon font-scale="2" icon="twitter" variant="secondary" class="mx-2"></b-icon>
                 </a>
                 <a href="https://github.com/0perationPrivacy/" target="_blank" aria-label="Github" title="Github">
                  <b-icon font-scale="2" icon="github" variant="secondary" class="mx-2"></b-icon>
                 </a>
                 <a href="https://www.OperationPrivacy.com/Donate" target="_blank" aria-label="Donate" title="Donate">
                  <b-icon font-scale="2" icon="credit-card" variant="secondary" class="mx-2"></b-icon>
                 </a>
              </div>
        </div>
        <p class="version">{{versionOption}}</p>
    </div>
</template>

<script>
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
      user: {
        email: '',
        password: ''
      },
      otpForm: {
        otp: ''
      },
      submitted: false,
      submitted2: false
    }
  },
  validations: {
    user: {
      email: { required, minLength: minLength(2) },
      password: { required, minLength: minLength(6) }
    }
  },
  mounted: function () {
    var baseUrl = window.location.origin
    if (baseUrl === 'http://localhost:8080') {
      this.baseurl = 'http://localhost:3000'
    }
    if (localStorage.getItem('access_token')) {
      this.$router.push('/dashboard')
    }
    this.getsignup()
    this.getVersion()
  },
  methods: {
    getsignup () {
      // eslint-disable-next-line no-undef
      axios.post(`${this.baseurl}/api/auth/get-signup`, {})
        .then(response => {
          if (response.data.data === 'on') {
            this.signUpOption = true
          } else {
            this.signUpOption = false
          }
        })
        .catch(() => {
          this.signUpOption = false
        })
    },
    getVersion () {
      // eslint-disable-next-line no-undef
      axios.post(`${this.baseurl}/api/auth/get-version`, {})
        .then(response => {
          this.versionOption = response.data.data
        })
    },
    handleSubmit (e) {
      e.preventDefault()
      this.submitted = true
      this.$v.$touch()
      if (this.$v.$invalid) {
        return
      }

      // eslint-disable-next-line no-undef
      axios.post(`${this.baseurl}/api/auth/login`, this.user)
        .then(response => {
          localStorage.setItem('access_token', response.data.token)
          localStorage.setItem('userdata', JSON.stringify(response.data.data))
          this.$router.push('/dashboard')
        })
        .catch(error => {
          if (error.response.status === 401) {
            this.$swal({
              icon: 'error',
              title: 'Oops...',
              text: error.response.data.message
            })
          }
        })
    },
    handleSubmit2 (e) {
      this.submitted2 = true
      if (this.otpForm.otp.trim() !== '') {
        // eslint-disable-next-line no-undef
        axios.post(`${this.baseurl}/api/auth/otp-verify`, {user: this.loginId, otp: this.otpForm.otp})
          .then(response => {
            localStorage.setItem('access_token', response.data.token)
            localStorage.setItem('userdata', JSON.stringify(response.data.data))
            this.$router.push('/dashboard')
          })
          .catch(error => {
            if (error.response.status === 401) {
              this.$swal({
                icon: 'error',
                title: 'Oops...',
                text: error.response.data.message
              })
            }
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
