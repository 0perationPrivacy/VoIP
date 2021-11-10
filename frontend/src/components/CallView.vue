<template>
    <div>
        <b-button id="incomingCallModel" v-b-modal.modal-tall style="display:none">Launch demo modal</b-button>
        <b-modal ref="modal-tall" class="test-modal" id="modal-tall" hide-footer>
          <template #modal-header="{ close }">
            <!-- Emulate built in modal header close button action -->
            <b-button v-bind:class="{ 'd-none': connection }" size="sm" variant="outline-danger" @click="close()">
              Close
            </b-button>
          </template>
          <template #default="{ hide }">
            <div class="d-flex justify-content-center">
                <div v-if="!incoming" style="max-width:300px">
                    <v-select class="mb-2" v-model="selectedContact" @option:selected="contactChangeEvent($event)" :options="searchContacts"></v-select>
                    <b-form-group id="input-group-1" style="margin-bottom: 0;">
                      <b-form-input class="chat-input" id="dailer_number" v-model="number" type="number" required style="" ></b-form-input>
                    </b-form-group>
                    <div v-if="!connection">
                      <div class="d-flex justify-content-between mt-4">
                        <div>
                          <a class="btn btn-light-primary dialer-btn2" @click="clickDailer(1)">
                            <p class="number font-weight-bolder mb-0">1</p>
                            <p class="alpha hide"></p>
                          </a>
                        </div>
                        <div>
                          <a class="btn btn-light-primary dialer-btn2" @click="clickDailer(2)">
                            <p class="number font-weight-bolder mb-0">2</p>
                            <p class="alpha">abc</p>
                          </a>
                        </div>
                        <div>
                          <a class="btn btn-light-primary dialer-btn2" @click="clickDailer(3)">
                            <p class="number font-weight-bolder">3</p>
                            <p class="alpha">def</p>
                          </a>
                        </div>
                      </div>

                      <div class="d-flex justify-content-between">
                        <div>
                          <a class="btn btn-light-primary dialer-btn2" @click="clickDailer(4)">
                            <p class="number font-weight-bolder">4</p>
                            <p class="alpha">ghi</p>
                          </a>
                        </div>
                        <div>
                          <a class="btn btn-light-primary dialer-btn2" @click="clickDailer(5)">
                            <p class="number font-weight-bolder">5</p>
                            <p class="alpha">jkl</p>
                          </a>
                        </div>
                        <div>
                          <a class="btn btn-light-primary dialer-btn2" @click="clickDailer(6)">
                            <p class="number font-weight-bolder">6</p>
                            <p class="alpha">mno</p>
                          </a>
                        </div>
                      </div>
                      <div class="d-flex justify-content-between">
                        <div>
                          <a class="btn btn-light-primary dialer-btn2" @click="clickDailer(7)">
                            <p class="number font-weight-bolder">7</p>
                            <p class="alpha">pqrs</p>
                          </a>
                        </div>
                          <div>
                            <a class="btn btn-light-primary dialer-btn2" @click="clickDailer(8)">
                              <p class="number font-weight-bolder">8</p>
                              <p class="alpha">tuv</p>
                            </a>
                          </div>
                          <div>
                            <a class="btn btn-light-primary dialer-btn2" @click="clickDailer(9)">
                              <p class="number font-weight-bolder">9</p>
                              <p class="alpha">wxyz</p>
                            </a>
                          </div>
                      </div>

                      <div class="d-flex justify-content-between">
                        <div>
                          <a class="btn btn-light-primary dialer-btn2">
                              <p class="number font-weight-bolder">*</p>
                          </a>
                        </div>
                        <div>
                          <a class="btn btn-light-primary dialer-btn2" @click="clickDailer(0)">
                              <p class="number font-weight-bolder">0</p>
                          </a>
                        </div>
                        <div>
                          <a class="btn btn-light-primary dialer-btn2 ">
                              <p class="number font-weight-bolder">#</p>
                          </a>
                        </div>
                      </div>
                    </div>
                    <div class="dialer-container single_header" v-if="!connection">
                        <ul class="dialer-pad">
                            <center class="mt-4">
                                <button type="button" v-b-tooltip.hover title="Call" class="btn btn-success m-1 px-5" @click="toggleCall()">
                                    <b-icon icon="telephone-outbound" aria-hidden="true"></b-icon>
                                </button>
                                <button type="button" v-b-tooltip.hover title="Delete" class="btn btn-danger m-1 px-5" @click="removeNumber()">
                                    <b-icon icon="backspace" aria-hidden="true"></b-icon>
                                </button>
                            </center>
                        </ul>
                    </div>
                    <div v-else>
                        <div class="dropdown float-right dropleft row m-0"  style="width: 100%" id="call_number">
                        <div class='dialer_bg multiCallData' id='data.call.sid' style='width:100%'>
                            <div class='row dialer_bg p-2'>
                                <div class="d-flex flex-row bd-highlight mb-3 justify-content-center" style="width:100%">
                                <a class="btn btn-icon btn-success mr-3 dialer-btn mt-4">
                                    <button type="button" class="btn btn-success m-1">
                                        <b-icon icon="person-fill" aria-hidden="true"></b-icon>
                                    </button>
                                </a>
                                </div>
                                <div class="d-flex justify-content-center" style="width:100%">
                                    <span class='multiCallData_name'>{{name}}</span>
                                </div>
                                <div class="d-flex justify-content-center" style="width:100%">
                                <span class='multiCallData_name'> {{number}}</span>
                                </div>
                                <div class="d-flex justify-content-center" style="width:100%">
                                <span class='timerContainer font-weight-bold mx-auto float-right mt-2' style='font-size: 45px;color:#4d64bc'><span class='multiCallData_minute' id='data.call.sid'>{{mm}}</span>:<span class='multiCallData_second' id=' data.call.sid'>{{ss}}</span></span>
                                </div>
                            </div>
                            <div class='p-1 mt-5 pt-5'><button @click="callHangup()" class='btn btn-danger multiCallData_hangup w-100' data-id=' number + "' data-sid='data.call.sid+"' data-type='callType+"' style='width: 100%;font-size: 30px;'>Hangup</button>
                            </div>
                        </div>
                        </div>
                    </div>
                </div>
                <div v-else style="max-width:300px">
                <center class="mt-3 pt-3">
                    <div class="pt-4 pb-2">
                        <button type="button" class="btn btn-success m-1">
                            <b-icon icon="person-fill" aria-hidden="true"></b-icon>
                        </button>
                        <p class="font-weight-bold mt-2" style="font-size: 30px;color: #787878;margin-bottom:0;">
                            {{name}}
                        </p>
                        <p class="font-weight-bold" style="font-size: 30px;color: #787878;">
                            {{number}}
                        </p>
                    </div>
                    <h4 class="mb-4">Incoming call</h4>
                    <button type="button" class="btn btn-success m-1" @click="acceptCall()">
                        <b-icon icon="telephone-fill" aria-hidden="true"></b-icon>
                    </button>
                    <button type="button" class="btn btn-danger m-1" @click="rejectedCall()">
                        <b-icon icon="x-circle" aria-hidden="true"></b-icon>
                    </button>
                </center>
                </div>
            </div>
            <b-button style="display:none" @click="hide()">Hide Modal</b-button>
          </template>
        </b-modal>
        <audio id="remoteMedia" autoplay="true" />
    </div>
