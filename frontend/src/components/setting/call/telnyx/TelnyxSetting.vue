<template>
    <div class="p-2">
      <!-- <div v-if="activeMenu == 'setting'">
        <ul class="list-group">
          <li class="list-group-item" @click="enableMenu('message')" style="cursor: pointer">
            <b-icon icon="inbox" font-scale="1" aria-hidden="true" class="mx-2"></b-icon>Message Setting
          </li>
          <li class="list-group-item" @click="enableMenu('twiml')" style="cursor: pointer">
            <b-icon icon="gear-fill" font-scale="1" aria-hidden="true" class="mx-2"></b-icon>TeXML Setting
          </li>
          <li class="list-group-item" @click="enableMenu('sip')" style="cursor: pointer">
            <b-icon icon="telephone" font-scale="1" aria-hidden="true" class="mx-2"></b-icon>SIP Setting
          </li>
        </ul>
      </div> -->
      <div>
        <div class="d-flex justify-content-between">
          <!-- <div>
            <h6>Message Setting</h6>
          </div> -->
          <div class="p-2 bd-highlight">
            <b-icon icon="arrow-left" style="cursor: pointer" font-scale="1" aria-hidden="true" @click="enableMenu('setting')"></b-icon>
          </div>
        </div>
        <message-setting></message-setting>
      </div>
      <div v-if="activeMenu == 'twiml'">
        <div class="d-flex justify-content-between">
          <div>
            <h6>TwiML Setting</h6>
          </div>
          <div class="p-2 bd-highlight">
            <b-icon icon="arrow-left" style="cursor: pointer" font-scale="1" aria-hidden="true" @click="enableMenu('setting')"></b-icon>
          </div>
        </div>
        <texml-setting></texml-setting>
      </div>
      <div v-if="activeMenu == 'sip'">
        <div class="d-flex justify-content-between">
          <div class="p-2 bd-highlight">
            <h6>SIP Setting</h6>
          </div>
          <div class="p-2 bd-highlight">
            <b-icon icon="arrow-left" style="cursor: pointer" font-scale="1" aria-hidden="true" @click="enableMenu('setting')"></b-icon>
          </div>
        </div>
        <sip-setting></sip-setting>
      </div>
    </div>
</template>
<script>
import SipSetting from './SipSetting.vue'
import TexmlSetting from './TexmlSetting.vue'
import MessageSetting from './MessageSetting.vue'
// import TwilioNumberSetting from './TwilioNumberSetting.vue'
// import TwimlSetting from './TwimlSetting.vue'
export default {
  components: { SipSetting, TexmlSetting, MessageSetting },
  // components: { TwilioNumberSetting, TwimlSetting },
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
