<template>
    <div>
        <b-icon font-scale="1" icon="gear-fill" aria-hidden="true" class="m-2" title="Settings" style="cursor:pointer;" v-b-toggle.sidebar-email-setting></b-icon>
        <b-sidebar id="sidebar-email-setting" title="Settings" shadow backdrop>
            <div class="px-3 py-2" v-if="activeMenu == 'setting'">
              <ul class="list-group">
                <li class="list-group-item" @click="enableMenu('email')" style="cursor: pointer">
                  <b-icon icon="envelope" font-scale="1" aria-hidden="true" class="mx-2"></b-icon>Email Settings</li>
                <!-- <li class="list-group-item" @click="enableMenu('call')" style="cursor: pointer">
                  <b-icon icon="telephone-x" font-scale="1" aria-hidden="true" class="mx-2"></b-icon>Call Settings</li> -->
                <li class="list-group-item" v-b-modal.modal-1 style="cursor: pointer">
                  <b-icon icon="person-badge" font-scale="1" aria-hidden="true" class="mx-2"></b-icon>Profile Settings
                </li>
                <li class="list-group-item" @click="enableMenu('account')" style="cursor: pointer">
                  <b-icon icon="person" font-scale="1" aria-hidden="true" class="mx-2"></b-icon>Account Settings
                </li>
                <!-- <li class="list-group-item" @click="enableMenu('password')" style="cursor: pointer">
                  <b-icon icon="key" font-scale="1" aria-hidden="true" class="mx-2"></b-icon>Change Password
                </li> -->
              </ul>
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
        </b-sidebar>
    </div>
</template>
<script>
import EmailSetting from './EmailSetting.vue'
import CallSetting from './CallSetting.vue'
import AccountSetting from './account/AccountSetting.vue'
export default {
  components: { EmailSetting, CallSetting, AccountSetting },
  data () {
    return {
      activeMenu: 'setting'
    }
  },
  mounted: function () {},
  methods: {
    enableMenu (menu) {
      this.activeMenu = menu
    }
  }
}
</script>
<style>

</style>