</template>

<script>
// import Swal from 'sweetalert2'
import { post } from '../core/module/common.module'
import { EventBus } from '@/event-bus'
import { TelnyxRTC } from '@telnyx/webrtc'
import 'vue-select/dist/vue-select.css'
const { Device } = require('twilio-client')
export default {
  props: ['contacts'],
  data () {
    return {
      twilio_number: null,
      number: null,
      call_text: 'test',
      connection: null,
      name: '',
      mm: '00',
      ss: '00',
      incoming: false,
      callType: '',
      newCall: null,
      searchContacts: [],
      device: null,
      selectedContact: ''
    }
  },
  async mounted () {
    this.formatecontact(this.contacts)
    // console.log(this.contacts)
    EventBus.$on('clicked', () => {
      // this.clickHandler()
    })
    // EventBus.$on('clicked', this.clickHandler)
    var tokenData = await this.getToken()
    this.call_text = 'get token'
    this.deviceSetup(tokenData)
  },
  methods: {
    deviceSetup (tokenData) {
      var callPannel = this
      if (tokenData) {
        if (tokenData.type === 'twilio') {
          this.callType = 'twilio'
          Device.setup(tokenData.token)
          Device.incoming(function (connection) {
            callPannel.$refs['modal-tall'].show()
            // document.getElementById('incomingCallModel').click()
            callPannel.connection = connection
            callPannel.number = connection.options.callParameters.From
            callPannel.incoming = true
          })
          Device.connect(function (connection) {
            callPannel.connection = connection
            callPannel.startTimer()
            callPannel.getContact()
          })
          Device.ready(function () {
            console.log('Connected')
            this.call_text = 'Connected'
          })
          Device.disconnect(function (connection) {
            console.log('Awaiting incoming call...')
            this.call_text = 'Awaiting incoming call...'
            callPannel.dissconnected()
          })
          Device.cancel(function (device) {
            callPannel.dissconnected()
            // callPannel.$refs['my-modal'].hide()
          })
          Device.error(function (error) {
            console.log('error')
            console.log(error)
          })
        } else if (tokenData.type === 'telnyx' && tokenData.setting.sip_username && tokenData.setting.sip_password) {
          this.callType = 'telnyx'
          this.client = new TelnyxRTC({
            login: tokenData.setting.sip_username,
            password: tokenData.setting.sip_password
          })
          this.client.connect()
          this.client.remoteElement = 'remoteMedia'
          this.client
            .on('telnyx.ready', () => console.log('ready to call'))
            .on('telnyx.error', () => console.log('error'))
            .on('telnyx.notification', (notification) => {
              const call = notification.call
              if (notification.type === 'callUpdate') {
                callPannel.connection = call
                switch (call.state) {
                  case 'ringing':
                    callPannel.$refs['modal-tall'].show()
                    callPannel.number = call.options.remoteCallerNumber
                    callPannel.incoming = true
                    break
                  case 'active':
                    callPannel.connection = call
                    callPannel.startTimer()
                    callPannel.getContact()
                    break
                  case 'hangup':
                    this.name = ''
                    this.connection = null
                    this.stopTimer()
                    break
                  case 'destroy':
                    this.name = ''
                    this.connection = null
                    break
                }
              }
            })
        }
      }
    },
    clickHandler () {
      this.getSetting()
    },
    getToken () {
      return new Promise(resolve => {
        var profileLocal = JSON.parse(localStorage.getItem('activeProfile'))
        if (profileLocal) {
          // if (profileLocal.type === 'twilio') {
          var messageData = {setting_id: profileLocal._id}
          var request = {
            data: messageData,
            url: 'call/token'
          }
          this.$store
            .dispatch(post, request)
            .then((response) => {
              resolve(response.data)
            })
            .catch((e) => {
              console.log(e)
              resolve(false)
            })
        }
      })
    },
    getContact () {
      var request = {
        url: 'contact/get-one',
        data: {number: this.number}
      }
      this.$store
        .dispatch(post, request)
        .then((response) => {
          if (response && response.data) {
            this.name = response.data.first_name + ' ' + response.data.last_name
          }
        })
        .catch((e) => {
          console.log(e)
        })
    },
    getSetting () {
      var profileLocal = JSON.parse(localStorage.getItem('activeProfile'))
      if (profileLocal) {
        var request = {
          url: 'setting/get-setting',
          data: {setting: profileLocal._id}
        }
        this.$store
          .dispatch(post, request)
          .then(async (response) => {
            if (response.data) {
              localStorage.setItem('activeProfile', JSON.stringify(response.data))
              this.distroyDevice()
              this.distroyDeviceTelnyx()
              // .destroy()
              var tokenData = await this.getToken()

              this.deviceSetup(tokenData)
            }
          })
          .catch((e) => {
            console.log(e)
          })
      }
    },
    makeCall (number) {
      this.muted = false
      this.onPhone = true
      this.number = number
      var n = number.replace(/\D/g, '')
      var profileLocal = JSON.parse(localStorage.getItem('activeProfile'))
      if (this.callType === 'twilio') {
        this.connection = Device.connect({ number: n, twilio_number: profileLocal.number })
      } else {
        this.newCall = this.client.newCall({
          destinationNumber: n,
          callerNumber: profileLocal.number
        })
      }
      this.call_text = 'Calling ' + n
      this.$refs['modal-tall'].show()
    },
    acceptCall () {
      if (this.callType === 'twilio') {
        this.connection.accept()
      } else {
        this.connection.answer()
      }
      this.incoming = false
    },
    rejectedCall () {
      if (this.callType === 'twilio') {
        if (this.connection) {
          this.connection.reject()
        }
        Device.disconnectAll()
      } else {
        // this.connection.hangup()
        this.dissconnected()
      }
      this.connection = null
      this.incoming = false
    },
    toggleCall: function () {
      this.muted = false
      this.onPhone = true
      var n = this.number.replace(/\D/g, '')
      var profileLocal = JSON.parse(localStorage.getItem('activeProfile'))
      if (this.callType === 'twilio') {
        this.connection = Device.connect({ number: n, twilio_number: profileLocal.number })
      } else {
        this.newCall = this.client.newCall({
          destinationNumber: n,
          callerNumber: profileLocal.number
        })
      }
      // this.connection = Device.connect({ number: n, twilio_number: profileLocal.number })
      this.call_text = 'Calling ' + n
      // this.$refs['modal-tall'].show()
    },
    startTimer () {
      var value = 0
      var callPannel = this
      this.userDuration = setInterval(function () {
        // eslint-disable-next-line no-unused-vars
        var h = parseInt(value / 3600)
        var m = parseInt(value / 60)
        var s = value % 60
        h = h < 10 ? '0' + h : h
        callPannel.mm = m < 10 ? '0' + m : m
        callPannel.ss = s < 10 ? '0' + s : s
        value++
      }, 1000)
    },
    stopTimer () {
      this.mm = '00'
      this.ss = '00'
      clearInterval(this.userDuration)
    },
    dissconnected () {
      this.stopTimer()
      if (this.callType === 'twilio') {
        Device.disconnectAll()
      } else {
        this.connection.hangup()
      }
      this.name = ''
      this.connection = null
    },
    callHangup () {
      this.dissconnected()
    },
    clickDailer (number) {
      if (this.number) {
        var num1 = this.number
        this.number = num1.toString() + number.toString()
      } else {
        this.number = number
      }
    },
    removeNumber () {
      this.number = this.number.slice(0, -1)
    },
    contactChangeEvent (e) {
      this.number = e.code.replace('+', '')
      this.selectedContact = ''
    },
    distroyDevice () {
      // console.log('device disconnected')
      try {
        Device.destroy()
      } catch (error) {
        console.log(error)
      }
    },
    distroyDeviceTelnyx () {
      try {
        this.client.disconnect()
      } catch (error) {

      }
    },
    formatecontact (contacts) {
      var arrContact = []
      for (var i = 0; i < contacts.length; i++) {
        var contact = {label: `${contacts[i].first_name} ${contacts[i].last_name}`, code: contacts[i].number}
        arrContact.push(contact)
      }
      this.searchContacts = arrContact
    }
  },
  watch: {
    contacts: function (newVal, oldVal) {
      this.formatecontact(newVal)
    }
  },
  beforeDestroy: function () {
    var profileLocal = JSON.parse(localStorage.getItem('activeProfile'))
    if (profileLocal) {
      if (profileLocal.type === 'telnyx') {
        this.distroyDeviceTelnyx()
      }
      if (profileLocal.type === 'twilio') {
        this.distroyDevice()
      }
    }
  }
}
</script>
<style scoped>
  .number{
    margin-bottom: 0px;
    font-size: 40px;
    line-height: 30px;
  }
    .dialer-container {
        display: block;
        width: 100%;
        left: 0;
        right: 0;
        margin: 0 auto;
    }

    .dialer-pad {
        text-align: center;
        letter-spacing: -0.31em;
        display: inline-block;
        margin: 0;
        padding: 0;
        width: 100%;
    }

    .dialer-pad li {
        list-style: none;
        display: inline-block;
        width: 33.33%;
        letter-spacing: normal;
        padding: 22px 0 0px 0;
    }

    .dialer-pad li .number {
        margin-bottom: 0px;
        font-size: 40px;
        line-height: 30px;
    }
    .alpha {
        margin-bottom: auto;
    }
    .dialer-pad li .alpha {
        margin-bottom: 0;
        font-size: 15px;
    }

    .dialer-pad li .alpha.hide {
        visibility: hidden;
    }

    .dialer-pad li.action-btn {
        /*background: #fff;
        border: 1px solid #62a754;
        border-radius: 50%;
        margin: 0 25px;
        width: 20%;
        padding: 12px 0;*/
        background: #fff;
        border: 1px solid #62a754;
        border-radius: 50%;
        margin: 40px 25px 0;
        width: 65px;
        padding: 0;
        height: 65px;
        vertical-align: middle;
        line-height: 65px;
    }

    .dialer-pad li.action-btn img {
        display: inline-block;
        width: auto;
        vertical-align: middle;
    }

    .dialer-pad li.action-btn p {
        display: inline-block;
        margin-bottom: 0;
        letter-spacing: normal;
        line-height: 50px;
    }
</style>
