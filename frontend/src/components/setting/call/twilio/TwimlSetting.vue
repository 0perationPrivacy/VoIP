<template>
    <div class="py-1 px-2">
        <form @submit.prevent="handleSubmit" class="ml-2 mr-2">
          <div class="form-group mt-2">
            <label>Request URL</label>
            <input class="form-control main-url-control" name="main_url" v-model="form.main_url" readonly />
          </div>
          <div class="form-group mt-2">
            <label>Fallback URL</label>
            <input class="form-control" name="url" v-model="form.url" placeholder="Enter Fallback Url" :class="{ 'is-invalid': submitted3 && $v.form.url.$error }" />
            <div v-if="submitted3 && $v.form.url.$error" class="invalid-feedback">
                <span v-if="!$v.form.url.required">Twiml Fallback Url Is Required</span>
                <span v-if="!$v.form.url.url">Please enter valid Twiml Fallback Url</span>
                <!-- <span v-if="!$v.form.email.email">Please enter valid email</span> -->
            </div>
          </div>
          <div class="form-group">
            <button class="btn btn-success mt-2" type="submit">Update</button>
          </div>
        </form>
    </div>
</template>
<script>
import { post } from '../../../../core/module/common.module'
import { required, helpers } from 'vuelidate/lib/validators'
// eslint-disable-next-line no-useless-escape
const url = helpers.regex('phonenumber', /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/)

export default {
  data () {
    return {
      form: {
        url: '',
        main_url: ''
      },
      submitted3: false,
      setting: null
    }
  },
  validations: {
    form: {
      url: { required, url }
    }
  },
  mounted: function () {
    this.getCallSetting()
  },
  methods: {
    getCallSetting () {
      var profileLocal = localStorage.getItem('activeProfile')
      if (profileLocal) {
        var activeProfile = JSON.parse(profileLocal)
        this.setting = activeProfile._id
        var request = {
          data: {setting_id: this.setting},
          url: 'setting/twilio/twiml/get'
        }
        this.$store
          .dispatch(post, request)
          .then((response) => {
            const url = new URL(response.data.voiceUrl)
            var urlhost = url.hostname
            var protocol = url.protocol
            this.form.main_url = `${protocol}//${urlhost}`
            if (response.data.voiceFallbackUrl) {
              const url2 = new URL(response.data.voiceFallbackUrl)
              var urlhost2 = url2.hostname
              var protocol2 = url2.protocol
              this.form.url = `${protocol2}//${urlhost2}`
            }
          })
          .catch((e) => {
            console.log(e)
          })
        // this.setting = activeProfile
      }
    },

    handleSubmit (e) {
      this.submitted3 = true
      // stop here if form is invalid
      this.$v.$touch()
      if (this.$v.$invalid) {
        return
      }
      var data = this.form
      data.setting_id = this.setting
      var request = {
        data: data,
        url: 'setting/twilio/twiml/fallback'
      }
      // eslint-disable-next-line no-undef
      this.$store
        .dispatch(post, request)
        .then((data) => {
          this.$swal({
            icon: 'success',
            title: 'Success',
            text: 'TwiML Setting updated successfully!'
          })
          this.getCallSetting()
        })
        .catch((e) => {
          console.log(e)
        })
    }
  }
}
</script>

<style scoped>
  .main-url-control[readonly]{
    background: white !important;
  }
</style>
