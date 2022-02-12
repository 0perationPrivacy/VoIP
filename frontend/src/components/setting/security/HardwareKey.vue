<template>
    <div>
        <h6 class="border-bottom mx-1 pb-1">Hardware Key</h6>
        <div class="card m-1"  v-for="key in keys" :key="key._id">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div class="pr-1 mr-2">
                  <b-icon icon="key"></b-icon><span class="mr-2"> {{key.title}} </span>
                </div>
                <div class="pl-1 ml-2">
                  <a href="javascript:void(0);" class="text-danger" @click="deleteKey(key._id)">
                    <b-icon icon="trash"></b-icon>
                  </a>
                </div>
              </div>
            </div>
        </div>
        <div class="card m-1">
            <div class="card-body">
              <div class="row align-items-center">
                <div class="col-auto">
                  <div class="col-auto">
                    <div class="d-flex justify-content-between">
                      <div class="p-2">
                        <input type="text" class="form-control" v-model="title">
                      </div>
                      <div class="p-2">
                        <button class="btn btn-success" @click="register()">
                          <b-icon icon="plus"></b-icon>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </div>
    </div>
</template>

<script>
import { encode, decode } from '../../../base64url-arraybuffer'
import { post } from '../../../core/module/common.module'
// import { decode } from 'cbor-x/decode'
// const CBOR = require('../../../cbor')
// import base64url from 'base64url'
import { parseAuthData, bufToHex } from '../../../helper'
// const Helper = require('../../../helper')
const CBOR = require('cbor-js')
// const cbor = require('cbor')
export default {
  data () {
    return {
      title: '',
      keys: []
    }
  },
  mounted: function () {
    this.getHardwarekey()
  },
  methods: {
    deleteKey (id) {
      this.$swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      }).then((result) => {
        if (result.isConfirmed) {
          var request2 = {
            data: {id: id},
            url: 'hardwarekey/delete'
          }
          this.$store
            .dispatch(post, request2)
            .then((respose) => {
              if (respose) {
                this.$swal.fire(
                  'Deleted!',
                  'Your key has been deleted.',
                  'success'
                )
                this.getHardwarekey()
              }
            })
            .catch((e) => {

            })
        }
      })
    },
    getHardwarekey () {
      var request2 = {
        data: {},
        url: 'hardwarekey/get'
      }
      this.$store
        .dispatch(post, request2)
        .then((respose) => {
          if (respose) {
            this.keys = respose.data
          }
        })
        .catch((e) => {

        })
    },
    register () {
      if (this.title.trim() === '') {
        this.$swal.fire('Please enter title', '', 'error')
      } else {
        var request = {
          data: { title: this.title.trim() },
          url: 'hardwarekey/register-key'
        }
        this.$store
          .dispatch(post, request)
          .then((serverResponse) => {
            if (serverResponse) {
              if (serverResponse.status !== 'startFIDOEnrolment') {
                this.$swal.fire('Error registering user!', '', 'error')
                // throw new Error('Error registering user! Server returned: ' + serverResponse.errorMessage)
              } else {
                var request2 = {
                  data: {},
                  url: 'hardwarekey/register'
                }
                this.$store
                  .dispatch(post, request2)
                  .then(async (respnse) => {
                    var hardwarekey = respnse.hardwarekey
                    var makeCredChallenge = respnse.publicKey
                    // var challenge = encode(this.generateRandomBuffer(32))
                    // console.log(challenge)
                    // var publicKey = {
                    //   'challenge': challenge,

                    //   'rp': {
                    //     'name': 'Example Inc.'
                    //   },

                    //   'user': {
                    //     'id': makeCredChallenge.user.id,
                    //     'name': makeCredChallenge.user.name,
                    //     'displayName': makeCredChallenge.user.displayName
                    //   },

                    //   'pubKeyCredParams': [
                    //     { 'type': 'public-key', 'alg': -7 }
                    //   ],

                    //   'status': 'ok'
                    // }

                    // console.log(publicKey)
                    try {
                      console.log(makeCredChallenge)
                      makeCredChallenge = this.preformatMakeCredReq(makeCredChallenge)
                      // var randomStringFromServer = encode(this.generateRandomBuffer(32))
                      // var randomStringFromServer = this.generateRandomBuffer(32)
                      // console.log(randomStringFromServer)
                      // var userID = makeCredChallenge.user.id
                      // console.log(userID)
                      // const publicKeyCredentialCreationOptions = {
                      //   challenge: Uint8Array.from(
                      //     randomStringFromServer, c => c.charCodeAt(0)),
                      //   rp: {
                      //     name: 'Duo Security'
                      //   // id: 'duosecurity.com'
                      //   },
                      //   user: {
                      //     id: Uint8Array.from(
                      //       userID, c => c.charCodeAt(0)),
                      //     name: makeCredChallenge.user.name,
                      //     displayName: makeCredChallenge.user.displayName
                      //   },
                      //   pubKeyCredParams: [{alg: -7, type: 'public-key'}],
                      //   authenticatorSelection: {
                      //     authenticatorAttachment: 'cross-platform'
                      //   },
                      //   timeout: 60000,
                      //   attestation: 'direct'
                      // }
                      var excludeCredentials = []
                      for (const key of hardwarekey) {
                        console.log(key)
                        excludeCredentials.push({
                          id: decode(key.credentials[0]),
                          type: 'public-key'
                        })
                      }
                      makeCredChallenge.excludeCredentials = excludeCredentials
                      var newCredentialInfo = await navigator.credentials.create({ 'publicKey': makeCredChallenge })
                      console.log(newCredentialInfo)
                    } catch (error) {
                      this.$swal.fire(
                        'Key!',
                        error.message,
                        'error'
                      )
                      // console.log(error)
                    }

                    let attestationObject = await CBOR.decode(newCredentialInfo.response.attestationObject)
                    let authData = parseAuthData(attestationObject.authData)
                    let aaguid = bufToHex(authData.aaguid)
                    newCredentialInfo = this.publicKeyCredentialToJSON(newCredentialInfo)
                    var request3 = {
                      data: { id: newCredentialInfo.id, aaguid: aaguid },
                      url: 'hardwarekey/verify'
                    }
                    this.$store
                      .dispatch(post, request3)
                      .then((serverResponse) => {
                        if (serverResponse.status !== 'ok') {
                          throw new Error('Error registering user! Server returned: ' + serverResponse.errorMessage)
                        } else {
                          this.$swal.fire(
                            'Key!',
                            'Your key added successfully.',
                            'success'
                          )
                          this.getHardwarekey()
                          this.title = ''
                        }
                      })
                      .catch((e) => {
                        console.log(e)
                      })
                  })
                  .catch((e) => {

                  })
              }
            }
          })
          .catch((e) => {

          })
      }
    },
    preformatGetAssertReq (getAssert) {
      return new Promise((resolve, reject) => {
        // getAssert.challenge = decode(getAssert.challenge)
        if (getAssert) {
          // for (let allowCred of getAssert.allowCredentials) {
          // console.log(allowCred.id)
          // allowCred.id = decode(allowCred.id)
          // }
        }
        resolve(getAssert)
      })
    },
    generateRandomBuffer (length) {
      if (!length) { length = 32 }

      var randomBuff = new Uint8Array(length)
      window.crypto.getRandomValues(randomBuff)
      return randomBuff
    },
    preformatMakeCredReq (makeCredReq) {
      makeCredReq.challenge = decode(makeCredReq.challenge)
      makeCredReq.user.id = decode(makeCredReq.user.id)

      return makeCredReq
    },
    // parseAuthData (buffer) {
    //   let rpIdHash = buffer.slice(0, 32)
    //   buffer = buffer.slice(32)
    //   let flagsBuf = buffer.slice(0, 1)
    //   buffer = buffer.slice(1)
    //   let flagsInt = flagsBuf[0]
    //   let flags = {
    //     up: !!(flagsInt & 0x01),
    //     uv: !!(flagsInt & 0x04),
    //     at: !!(flagsInt & 0x40),
    //     ed: !!(flagsInt & 0x80),
    //     flagsInt
    //   }

    //   let counterBuf = buffer.slice(0, 4)
    //   buffer = buffer.slice(4)
    //   let counter = this.readBE32(counterBuf)
    //   // eslint-disable-next-line no-undef-init
    //   let aaguid = undefined
    //   // eslint-disable-next-line no-undef-init
    //   let credID = undefined
    //   // eslint-disable-next-line no-undef-init
    //   let COSEPublicKey = undefined
    //   if (flags.at) {
    //     aaguid = buffer.slice(0, 16)
    //     buffer = buffer.slice(16)
    //     let credIDLenBuf = buffer.slice(0, 2)
    //     buffer = buffer.slice(2)
    //     let credIDLen = this.readBE16(credIDLenBuf)
    //     credID = buffer.slice(0, credIDLen)
    //     buffer = buffer.slice(credIDLen)
    //     COSEPublicKey = buffer
    //   }
    //   return {rpIdHash, flagsBuf, flags, counter, counterBuf, aaguid, credID, COSEPublicKey}
    // },
    bufToHex (buffer) {
      return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('')
    },
    readBE32 (buffer) {
      if (buffer.length !== 4) { throw new Error('Only 4byte buffers allowed!') }

      if (this.getEndian() !== 'big') { buffer = buffer.reverse() }

      return new Uint32Array(buffer.buffer)[0]
    },
    getEndian () {
      let arrayBuffer = new ArrayBuffer(2)
      let uint8Array = new Uint8Array(arrayBuffer)
      let uint16array = new Uint16Array(arrayBuffer)
      uint8Array[0] = 0xAA // set first byte
      uint8Array[1] = 0xBB // set second byte

      if (uint16array[0] === 0xBBAA) { return 'little' } else { return 'big' }
    },
    readBE16 (buffer) {
      if (buffer.length !== 2) throw new Error('Only 2byte buffer allowed!')

      if (this.getEndian() !== 'big') { buffer = buffer.reverse() }

      return new Uint16Array(buffer.buffer)[0]
    },
    publicKeyCredentialToJSON (pubKeyCred) {
      if (pubKeyCred instanceof Array) {
        let arr = []
        for (let i of pubKeyCred) { arr.push(this.publicKeyCredentialToJSON(i)) }

        return arr
      }

      if (pubKeyCred instanceof ArrayBuffer) {
        return encode(pubKeyCred)
      }

      if (pubKeyCred instanceof Object) {
        let obj = {}

        for (let key in pubKeyCred) {
          obj[key] = this.publicKeyCredentialToJSON(pubKeyCred[key])
        }

        return obj
      }

      return pubKeyCred
    }
  }
}
</script>
