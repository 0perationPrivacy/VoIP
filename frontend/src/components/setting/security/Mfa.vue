<template>
    <div class="m-2">
      <div class="">
        <div>
          <h6 class="border-bottom mx-1 pb-1">TOTP</h6>
          <div class="card m-1">
            <div class="card-body">
              <div class="row align-items-center">
                <div class="col-auto">
                <div>
                      <input
                        @change="mfaStatusChange"
                        id="checkbox"
                        type="checkbox"
                        class="switch-checkbox"
                        v-model="mfaStatus"
                        />
                        <label for="checkbox" class="switch-label switch-label-mode">
                        <span>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="#198754" width="23" height="23" viewBox="0 0 24 24"><path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm4.393 7.5l-5.643 5.784-2.644-2.506-1.856 1.858 4.5 4.364 7.5-7.643-1.857-1.857z"/></svg>
                        </span>
                        <span>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="#fd3545" width="23" height="23" viewBox="0 0 24 24"><path d="M14 12h-4v-12h4v12zm4.213-10.246l-1.213 1.599c2.984 1.732 5 4.955 5 8.647 0 5.514-4.486 10-10 10s-10-4.486-10-10c0-3.692 2.016-6.915 5-8.647l-1.213-1.599c-3.465 2.103-5.787 5.897-5.787 10.246 0 6.627 5.373 12 12 12s12-5.373 12-12c0-4.349-2.322-8.143-5.787-10.246z"/></svg>
                        </span>
                        <div
                            class="switch-toggle"
                            :class="{ 'switch-toggle-checked': mfaStatus }"
                        ></div>
                        </label>
                  </div>
                </div>
                <div class="col-auto">
              Status: <span v-if="realMfs">Active</span><span v-else>Inactive</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <hr>
      <div v-if="qr" class="text-center">
        <div class="text-center">Scan this QR code</div>
        <div class="text-center">
          <img class="mb-2 qr_image" :src="qr" >
        </div>
        <div class="text-danger text-center">Or Enter Key Manually</div>
        <div class="card">
          <div class="card-body font-monospace clickcopy" @click="copySecret()" >
            {{secret}}
          </div>
        </div>
        <div class="text-secondary text-center" id="clickText">Click On Key To Copy</div>
        <div class="form-group mt-1">
          <label>Enter Verification Code</label>
          <input type="form-control" maxlength="6" v-model="verification_code" placeholder="000000" title="6 Digit Code" class="totp">
        </div>
        <button type="button" @click="verifyStatusCode()" class="btn btn-success m-2 px-4">Verify</button>
      </div>
      <hr>
      <!-- <hardware-key /> -->
    </div>
</template>
<script>
import { post } from '../../../core/module/common.module'
import CallSetting from '../CallSetting.vue'
// import HardwareKey from './HardwareKey.vue'
export default {
  // components: { CallSetting, HardwareKey },
  components: { CallSetting },
  data () {
    return {
      mfaStatus: false,
      realMfs: false,
      qr: null,
      verification_code: '',
      secret: ''
    }
  },
  mounted: function () {
    this.getMfaStatus()
  },
  methods: {
    mfaStatusChange () {
      var status = this.mfaStatus ? 'true' : 'false'
      var request = {
        data: {status: status, qr: 'true'},
        url: 'auth/mfa/save'
      }
      this.$store
        .dispatch(post, request)
        .then((response) => {
          if (response) {
            if (status === 'true') {
              this.qr = response.image
              this.secret = response.secret
            } else {
              this.getMfaStatus()
            }
          }
        })
        .catch((e) => {

        })
    },
    verifyStatusCode () {
      if (this.verification_code === '') {
        this.$swal.fire('Please enter verification code', '', 'error')
        return
      }
      var request = {
        data: {status: 'true', qr: 'false', code: this.verification_code},
        url: 'auth/mfa/save'
      }
      this.$store
        .dispatch(post, request)
        .then((response) => {
          if (response) {
            this.qr = null
            this.verification_code = ''
            this.getMfaStatus()
          }
        })
        .catch((e) => {

        })
    },
    copySecret () {
      try {
        navigator.clipboard.writeText(this.secret)
        const answer = document.getElementById('clickText')
        answer.innerHTML = 'Copied!'
      } catch (err) {
        console.error('Failed to copy!', err)
      }
    },
    getMfaStatus () {
      var request = {
        data: {},
        url: 'auth/user/get'
      }
      this.$store
        .dispatch(post, request)
        .then((response) => {
          var trueVar = true
          var falseVar = false
          this.realMfs = (response && response.data.mfa === 'true') ? trueVar : falseVar
          this.mfaStatus = (response && response.data.mfa === 'true') ? trueVar : falseVar
        })
        .catch((e) => {
          this.realMfs = false
          this.mfaStatus = false
        })
    }
  }
}
</script>

<style scoped>
.switch-checkbox {
  display: none;
}

.switch-label {
  align-items: center;
  background: var(--background-color-secondary);
  border: calc(var(--element-size) * 0.025) solid var(--accent-color);
  border-radius: var(--element-size);
  cursor: pointer;
  display: flex;
  font-size: calc(var(--element-size) * 0.3);
  height: calc(var(--element-size) * 0.35);
  position: relative;
  padding: calc(var(--element-size) * 0.1);
  transition: background 0.5s ease;
  justify-content: space-between;
  width: var(--element-size);
  z-index: 1;
}

.switch-toggle {
  position: absolute;
  background-color: var(--contact-highlighted);
  border-radius: 50%;
  /* top: calc(var(--element-size) * 0.07); */
  left: calc(var(--element-size) * 0.07);
  height: calc(var(--element-size) * 0.45);
  width: calc(var(--element-size) * 0.45);
  transform: translateX(0);
  transition: transform 0.3s ease, background-color 0.5s ease;
}

.switch-toggle-checked {
  transform: translateX(calc(var(--element-size) * 0.6)) !important;
}
.switch-label-mode {
    float: left !important;
}
.qr_image{
  width: auto;
  height: auto;
  margin: auto;
  border-radius: 0;
}
</style>
