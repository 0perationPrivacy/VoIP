<template>
    <div class="p-2">
      <div v-if="activeMenu == 'setting'">
        <ul class="list-group">
          <li class="list-group-item" @click="enableMenu('twiml')" style="cursor: pointer">
            <b-icon icon="gear-fill" font-scale="1" aria-hidden="true" class="mx-2"></b-icon>TwiML Setting
          </li>
          <li class="list-group-item" @click="enableMenu('number')" style="cursor: pointer">
            <b-icon icon="telephone" font-scale="1" aria-hidden="true" class="mx-2"></b-icon>Number Setting
          </li>
        </ul>
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
        <twiml-setting></twiml-setting>
      </div>
      <div v-if="activeMenu == 'number'">
        <div class="d-flex justify-content-between">
          <div class="p-2 bd-highlight">
            <h6>Number Setting</h6>
          </div>
          <div class="p-2 bd-highlight">
            <b-icon icon="arrow-left" style="cursor: pointer" font-scale="1" aria-hidden="true" @click="enableMenu('setting')"></b-icon>
          </div>
        </div>
        <twilio-number-setting></twilio-number-setting>
      </div>
    </div>
</template>
<script>
import TwilioNumberSetting from './TwilioNumberSetting.vue'
import TwimlSetting from './TwimlSetting.vue'
export default {
  components: { TwilioNumberSetting, TwimlSetting },
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
