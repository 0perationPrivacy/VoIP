<template>
    <div class="py-1 px-2">
        <form @submit.prevent="handleSubmit" class="ml-2 mr-2">
          <div class="form-group mt-2">
            <label>A CALL COMES IN</label>
            <input class="form-control main-url-control" name="voice_main_url" v-model="form.voice_main_url" readonly />
          </div>
          <div class="form-group mt-2">
            <label>CALL HANDLER FAILS</label>
            <input class="form-control" name="url" v-model="form.voice_url" placeholder="Enter Twiml Fallback Url" :class="{ 'is-invalid': submitted3 && $v.form.voice_url.$error }" />
            <div v-if="submitted3 && $v.form.voice_url.$error" class="invalid-feedback">
                <span v-if="!$v.form.voice_url.required">Url Is Required</span>
                <span v-if="!$v.form.voice_url.url">Please enter valid Url</span>
                <!-- <span v-if="!$v.form.email.email">Please enter valid email</span> -->
            </div>
          </div>

          <div class="form-group mt-2">
            <label>A MESSAGE COMES IN</label>
            <input class="form-control main-url-control" name="sms_main_url" v-model="form.sms_main_url" readonly />
          </div>
          <div class="form-group mt-2">
            <label>MESSAGE HANDLER FAILS</label>
            <input class="form-control" name="sms_url" v-model="form.sms_url" placeholder="Enter Twiml Fallback Url" :class="{ 'is-invalid': submitted3 && $v.form.sms_url.$error }" />
            <div v-if="submitted3 && $v.form.sms_url.$error" class="invalid-feedback">
                <span v-if="!$v.form.sms_url.required">Url Is Required</span>
                <span v-if="!$v.form.sms_url.url">Please enter valid Url</span>
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
        voice_url: '',
        voice_main_url: '',
        sms_url: '',
        sms_main_url: ''
      },
      submitted3: false,
      setting: null
    }
  },
  validations: {
    form: {
      voice_url: { required, url },
      sms_url: { required, url }
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
          url: 'setting/twilio/number/get'
        }
        this.$store
          .dispatch(post, request)
          .then((response) => {
            console.log(response.data)
            this.form.voice_main_url = response.data.voiceUrl
            this.form.sms_main_url = response.data.smsUrl
            if (response.data.voiceFallbackUrl) {
              this.form.voice_url = response.data.voiceFallbackUrl
            }
            if (response.data.smsFallbackUrl) {
              this.form.sms_url = response.data.smsFallbackUrl
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
        url: 'setting/twilio/number/fallback'
      }
      // eslint-disable-next-line no-undef
      this.$store
        .dispatch(post, request)
        .then((data) => {
          this.$swal({
            icon: 'success',
            title: 'Success',
            text: 'Number Setting updated successfully!'
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
