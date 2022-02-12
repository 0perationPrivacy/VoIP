<template>
    <div>
        <button @click="register()">Register</button>
        <button @click="validate()">Validate</button>
        <!-- <button @click="testB64()">Test B64</button> -->
        <pre> {{status}} </pre>
    </div>
</template>
<script>

import { post } from '../core/module/common.module'
// import { parseAuthData, bufToHex } from '../helper'
const CBOR = require('cbor-js')
export default {
  data () {
    return {
      status: ''
    }
  },
  methods: {
    /* test function */
    register () {
      this.status = 'Start Register...'
      var request = {
        url: 'hardwarekey/register-key',
        data: {}
      }
      this.$store
        .dispatch(post, request)
        .then(async (pkCredCreateOpts) => {
          // eslint-disable-next-line camelcase
          const b64_ab = (inStr) => Uint8Array.from(atob(inStr), c => c.charCodeAt(0)) // base64 encoded utf8
          // eslint-disable-next-line no-useless-escape
          const b64urlB64 = (inStr) => inStr.replace(/\-/g, '+').replace(/_/g, '/') + '='.repeat((inStr.length % 4) ? 4 - (inStr.length % 4) : 0)

          // eslint-disable-next-line camelcase
          const ab_b64 = (buf) => btoa(buf.reduce((data, val) => data + String.fromCharCode(val), '')) // Uint8Array
          pkCredCreateOpts.user.id = b64_ab(pkCredCreateOpts.user.id) // convert from base64 to ab
          const challengeStr = pkCredCreateOpts.challenge // keep for later - base64url
          pkCredCreateOpts.challenge = b64_ab(b64urlB64(pkCredCreateOpts.challenge))
          console.log('challengeStr', challengeStr)

          this.status = 'Awaiting PIN to Register...'

          const credential = await navigator.credentials.create({
            publicKey: pkCredCreateOpts // some info in the options come from backend
          })
          let attestationObject = await CBOR.decode(credential.response.attestationObject)
          // let authData = parseAuthData(attestationObject.authData)
          console.log(attestationObject)
          // let aaguid = bufToHex(authData.aaguid)
          // console.log('CredID: ', bufToHex(authData.credID))
          // console.log('AAGUID: ', bufToHex(authData.aaguid))
          // console.log('PublicKey', CBOR.decode(authData.COSEPublicKey.buffer))

          const passableCredential = {
            id: credential.id,
            rawId: ab_b64(new Uint8Array(credential.rawId)),
            response: {
              clientDataJSON: ab_b64(new Uint8Array(credential.response.clientDataJSON)),
              attestationObject: ab_b64(new Uint8Array(credential.response.attestationObject))
            },
            type: credential.type
          }
          // console.log(credential.response.attestationObject)
          console.log('passableCredential', passableCredential)
          
          // console.log(response)
          var request = {
            url: 'hardwarekey/register',
            data: {passableCredential: passableCredential, attestationObject: credential.response.attestationObject}
          }
          this.$store
            .dispatch(post, request)
            .then(async (rv) => {
              console.log('rv', rv)
              this.status = 'Register Pass...'
            })
            .catch((e) => {

              // resolve(false)
            })
        })
        .catch((e) => {

          // resolve(false)
        })
    },
    validate () {
      this.status = 'start Validate...'
      var request = {
        url: 'hardwarekey/login-key',
        data: {}
      }
      this.$store
        .dispatch(post, request)
        .then(async (authnOptions) => {
          // eslint-disable-next-line camelcase
          const b64_ab = (inStr) => Uint8Array.from(atob(inStr), c => c.charCodeAt(0)) // base64 encoded utf8
          // eslint-disable-next-line camelcase
          const b64url_b64 = (inStr) => inStr.replace(/\-/g, '+').replace(/_/g, '/') + '='.repeat((inStr.length % 4) ? 4 - (inStr.length % 4) : 0)

          // eslint-disable-next-line camelcase
          const ab_b64 = (buf) => btoa(buf.reduce((data, val) => data + String.fromCharCode(val), '')) // Uint8Array
          authnOptions.allowCredentials = authnOptions.allowCredentials.map(item => {
            item.id = b64_ab(item.id)
            return item
          })

          this.status = 'Awaiting PIN to Validate...'

          authnOptions.challenge = b64_ab(b64url_b64(authnOptions.challenge))
          const credential = await navigator.credentials.get({
            publicKey: authnOptions // some info in the options come from backend
          })
          console.log('assert credential', credential)
          
          const passableCredential = {
            id: credential.id,
            rawId: ab_b64(new Uint8Array(credential.rawId)),
            response: {
              clientDataJSON: ab_b64(new Uint8Array(credential.response.clientDataJSON)),
              authenticatorData: ab_b64(new Uint8Array(credential.response.authenticatorData)),
              signature: ab_b64(new Uint8Array(credential.response.signature)),
              userHandle: 'test' // credential.response.userHandle,
            },
            type: credential.type
          }
          console.log('assert passableCredential', passableCredential)

          // console.log(response)
          var request = {
            url: 'hardwarekey/login',
            data: passableCredential
          }
          this.$store
            .dispatch(post, request)
            .then(async (rv) => {
              console.log('rv', rv)
              this.status = 'Validate Pass...'
            })
            .catch((e) => {

            // resolve(false)
            })
        })
        .catch((e) => {

          // resolve(false)
        })
    },
    /* test function */
  }
}
</script>
