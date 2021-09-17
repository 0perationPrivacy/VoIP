<template>
    <div>
        <div class="login-box dark-mode p-3">
            <h1 class="dark-mode">Signup</h1>
            <form @submit.prevent="handleSubmit" class="ml-2 mr-2">
              <div class="form-group mt-4">
                <b-input-group>
                  <b-input-group-prepend is-text>
                    <b-icon icon="person-fill"></b-icon>
                  </b-input-group-prepend>
                <input class="form-control chat-input" type="text" placeholder="Username" id="login-input" v-model="user.email" :class="{ 'is-invalid': submitted && $v.user.email.$error }">
                </b-input-group>
                <div v-if="submitted && $v.user.email.$error" class="invalid-feedback">
                  <span v-if="!$v.user.email.required">Username is required</span>
                  <span v-if="!$v.user.email.minLength">Please enter a valid Username</span>
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
                    <span v-if="!$v.user.password.minLength">Please enter a valid password</span>
                </div>
              </div>
              <div class="form-group mb-2 mt-2">
                <b-input-group>
                  <b-input-group-prepend is-text>
                    <b-icon icon="shield-lock"></b-icon>
                  </b-input-group-prepend>
                <input class="chat-input form-control" v-model="user.c_password"  type="password" placeholder="Confirm Password" id="clogin-input" :class="{ 'is-invalid': submitted && $v.user.c_password.$error }">
                </b-input-group>
                <div v-if="submitted && $v.user.c_password.$error" class="invalid-feedback">
                    <span v-if="!$v.user.c_password.required">Password is required<br></span>
                    <span v-if="!$v.user.c_password.sameAsPassword">Password and confirm password are not match!</span>
                </div>
              </div>
              <div class="d-grid">
                <button class="btn btn-primary mt-3" type="submit">Sign Up</button>
              </div>
              <div class="my-2 small">
                Already have an account? <router-link to="/" class="mx-2">Login</router-link>
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
                <p class="version">{{ version }}</p>
    </div>
</template>

<script>

import { required, minLength, sameAs } from 'vuelidate/lib/validators'
export default {
  name: 'Signup',
  data () {
    return {
      version: process.env.VERSION,
      user: {
        email: '',
        password: ''
      },
      submitted: false,
      baseurl: ''
    }
  },
  validations: {
    user: {
      email: { required, minLength: minLength(2) },
      password: { required, minLength: minLength(6) },
      // eslint-disable-next-line standard/object-curly-even-spacing
      c_password: {required, sameAsPassword: sameAs('password') }
    }
  },
  mounted: function () {
    var baseUrl = window.location.origin
    if (baseUrl === 'http://localhost:8080') {
      this.baseurl = 'http://localhost:3000'
    }
    this.getsignup()
  },
  methods: {
    handleSubmit (e) {
      e.preventDefault()
      this.submitted = true
      this.$v.$touch()
      if (this.$v.$invalid) {
        return
      }

      // eslint-disable-next-line no-undef
      axios.post(`auth/register`, this.user)
        .then(response => {
          this.$router.push('/')
        })
        .catch(error => {
          if (error.response.status === 401) {
            this.$swal({
              icon: 'error',
              title: 'Oops...',
              text: error.response.data.message
            })
          }
          if (error.response.status === 400) {
            this.$swal({
              icon: 'error',
              title: 'Oops...',
              text: error.response.data.errors.errors.email[0]
            })
          }
        })
    },
    getsignup () {
      // eslint-disable-next-line no-undef
      axios.post(`${this.baseurl}/api/auth/get-signup`, {})
        .then(response => {
          if (response.data.data === 'on') {
            this.signUpOption = true
          } else {
            this.$router.push('/')
          }
        })
        .catch(() => {
          this.signUpOption = false
        })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
