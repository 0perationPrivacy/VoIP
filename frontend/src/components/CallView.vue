<template>
    <div>
        <b-modal id="modal-tall" hide-footer>
            <div class="d-flex justify-content-center">
                <div v-if="!incoming" style="max-width:300px">
                    <b-form-group id="input-group-1" style="margin-bottom: 0;">
                    <b-form-input id="dailer_number" v-model="number" type="number" required style="" ></b-form-input>
                  </b-form-group>
                    <div class="dialer-container single_header" v-if="!connection">
                        <ul class="dialer-pad">
                            <li>
                                <a class="btn btn-light-primary mr-1 dialer-btn2" @click="clickDailer(1)">
                                <p class="number font-weight-bolder">1</p>
                                <p class="alpha hide">abc</p>
                                </a>
                            </li>
                            <li>
                            <a class="btn btn-light-primary mr-1 dialer-btn2" @click="clickDailer(2)">
                                <p class="number font-weight-bolder">2</p>
                                <p class="alpha">abc</p>
                            </a>
                            </li>
                            <li>
                                <a class="btn btn-light-primary mr-1 dialer-btn2" @click="clickDailer(3)">
                                <p class="number font-weight-bolder">3</p>
                                <p class="alpha">def</p>
                                </a>
                            </li>
                            <li>
                            <a class="btn btn-light-primary mr-1 dialer-btn2" @click="clickDailer(4)">
                                <p class="number font-weight-bolder">4</p>
                                <p class="alpha">ghi</p>
                            </a>
                            </li>
                            <li>
                            <a class="btn btn-light-primary mr-1 dialer-btn2" @click="clickDailer(5)">
                                <p class="number font-weight-bolder">5</p>
                                <p class="alpha">jkl</p>
                            </a>
                            </li>
                            <li>
                            <a class="btn btn-light-primary mr-1 dialer-btn2" @click="clickDailer(6)">
                                <p class="number font-weight-bolder">6</p>
                                <p class="alpha">mno</p>
                            </a>
                            </li>
                            <li>
                            <a class="btn btn-light-primary mr-1 dialer-btn2" @click="clickDailer(7)">
                                <p class="number font-weight-bolder">7</p>
                                <p class="alpha">pqrs</p>
                            </a>
                            </li>
                            <li>
                            <a class="btn btn-light-primary mr-1 dialer-btn2" @click="clickDailer(8)">
                                <p class="number font-weight-bolder">8</p>
                                <p class="alpha">tuv</p>
                            </a>
                            </li>
                            <li>
                            <a class="btn btn-light-primary mr-1 dialer-btn2" @click="clickDailer(9)">
                                <p class="number font-weight-bolder">9</p>
                                <p class="alpha">wxyz</p>
                            </a>
                            </li>
                            <li>
                            <a class="btn btn-light-primary mr-1 dialer-btn2">
                                <p class="number font-weight-bolder">*</p>
                            </a>
                            </li>
                            <li>
                            <a class="btn btn-light-primary mr-1 dialer-btn2" @click="clickDailer(0)">
                                <p class="number font-weight-bolder">0</p>
                            </a>
                            </li>
                            <li>
                            <a class="btn btn-light-primary mr-1 dialer-btn2 ">
                                <p class="number font-weight-bolder">#</p>
                            </a>
                            </li>
                            <center class="mt-4">
                                <button type="button" class="btn btn-success m-1" @click="toggleCall()">
                                    <b-icon icon="telephone-outbound" aria-hidden="true"></b-icon>
                                </button>
                                <button type="button" class="btn btn-danger m-1" @click="callHangup()">
                                    <b-icon icon="x-circle" aria-hidden="true"></b-icon>
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
                        <b-icon icon="person-fill" aria-hidden="true"></b-icon>
                    </button>
                    <button type="button" class="btn btn-danger m-1" @click="rejectedCall()">
                        <b-icon icon="x-circle" aria-hidden="true"></b-icon>
                    </button>
                </center>
                </div>
            </div>
        </b-modal>
    </div>
</template>

