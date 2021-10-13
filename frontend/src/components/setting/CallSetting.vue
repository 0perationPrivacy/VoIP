<template>
    <div class="p-1">
        <form @submit.prevent="handleSubmit" class="ml-2 mr-2" v-if="setting && setting.type === 'twilio'">
            <div class="form-group mt-2">
                <input class="form-control" name="app_key" v-model="form.app_key" placeholder="Enter app key" :class="{ 'is-invalid': submitted3 && $v.form.app_key.$error }" />
                <div v-if="submitted3 && $v.form.app_key.$error" class="invalid-feedback">
                    <span v-if="!$v.form.app_key.required">app key is required</span>
                </div>
            </div>
            <div class="form-group mt-2">
                <input class="form-control" name="app_secret" v-model="form.app_secret" placeholder="Enter App Secret" :class="{ 'is-invalid': submitted3 && $v.form.app_secret.$error }" />
                <div v-if="submitted3 && $v.form.app_secret.$error" class="invalid-feedback">
                    <span v-if="!$v.form.app_secret.required">App Secret is required</span>
                </div>
            </div>
             <div class="form-group mt-2">
                <input class="form-control" name="twiml_app" v-model="form.twiml_app" placeholder="Enter TWIML APP" :class="{ 'is-invalid': submitted3 && $v.form.twiml_app.$error }" />
                <div v-if="submitted3 && $v.form.twiml_app.$error" class="invalid-feedback">
                    <span v-if="!$v.form.twiml_app.required">TWIML App is required</span>
                </div>
            </div>
            <div class="form-group">
                <button class="btn btn-success mt-2" type="submit">Save</button>
            </div>
        </form>
        <div v-if="setting && setting.type === 'telnyx'">
          <h4>Telynx Comming soon</h4>
        </div>
    </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import { post } from '../../core/module/common.module'
export default {
  data () {
    return {
      form: {
        app_key: '',
        app_secret: '',
        twiml_app: ''
      },
      submitted3: false,
      setting: null
    }
  },
  validations: {
    form: {
      app_key: {required},
      app_secret: {required},
      twiml_app: {required}
    }
  },
  mounted: function () {
    this.getCallSetting()
  },
  methods: {
    handleSubmit (e) {
      this.submitted3 = true
      this.$v.$touch()
      if (this.$v.$invalid) {
        return
      }
      var profileLocal = localStorage.getItem('activeProfile')
      if (profileLocal) {
        var activeProfile = JSON.parse(profileLocal)
        var callSetting = this.form
        callSetting.setting_id = activeProfile._id
        var request = {
          data: callSetting,
          url: 'call/setting'
        }
        this.$store
          .dispatch(post, request)
          .then((response) => {
            this.getCallSetting()
          })
          .catch((e) => {
            console.log(e)
          })
      }
    },
    getCallSetting () {
      var profileLocal = localStorage.getItem('activeProfile')
      if (profileLocal) {
        var activeProfile = JSON.parse(profileLocal)
        var request = {
          url: 'call/setting/get',
          data: {setting_id: activeProfile._id}
        }
        this.$store
          .dispatch(post, request)
          .then((response) => {
            if (response.data) {
              this.setting = response.data
              if (response.data.app_key) {
                this.form.app_key = response.data.app_key
              } else {
                this.form.app_key = ''
              }

              if (response.data.app_secret) {
                this.form.app_secret = response.data.app_secret
              } else {
                this.form.app_secret = ''
              }

              if (response.data.twiml_app) {
                this.form.twiml_app = response.data.twiml_app
              } else {
                this.form.twiml_app = ''
              }
            } else {
              this.form.app_key = ''
              this.form.app_secret = ''
              this.form.twiml_app = ''
            }
          })
          .catch((e) => {
            console.log(e)
          })
      }
    },
    deleteSetting () {
      var profileLocal = localStorage.getItem('activeProfile')
      if (profileLocal) {
        var activeProfile = JSON.parse(profileLocal)
        var request = {
          url: 'call/setting/delete',
          data: {setting_id: activeProfile._id}
        }
        this.$store
          .dispatch(post, request)
          .then((response) => {
            this.callSetting()
          })
          .catch((e) => {
            console.log(e)
          })
      }
    }
  }
}
</script>
