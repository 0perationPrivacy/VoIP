<template>
    <div class="p-1">
        <!-- @submit.prevent="handleSubmit2" -->
        <form @submit.prevent="handleSubmit" class="ml-2 mr-2">
            <div class="form-group mt-2">
                <input class="form-control" name="api_key" v-model="form.api_key" placeholder="Enter API key" :class="{ 'is-invalid': submitted3 && $v.form.api_key.$error }" />
                <div v-if="submitted3 && $v.form.api_key.$error" class="invalid-feedback">
                    <span v-if="!$v.form.api_key.required">api key is required</span>
                </div>
            </div>
            <div class="form-group mt-2">
                <input class="form-control" name="sender_id" v-model="form.sender_id" placeholder="Enter verified Sender Id" :class="{ 'is-invalid': submitted3 && $v.form.sender_id.$error }" />
                <div v-if="submitted3 && $v.form.sender_id.$error" class="invalid-feedback">
                    <span v-if="!$v.form.sender_id.required">Verify Sender id is required</span>
                    <span v-if="!$v.form.sender_id.email">Please enter valid Verify Sender id</span>
                </div>
            </div>
             <div class="form-group mt-2">
                <input class="form-control" name="to_email" v-model="form.to_email" placeholder="Enter To Email" :class="{ 'is-invalid': submitted3 && $v.form.to_email.$error }" />
                <div v-if="submitted3 && $v.form.to_email.$error" class="invalid-feedback">
                    <span v-if="!$v.form.to_email.required">To Email is required</span>
                    <span v-if="!$v.form.to_email.email">Please enter valid To Email</span>
                </div>
            </div>
            <div class="form-group">
                <button class="btn btn-success mt-2" type="submit">Save</button>
            </div>
        </form>
        <hr>
        <div v-if="showProfile">
          <div class="form-group mt-2">
            <b-form-checkbox  v-for="profile in profiles" :key="profile._id"
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
        api_key: '',
        sender_id: '',
        to_email: ''
      },
      submitted3: false,
      showProfile: false,
      profiles: []
    }
  },
  validations: {
    form: {
      api_key: {required},
      sender_id: {required, email},
      to_email: {required, email}
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
          console.log(response)
          this.getEmailSetting()
          // this.profiles = response.data
        })
        .catch((e) => {
          console.log(e)
        })
    },
    getEmailSetting () {
      var request = {
        url: 'email/get'
      }
      this.$store
        .dispatch(get, request)
        .then((response) => {
          console.log(response)
          if (response.data) {
            this.form.api_key = response.data.api_key
            this.form.sender_id = response.data.sender_id
            this.form.to_email = response.data.to_email
            this.showProfile = true
            this.getProfiles()
          } else {
            this.form.api_key = ''
            this.form.sender_id = ''
            this.form.to_email = ''
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
          console.log(response)
          this.profiles = response.data
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
          this.getProfiles()
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
