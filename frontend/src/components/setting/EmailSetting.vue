<template>
    <div class="p-1">
        <!-- @submit.prevent="handleSubmit2" -->
        <form @submit.prevent="handleSubmit" class="ml-2 mr-2">
           <div class="form-group mt-2">
                <input class="form-control" name="email" v-model="form.email" placeholder="Enter Username" :class="{ 'is-invalid': submitted3 && $v.form.email.$error }" />
                <div v-if="submitted3 && $v.form.email.$error" class="invalid-feedback">
                    <span v-if="!$v.form.email.required">Email Is Required</span>
                    <!-- <span v-if="!$v.form.email.email">Please enter valid email</span> -->
                </div>
            </div>
            <div class="form-group mt-2">
                <input class="form-control" name="password" v-model="form.password" placeholder="Enter Password" :class="{ 'is-invalid': submitted3 && $v.form.password.$error }" />
                <div v-if="submitted3 && $v.form.password.$error" class="invalid-feedback">
                    <span v-if="!$v.form.password.required">Password Is Required</span>
                </div>
            </div>
             <div class="form-group mt-2">
                <input class="form-control" name="sender_email" v-model="form.sender_email" placeholder="Enter Sender Email" :class="{ 'is-invalid': submitted3 && $v.form.sender_email.$error }" />
                <div v-if="submitted3 && $v.form.to_email.$error" class="invalid-feedback">
                    <span v-if="!$v.form.sender_email.required">Sender Email is required</span>
                    <span v-if="!$v.form.sender_email.email">Enter Valid Sender Email</span>
                </div>
            </div>
             <div class="form-group mt-2">
                <input class="form-control" name="to_email" v-model="form.to_email" placeholder="Enter From Email" :class="{ 'is-invalid': submitted3 && $v.form.to_email.$error }" />
                <div v-if="submitted3 && $v.form.to_email.$error" class="invalid-feedback">
                    <span v-if="!$v.form.to_email.required">To Email is required</span>
                    <span v-if="!$v.form.to_email.email">Enter Valid To Email</span>
                </div>
            </div>
            <div class="form-group mt-2">
                <input class="form-control" name="host" v-model="form.host" placeholder="Enter Host (smtp.domain.com)" :class="{ 'is-invalid': submitted3 && $v.form.host.$error }" />
                <div v-if="submitted3 && $v.form.host.$error" class="invalid-feedback">
                    <span v-if="!$v.form.host.required">Host Is Required</span>
                </div>
            </div>
            <div class="form-group mt-2">
                <input class="form-control" name="port" v-model="form.port" placeholder="Enter Port (465 or 587)" :class="{ 'is-invalid': submitted3 && $v.form.port.$error }" />
                <div v-if="submitted3 && $v.form.port.$error" class="invalid-feedback">
                    <span v-if="!$v.form.port.required">Port Is Required</span>
                </div>
            </div>
            <div class="form-group mt-2">
               <b-form-checkbox id="checkbox-11" v-model="form.secure"  name="secure" :value="true" plain checked="true"  v-b-tooltip.hover.bottomright="'for 465 only'" variant="primary">
                Secure
              </b-form-checkbox>
            </div>
            <div class="form-group">
                <button class="btn btn-success mt-2" type="submit">Save</button>
            </div>
        </form>
        <hr>
        <div v-if="showProfile">
          <div class="form-group mt-2">
            <b-form-checkbox  v-for="profile in profiles" :key="profile._id"
              plain
              id="checkbox-1"
              name="checkbox-1"
              value="true"
              unchecked-value="false"
              :checked="profile.emailnotification == 'true'"
              @change="profileUpdate($event, profile._id)"
            >
              <span class="pr-2">&nbsp;&nbsp;{{profile.profile}}</span>
            </b-form-checkbox>
          </div>
        </div>
    </div>
</template>
<script>
import { required, email } from 'vuelidate/lib/validators'
import { post, get } from '../../core/module/common.module'
export default {
  data () {
    return {
      form: {
        email: '',
        sender_email: '',
        password: '',
        to_email: '',
        host: '',
        port: '',
        secure: false
      },
      submitted3: false,
      showProfile: false,
      profiles: []
    }
  },
  validations: {
    form: {
      email: {required},
      sender_email: {required, email},
      password: {required},
      to_email: {required, email},
      host: {required},
      port: {required}
    }
  },
  mounted: function () {
    this.getEmailSetting()
  },
  methods: {
    handleSubmit (e) {
      this.submitted3 = true
      this.$v.$touch()
      if (this.$v.$invalid) {
        return
      }
      var request = {
        data: this.form,
        url: 'email/create'
      }
      this.$store
        .dispatch(post, request)
        .then((response) => {
          if (response) {
            this.$swal({
              icon: 'success',
              title: 'Email Setting',
              text: 'Setting saved successfully'
            })
            this.getEmailSetting()
          }
          // this.profiles = response.data
        })
        .catch((e) => {
          console.log(e)
        })
    },
    getEmailSetting () {
      var request = {
        url: 'email/setting-get'
      }
      // eslint-disable-next-line no-undef
      // axios
      //   .get('http://localhost:3000/api/email/setting-get')
      //   .then(response => {
      //     // response.data = response.data.data
      //     if (response.data && response.data.data) {
      //       this.form = response.data.data
      //       this.showProfile = true
      //       this.getProfiles()
      //     } else {
      //       this.form.email = ''
      //       this.form.password = ''
      //       this.form.to_email = ''
      //       this.form.host = ''
      //       this.form.port = ''
      //       this.form.secure = false
      //       this.form.sender_email = ''
      //     }
      //   })
      this.$store
        .dispatch(get, request)
        .then((response) => {
          if (response && response.data) {
            this.form = response.data
            this.showProfile = true
            this.getProfiles()
          } else {
            this.form.email = ''
            this.form.password = ''
            this.form.to_email = ''
            this.form.host = ''
            this.form.port = ''
            this.form.secure = false
            this.form.sender_email = ''
          }
        })
        .catch((e) => {
          console.log(e)
        })
    },
    getProfiles () {
      var request = {
        data: {},
        url: 'profile/getdata'
      }
      this.$store
        .dispatch(post, request)
        .then((response) => {
          if (response) {
            this.profiles = response.data
          }
        })
        .catch((e) => {
          console.log(e)
        })
    },
    profileUpdate (status, id) {
      var request = {
        data: {setting_id: id, status: status},
        url: 'email/save/setting'
      }
      this.$store
        .dispatch(post, request)
        .then((response) => {
          if (response) {
            this.getProfiles()
          }
          // this.profiles = response.data
        })
        .catch((e) => {
          console.log(e)
        })
    }
  }
}
</script>
<style>
</style>