<script>
import Swal from 'sweetalert2'
import { post } from '../core/module/common.module'
const { Device } = require('twilio-client')
export default {
  data () {
    return {
      tabIndex: 0,
      twilio_number: null,
      number: null,
      call_text: 'test',
      connection: null,
      name: '',
      twilio_numbers: [],
      userDuration2: null,
      mm: '00',
      ss: '00',
      auth_user: null,
      incoming: false,
      activePanel: false,
      headers: null,
      campaigns: [],
      campaign: null,
      leads: [],
      laravelData: {},
      selectedCampaign: false,
      startCall: false,
      activePage: 1,
      activeCallLead: 0,
      activeNumberIndex: 0,
      form: {
        firstname: '',
        lastname: '',
        email: '',
        mobilenumber: '',
        address: ''
      }
    }
  },
  async mounted () {
    var tokenData = await this.getToken()
    this.call_text = 'get token'
    var callPannel = this
    if (tokenData) {
      Device.setup(tokenData)
      Device.incoming(function (connection) {
        callPannel.$refs['my-modal'].show()
        callPannel.activePanel = true
        callPannel.connection = connection
        callPannel.number = connection.options.callParameters.From
        callPannel.incoming = true
      })
      Device.connect(function (connection) {
        console.log(connection)
        callPannel.connection = connection
        callPannel.startTimer()
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
        callPannel.$refs['my-modal'].hide()
      })
    }
  },
  methods: {
    getToken () {
      return new Promise(resolve => {
        var profileLocal = localStorage.getItem('activeProfile')
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
        /* setTimeout(() => {
          resolve('resolved')
        }, 10000) */
      })
    },
    showModal () {
      this.$refs['my-modal'].show()
    },
    hideModal () {
      this.$refs['my-modal'].hide()
    },
    startCampaignCall () {
      this.startCall = true
      var data = {user_id: this.auth_user.id, campaign_id: this.campaign}
      // eslint-disable-next-line no-undef
      axios.post(process.env.MIX_BASE_URL + 'api/get-campaign-lead', data, this.headers)
        .then(response => {
          if (response.data.data) {
            this.activeCallLead = response.data.data.id
            this.number = response.data.data.mobilenumber
            this.toggleCall()
          } else {
            // eslint-disable-next-line no-undef
            Swal.fire(
              'Call!',
              'Lead not found.',
              'error'
            )
            this.activeCallLead = ''
            this.number = ''
            this.startCall = false
          }
        })
    },
    stopCampaignCall () {
      this.startCall = false
    },
    getContacts (page = 1) {
      this.activePage = page
      this.selectedCampaign = true
      var data = {user_id: this.auth_user.id, campaign_id: this.campaign}
      // eslint-disable-next-line no-undef
      axios.post(process.env.MIX_BASE_URL + 'api/get-campaign-data?page=' + page, data, this.headers)
        .then(response => {
          this.laravelData = response.data.data
        })
    },
    getNumbers () {
      var data = {user_id: this.auth_user.id}
      // eslint-disable-next-line no-undef
      axios.post(process.env.MIX_BASE_URL + 'api/get-call-numbers', data, this.headers)
        .then(response => {
          if (response.data.data) {
            var i = 0
            response.data.data.forEach((element, index) => {
              this.twilio_numbers.push({text: element.sysnumber, value: element.sysnumber})
              if (i === 0) {
                this.twilio_number = element.sysnumber
                this.activeNumberIndex = i
              }
              i++
            })
          }
        })
    },
    getCampaign () {
      var data = {user_id: this.auth_user.id}
      // eslint-disable-next-line no-undef
      axios.post(process.env.MIX_BASE_URL + 'api/get-user-campaign', data, this.headers)
        .then(response => {
          if (response.data.data) {
            response.data.data.forEach(element => {
              this.campaigns.push({text: element.name, value: element.id})
            })
          }
        })
    },
    pannelClose () {
      this.activePanel = false
    },
    acceptCall () {
      console.log(this.number)
      this.connection.accept()
      this.incoming = false
      this.$refs['my-modal'].hide()
      this.openLeadDetails()
    },
    openLeadDetails () {
      // eslint-disable-next-line no-undef
      axios.post(process.env.MIX_BASE_URL + 'api/get-lead', {number: this.number}, this.headers)
        .then(response => {
          if (response.data.data) {
            this.form = response.data.data
            this.$refs['my-modal2'].show()
          }
        })
    },
    rejectedCall () {
      if (this.connection) {
        this.connection.reject()
      }
      this.connection = null
      Device.disconnectAll()
      this.incoming = false
      this.$refs['my-modal'].hide()
    },
    toggleCall: function () {
      this.muted = false
      this.onPhone = true
      var n = this.number.replace(/\D/g, '')
      this.connection = Device.connect({ number: n, twilio_number: this.twilio_number, user_id: this.auth_user.id })
      this.call_text = 'Calling ' + n
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
      this.connection = null
      this.stopTimer()
      Device.disconnectAll()
      this.activeCallLead = null
      this.getContacts(this.activePage)
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
    }
  }
}
</script>
<style scoped>
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
