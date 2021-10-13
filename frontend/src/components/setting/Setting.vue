<template>
    <div>
        <button class="btn btn-primary other-css btn-circle btn-md" v-b-toggle.sidebar-email-setting>
            <b-icon icon="gear-fill" aria-hidden="true"></b-icon>
        </button>
        <b-sidebar id="sidebar-email-setting" title="Setting" shadow>
            <div class="px-3 py-2" v-if="activeMenu == 'setting'">
              <ul class="list-group">
                <li class="list-group-item" @click="enableMenu('email')" style="cursor: pointer">Email Setting</li>
                <li class="list-group-item" @click="enableMenu('call')" style="cursor: pointer">Call Setting</li>
              </ul>
            </div>
            <div v-if="activeMenu == 'email'">
              <div class="d-flex justify-content-between">
                <div>
                  <h4>Email Setting</h4>
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
                  <h4>Call Setting</h4>
                </div>
                <div class="p-2 bd-highlight">
                  <b-icon icon="arrow-left" style="cursor: pointer" font-scale="2" aria-hidden="true" @click="enableMenu('setting')"></b-icon>
                </div>
              </div>
              <call-setting></call-setting>
            </div>
        </b-sidebar>
    </div>
</template>
<script>
import EmailSetting from './EmailSetting.vue'
import CallSetting from './CallSetting.vue'
export default {
  components: { EmailSetting, CallSetting },
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
.other-css{
    position: absolute;
    bottom: 60px;
    right: 15px;
}
.btn-circle.btn-md {
    width: 50px;
    height: 50px;
    padding: 7px 10px;
    border-radius: 25px;
    font-size: 10px;
    text-align: center;
}
</style>
