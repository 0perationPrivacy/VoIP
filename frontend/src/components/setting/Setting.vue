<template>
  <div>
      <b-icon font-scale="1" icon="gear-fill" aria-hidden="true" class="m-2" title="Settings" style="cursor:pointer;" v-b-toggle.sidebar-email-setting></b-icon>
      <b-sidebar id="sidebar-email-setting" title="Settings" shadow backdrop>
          <div class="px-3 py-2" v-if="activeMenu == 'setting'">
            <ul class="list-group">
              <li class="list-group-item" @click="enableMenu('email')" style="cursor: pointer">
                <b-icon icon="envelope" font-scale="1" aria-hidden="true" class="mx-2"></b-icon>Email Settings</li>
              <!--<li class="list-group-item" @click="enableMenu('call')" style="cursor: pointer">
                <b-icon icon="telephone-x" font-scale="1" aria-hidden="true" class="mx-2"></b-icon>Call Settings</li> -->
              <li class="list-group-item" v-b-modal.modal-1 style="cursor: pointer">
                <b-icon icon="person-badge" font-scale="1" aria-hidden="true" class="mx-2"></b-icon>Profile Settings
              </li>
              <li class="list-group-item" @click="enableMenu('account')" style="cursor: pointer">
                <b-icon icon="person" font-scale="1" aria-hidden="true" class="mx-2"></b-icon>Account Settings
              </li>
              <li class="list-group-item" @click="passwordEnable('mfa')" style="cursor: pointer">
                <b-icon icon="shield-lock" font-scale="1" aria-hidden="true" class="mx-2"></b-icon>MFA Settings
              </li>
            </ul>
            <div class="version">{{ versionOption }}</div>
          </div>
          <div v-if="activeMenu == 'email'">
            <div class="d-flex justify-content-between">
              <div>
                <h4>Email Settings</h4>
              </div>
              <div class="p-2 bd-highlight">
                <b-icon icon="arrow-left" style="cursor: pointer" font-scale="2" aria-hidden="true" @click="enableMenu('setting')"></b-icon>
              </div>
            </div>
            <email-setting></email-setting>
          </div>

          <div v-if="activeMenu == 'call'">
            <div class="d-flex justify-content-between">
              <div class="p-2 bd-highlight">
                <h4>Call Settings</h4>
              </div>
              <div class="p-2 bd-highlight">
                <b-icon icon="arrow-left" style="cursor: pointer" font-scale="2" aria-hidden="true" @click="enableMenu('setting')"></b-icon>
              </div>
            </div>
            <call-setting></call-setting>
          </div>
          <div v-if="activeMenu == 'profile'">
            <div class="d-flex justify-content-between">
              <div class="p-2 bd-highlight">
                <h4>Profile Settings</h4>
              </div>
              <div class="p-2 bd-highlight">
                <b-icon icon="arrow-left" style="cursor: pointer" font-scale="2" aria-hidden="true" @click="enableMenu('setting')"></b-icon>
              </div>
            </div>
            Profile settings
          </div>

          <div v-if="activeMenu == 'account'">
            <div class="d-flex justify-content-between">
              <div class="p-2 bd-highlight">
                <h4>Account Settings</h4>
              </div>
              <div class="p-2 bd-highlight">
                <b-icon icon="arrow-left" style="cursor: pointer" font-scale="2" aria-hidden="true" @click="enableMenu('setting')"></b-icon>
              </div>
            </div>
            <div>
              <account-setting></account-setting>
            </div>
          </div>

          <div v-if="activeMenu == 'mfa'">
            <div class="d-flex justify-content-between">
              <div class="p-2 bd-highlight">
                <h4>MFA Settings</h4>
              </div>
              <div class="p-2 bd-highlight">
                <b-icon icon="arrow-left" style="cursor: pointer" font-scale="2" aria-hidden="true" @click="enableMenu('setting')"></b-icon>
              </div>
            </div>
            <div>
              <mfa />
            </div>
          </div>

          <div v-if="activeMenu == 'password'">
            <div class="d-flex justify-content-between">
              <div class="p-2 bd-highlight">
                <h4>Password Verification</h4>
              </div>
              <div class="p-2 bd-highlight">
                <b-icon icon="arrow-left" style="cursor: pointer" font-scale="2" aria-hidden="true" @click="enableMenu('setting')"></b-icon>
              </div>
            </div>
            <div  class="m-2">
              <div class="form-group">
                <label>Password</label>
                <input type="password" class="form-control" v-model="check_password" placeholder="Enter Password" @keyup.enter="checkPassword()">
              </div>
              <div class="text-center">
              <button class="btn btn-success my-2 px-4" @click="checkPassword()">Verify</button>
              </div>
            </div>
          </div>
      </b-sidebar>
  </div>
</template>
<script>
import EmailSetting from './EmailSetting.vue'
import CallSetting from './CallSetting.vue'
import AccountSetting from './account/AccountSetting.vue'
import Mfa from './security/Mfa.vue'
import { post } from '../../core/module/common.module'
// import { post } from '../core/module/common.module'
export default {
components: { EmailSetting, CallSetting, AccountSetting, Mfa },
data () {
  return {
    activeMenu: 'setting',
    versionOption: 'v0',
    checkpasswordMenu: '',
    check_password: ''
  }
},
mounted: function () {
  this.getVersion()
},
methods: {
  enableMenu (menu) {
    this.activeMenu = menu
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

      })
  },
  passwordEnable (menu) {
    this.checkpasswordMenu = menu
    this.enableMenu('password')
  },
  checkPassword () {
    if (this.check_password === '') {
      this.$swal.fire('please enter password', '', 'error')
      return
    }
    var request = {
      data: {password: this.check_password},
      url: 'auth/password/verify'
    }
    this.$store
      .dispatch(post, request)
      .then((response) => {
        if (response) {
          this.check_password = ''
          this.enableMenu(this.checkpasswordMenu)
        }
      })
      .catch((e) => {

      })
  }
}
}
</script>
<style>

</style>
