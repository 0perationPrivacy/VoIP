<template>
  <div id="wrapbody" class="wrap">
  <div id="loader" v-if="isLoading">
      <div class="d-flex loader justify-content-center align-items-center">
        <div class="sp sp-circle"></div>
      </div>
  </div>
    <theme-button id-hide="true"></theme-button>
    <b-sidebar v-if="vw < 576"
      class="d-sm-none"
      id="sidebar-no-header"
      ref="mySidebar2"
      aria-labelledby="sidebar-no-header-title"
      no-header
      shadow
      backdrop
      visible
    >
      <template #default="{ hide }">
        <div class="d-flex flex-row-reverse bd-highlight">
          <div class="bd-highlight dropDown">
            <b-button class="float-right d-flex" size="sm" variant="primary">
              <b-icon @click="hide" icon="x" scale="1"></b-icon>
            </b-button>
          </div>
        </div>
       <number-list ref="numberList" @onaddContact="onaddContact" @activeChat="activeProfileView" @clicked="onClickChild" />
      </template>
    </b-sidebar>
    <section class="col-auto col-md-4 d-none d-sm-block">
    <number-list ref="numberList" @onaddContact="onaddContact" @activeChat="activeProfileView" @clicked="onClickChild"  v-if="vw >= 576" />
    </section>
    <section class="col col-md-8 pb-2" id="drop-area1">
      <div class="chat-head">
        <b-icon
          font-scale="2"
          icon="chevron-right"
          aria-hidden="true"
          class="mx-2 my-auto d-sm-none"
          v-b-toggle.sidebar-no-header
        ></b-icon>
        <b-icon
          font-scale="2"
          icon="person-bounding-box"
          aria-hidden="true"
          class="mx-2 my-auto"
        ></b-icon>
        <div class="chat-name">
          <h1 class="font-name" v-if="activeChat">
            <div class="d-flex align-items-start align-self-center">
              <div class="mt-2 ml-4">{{ activeChat._id }}</div>
            </div>
          </h1>
        </div>
        <div class="d-flex m-auto">
          <span style="cursor: pointer" @click="deletechat()" title="Delete">
            <b-icon font-scale="2" icon="trash" aria-hidden="true"></b-icon>
          </span>
        </div>
      </div>
      <div :class="(!this.activeChat || modelMms) ?'d-none':''">
        <div id="drop-area" style="z-index: 1;"  :class="uploadedImages.length > 0 ?'activeImageArea':'inactive'">
          <form class="my-form">
            <p>Upload multiple files by dragging and dropping images inside this box</p>
            <input type="file" id="fileElem" multiple accept="image/*" @change="handleFiles($event.target.files)">
            <!-- <label class="button" for="fileElem">Select some files</label> -->
          </form>
          <div class="row" id="gallery">
            <div class="col-lg-4" v-for="image in uploadedImages" :key="image">
              <img style="width:150px" :src="image" >
              <a href="javascript:void(0)" @click="removeFromPrevie(image)">
                <span class="start-100 translate-middle badge border border-light rounded-circle bg-danger">X</span>
              </a>
            </div>
          </div>
          <progress style="display: none" id="progress-bar" max=100 value=0></progress>
        </div>
      </div>
      <div class="wrap-chat" id="chat_body">
        <div class="chat row" v-if="chatListLoader">
          <div class="box-placeholder chat_loader">
            <div class="excerpt p-4">
              <div class="text line"></div>
              <div class="text line"></div>
              <div class="text"></div>
            </div>
          </div>
          <div class="box-placeholder chat_loader">
            <div class="excerpt p-4">
              <div class="text line"></div>
              <div class="text line"></div>
              <div class="text"></div>
            </div>
          </div>
        </div>
        <div class="chat" id="chat-container" v-chat-scroll>
          <div v-if="activeChatData">
            <div v-for="message in messages" :key="message._id">
              <div
                class="chat-bubble"
                v-bind:class="{
                  me: message.type == 'send',
                  you: message.type == 'receive',
                }"
              >
                <div
                  v-bind:class="{
                    'my-mouth': message.type == 'send',
                    'your-mouth': message.type == 'receive',
                  }"
                ></div>
                <div class="content">
                  <span v-if="message.media && JSON.parse(message.media) && JSON.parse(message.media).length > 0">
                    <span v-for="image in JSON.parse(message.media)" :key="image">
                      <a @click="showImage(image)" href="javascript:void(0)">
                        <img :src="image" alt="Image">
                      </a>
                    </span>
                  </span>
                  {{ message.message }}
                </div>
                <div class="time">
                  {{ message.created_at | moment("HH:mm") }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="row wrap-container">
        <div class="col-md-12 wrap-container2">
          <div class="wrap-message" v-if="activeChatData">
            <div class="message pl-2">
              <input
                type="text"
                class="input-message"
                placeholder="Type message here"
                v-model="messageBody"
                v-on:keyup.enter="sendSms"
              />
              <a class="m-2" @click="file_upload()" href="javascript:void(0)">
                <b-icon icon="paperclip" scale="2"></b-icon>
              </a>
            </div>
            <div
              class="btn btn-primary m-2"
              @click="sendSms()"
              style="height: 36px"
            >
              <b-icon icon="arrow-right-circle-fill" aria-hidden="true"></b-icon>
            </div>
          </div>
        </div>
      </div>
    </section>
    <!-- modal -->
    <b-modal ref="my-modal2" id="modal-2" size="lg" title="Compose Message" hide-footer>
      <span class="small text-secondary">Input (+) and country code followed by the 10 digit phone number. If no country code is provided (+1) is assumed. Multiple numbers will be sent as Bulk SMS (individual sms's to recipients). <span class="small text-center">[Telnyx does not support group texting]</span></span>
      <form @submit.prevent="handleSubmit2" class="ml-2 mr-2">
        <div class="form-group mt-4">
          <select class="form-control chat-input" v-model="selectedContact" @change="contactChangeEvent($event)">
            <option value=""> Select Contact </option>
            <option v-for="contact in contacts" :key="contact._id" :value="contact.number">{{contact.first_name}} {{contact.last_name}} - {{contact.number}}</option>
          </select>
        </div>
        <div class="form-group mt-4">
          <vue-tags-input class="form-control chat-input"
               v-model="sms.numbers"
              :tags="tags"
              placeholder="Enter phone number"
              @tags-changed="newTags => tags = newTags"
            />
          <div v-if="tags.length <= 0" class="invalid-feedback">
            <span>Numbers are required</span>
          </div>
        </div>
        <div class="form-group mb-2 mt-4">
          <textarea rows="8" class="form-control chat-input" v-model="sms.message" placeholder="Type Message here"  :class="{ 'is-invalid': submitted2 && $v.sms.message.$error }">
            </textarea>
          <div v-if="submitted2 && $v.sms.message.$error" class="invalid-feedback">
            <span v-if="!$v.sms.message.required">Message is required</span>
          </div>
        </div>
        <div class="input-group mb-3">
          <div class="input-group-prepend">
            <span class="input-group-text paperClip chat-input" @click="choseFile2()" id="basic-addon1"><b-icon icon="paperclip" ></b-icon></span>
          </div>
          <input type="text" class="form-control chat-input" @click="choseFile2()" placeholder="Choose file" aria-label="Username" readonly v-model="modelFileValu" aria-describedby="basic-addon1">
        </div>
        <div class="form-group mb-2 mt-4 d-none">
         <input type="file" id="model_file_input" class="form-control chat-input" multiple accept="image/*" @change="handleFiles($event.target.files, true)">
        </div>

        <div class="d-grid d-md-flex">
          <button class="btn btn-primary" type="submit" id="login-button">Send Message</button>
        </div>
      </form>
    </b-modal>
    <div id="hidden" @click="hiddenImage()">
      <div class="d-flex justify-content-center align-items-center" style="height:100vh; width:100vw">
        <img class="img-fluid" alt="Responsive image" :src="zoomImage" />
      </div>
    </div>
    <!-- / modal -->
  </div>
</template>
<script>
import { required } from 'vuelidate/lib/validators'
import NumberList from './inbox/NumberList.vue'
import VueTagsInput from '@johmun/vue-tags-input'
import ThemeButton from '@/components/ThemeButton.vue'
const io = require('socket.io-client')
export default {
  name: 'dashboard',
  components: { NumberList, VueTagsInput, ThemeButton },
  data () {
    return {
      isLoading: false,
      fullPage: true,
      contacts: [],
      selectedContact: '',
      dropArea: null,
      progressBar: null,
      filesDone: 0,
      filesToDo: 0,
      uploadProgress: [],
      uploadedImages: [],
      activeChatData: false,
      activeProfile: null,
      activeChat: '',
      msg: 'Welcome to dashboard',
      tags: [],
      sms: {
        numbers: '',
        message: ''
      },
      setting: {},
      chatListLoader: false,
      submitted2: false,
      userdata: null,
      access_token: null,
      headers: null,
      messages: [],
      messageBody: '',
      socket: null,
      baseurl: '',
      vw: 0,
      vh: 0,
      modelMms: false,
      modelFileValu: '',
      zoomImage: ''
    }
  },
  created () {
    window.addEventListener('resize', this.updateVw, {passive: true})
  },
  destroyed () {
    window.removeEventListener('resize', this.updateVw, {passive: true})
  },
  mounted: function () {
    if (!this.$cookie.get('access_token')) {
      this.$router.push('/')
    }
    this.updateVw()
    var baseUrl = window.location.origin
    if (baseUrl === 'http://localhost:8080') {
      this.baseurl = 'http://localhost:3000'
    }
    const socket = io(this.baseurl, {transports: ['websocket']})
    this.socket = socket
    var $this = this
    this.socket.on('new_message', function (data) {
      $this.getNumberList()
      if ($this.activeChatData) {
        $this.showChat($this.activeChat)
      }
    })
    // this.userdata = JSON.parse(localStorage.getItem('userdata'))
    this.userdata = JSON.parse(this.$cookie.get('userdata'))
    this.access_token = this.$cookie.get('access_token')
    this.socket.emit('join_profile_channel', this.userdata._id.toString())

    this.socket.on('user_message', function (data) {
      $this.notifyMe(data.number, data.message)
      if ($this.activeChatData) {
        $this.showChat($this.activeChat)
      } else {
        $this.$refs.numberList.getOneProfile()
        $this.$refs.numberList.refreshProfile()
      }
      $this.$refs.numberList.getNumberList()
    })
    this.headers = {
      headers: {
        token: this.access_token
      }
    }
    this.dropArea = document.getElementById('drop-area1')
    ;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      this.dropArea.addEventListener(eventName, this.preventDefaults, false)
    })

    ;['dragenter', 'dragover'].forEach(eventName => {
      this.dropArea.addEventListener(eventName, this.highlight, false)
    })

    ;['dragleave', 'drop'].forEach(eventName => {
      this.dropArea.addEventListener(eventName, this.unhighlight, false)
    })
    this.dropArea.addEventListener('drop', this.handleDrop, false)
    this.progressBar = document.getElementById('progress-bar')
  },
  validations: {
    sms: {
      numbers: {required},
      message: {required}
    }
  },
  methods: {
    messageRefresh () {
      this.messages = []
    },
    contactChangeEvent (e) {
      console.log(this.sms.numbers)
      var inputText = {'text': e.target.value, 'tiClasses': ['ti-valid']}
      this.tags.push(inputText)
      // this.sms.numbers = e.target.value

      this.selectedContact = ''
      // console.log(e.target.value)
    },
    onaddContact (data) {
      this.contacts = data
    },
    hiddenImage () {
      this.zoomImage = ''
      document.getElementById('hidden').style.display = 'none'
    },
    showImage (image) {
      this.zoomImage = image
      document.getElementById('hidden').style.display = 'block'
    },
    choseFile2 () {
      document.getElementById('model_file_input').click()
    },
    file_upload () {
      document.getElementById('fileElem').click()
    },
    initializeProgress (numfiles) {
      this.progressBar.value = 0
      this.uploadProgress = []
      for (let i = this.numFiles; i > 0; i--) {
        this.uploadProgress.push(0)
      }
    },
    updateProgress (fileNumber, percent) {
      this.uploadProgress[fileNumber] = percent
      let total = this.uploadProgress.reduce((tot, curr) => tot + curr, 0) / this.uploadProgress.length
      this.progressBar.value = total
    },
    progressDone () {
      this.filesDone++
      this.progressBar.value = this.filesDone / this.filesToDo * 100
    },
    handleDrop (e) {
      let dt = e.dataTransfer
      let files = dt.files

      this.handleFiles(files)
    },
    handleFiles (files, modelFile = false) {
      if (modelFile) {
        this.modelMms = true
        var filesData = []
        for (var i = 0; i < files.length; i++) {
          filesData.push(files[i].name)
        }
        this.modelFileValu = filesData.join()
      } else {
        this.modelMms = false
      }
      files = [...files]
      this.initializeProgress(files.length)
      files.forEach(this.uploadFile)
    },
    previewFile (file) {
      let reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onloadend = function () {
        let img = document.createElement('img')
        img.style.width = '150px'
        img.src = reader.result
        document.getElementById('gallery').appendChild(img)
      }
    },
    removeFromPrevie (image) {
      var images = []
      for (var i = 0; i < this.uploadedImages.length; i++) {
        if (this.uploadedImages[i] !== image) {
          images.push(this.uploadedImages[i])
        }
      }
      this.uploadedImages = images
      if (this.uploadedImages.length <= 0) {
        document.getElementById('drop-area').style.display = 'none'
      }
    },
    uploadFile (file, i) {
      var url = `${this.baseurl}/media/upload-files`
      var xhr = new XMLHttpRequest()
      var formData = new FormData()
      xhr.open('POST', url, true)
      xhr.setRequestHeader('token', this.access_token)
      var $this = this
      xhr.upload.addEventListener('progress', function (e) {
        $this.updateProgress(i, (e.loaded * 100.0 / e.total) || 100)
      })

      xhr.addEventListener('readystatechange', function (e) {
        if (xhr.readyState === 4 && xhr.status === 200) {
          var response = JSON.parse(xhr.responseText)
          $this.uploadedImages.push(`${response.data.media}`)
        } else if (xhr.readyState === 4 && xhr.status !== 200) {
        }
      })

      formData.append('file', file)
      xhr.send(formData)
    },
    highlight (e) {
      document.getElementById('drop-area').style.display = 'block'
      this.dropArea.classList.add('highlight')
    },
    unhighlight (e) {
      this.dropArea.classList.remove('highlight')
    },
    preventDefaults (e) {
      e.preventDefault()
      e.stopPropagation()
    },
    activeProfileView (profile) {
      console.log(profile)
      console.log(profile.refresh)
      if (profile.refresh !== undefined && profile.refresh) {
        this.messages = []
      }
      this.activeProfile = profile
    },
    onClickChild (value) {
      this.firstChatShow(value)
    },
    notifyMe (user, message) {
      let msgIcon = 'https://www.operationprivacy.com/img/favicon/favicon.ico'
      if (!('Notification' in window)) {
        alert('This browser does not support desktop notification')
      } else if (Notification.permission === 'granted') {
        var options = {
          body: message,
          dir: 'auto',
          icon: msgIcon
        }
        // eslint-disable-next-line no-new
        new Notification('Message from ' + user, options)
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission(function (permission) {
          if (!('permission' in Notification)) {
            Notification.permission = permission
          }
          if (permission === 'granted') {
            var options = {
              body: message,
              dir: 'auto',
              icon: msgIcon
            }
            // eslint-disable-next-line no-new
            new Notification('Message from ' + user, options)
          }
        })
      }
    },
    deletechat () {
      // eslint-disable-next-line no-undef
      this.$swal.fire({
        icon: 'info',
        title: 'Do you want to delete this chat?',
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: `Yes, Delete`,
        denyButtonText: `No`
      }).then((result) => {
        if (result.isConfirmed) {
          var messageData = {user: this.userdata._id, number: this.activeChat}
          // eslint-disable-next-line no-undef
          axios.post(`${this.baseurl}/setting/message-list-delete`, messageData, this.headers)
            .then(response => {
              if (this.activeChatData) {
                this.showChat(this.activeChat)
              }
              this.$refs.numberList.getNumberList()
            })
            .catch(error => {
              if (error.response.status === 401) {
                this.$swal({
                  icon: 'error',
                  title: 'Oops...',
                  text: error.response.data.message
                })
                this.$cookie.delete('access_token')
                this.$router.push('/')
              }
            })
        } else if (result.isDenied) {
          // eslint-disable-next-line no-undef
          this.$swal.fire('chat not deleted', '', 'info')
        }
      })
    },
    sendSms () {
      this.isLoading = true
      if (this.messageBody.trim() === '' && this.uploadedImages.length === 0) {
        this.$swal({
          icon: 'error',
          title: 'Oops...',
          text: 'Message or file required'
        })
        this.isLoading = false
        return
      }
      var activechat = JSON.parse(localStorage.getItem('activenumber'))
      var numbers = [ activechat._id ]
      this.commonSendMessage(numbers, this.messageBody)
    },
    commonSendMessage (numbers, message) {
      var messageData = {user: this.userdata._id, numbers: numbers, message: message, profile: this.activeProfile, media: this.uploadedImages}
      // eslint-disable-next-line no-undef
      axios.post(`${this.baseurl}/setting/send-sms`, messageData, this.headers)
        .then(response => {
          this.messageBody = ''
          this.sms.numbers = ''
          this.sms.message = ''
          this.uploadedImages = []
          this.modelFileValu = ''
          document.getElementById('drop-area').style.display = 'none'
          this.tags = []
          this.$refs.numberList.getNumberList()
          // this.showChat(activechat)
          if (this.activeChatData) {
            this.showChat(this.activeChat)
          }
          this.$refs['my-modal2'].hide()
          if (this.vw < 576) {
            this.$refs['mySidebar2'].hide()
          }
          this.isLoading = false
        })
        .catch(error => {
          this.isLoading = false
          if (error.response.status === 400) {
            this.$swal({
              icon: 'error',
              title: 'Oops...',
              text: error.response.data.errors
            })
          }
          if (error.response.status === 401) {
            this.$swal({
              icon: 'error',
              title: 'Oops...',
              text: error.response.data.message
            })
            this.$cookie.delete('access_token')
            this.$router.push('/')
          }
        })
    },
    firstChatShow (activechat) {
      this.chatListLoader = true
      var element = document.getElementById(activechat._id)
      if (element) {
        element.remove()
      }
      this.showChat(activechat)
      document.getElementById('drop-area').style.display = 'none'
      this.uploadedImages = []
      if (this.vw < 576) {
        this.$refs['mySidebar2'].hide()
      }
    },
    showChat (activechat) {
      this.activeChat = activechat
      this.activeChatData = true
      // eslint-disable-next-line no-undef
      axios.post(`${this.baseurl}/setting/message-list`, {user: this.userdata._id, number: activechat, profile: this.activeProfile}, this.headers)
        .then(response => {
          this.messages = response.data
          this.chatListLoader = false
          var container = this.$el.querySelector('#chat-container')
          container.scrollTop = container.scrollHeight
          this.$refs.numberList.refreshProfile()
          this.$refs.numberList.getOneProfile()
        })
        .catch(error => {
          if (error.response.status === 401) {
            this.$swal({
              icon: 'error',
              title: 'Oops...',
              text: error.response.data.message
            })
            this.$cookie.delete('access_token')
            this.$router.push('/')
          }
        })
    },
    handleSubmit2 (e) {
      this.submitted2 = true
      this.$v.$touch()
      this.isLoading = true
      if (this.tags.length <= 0) {
        this.$swal({
          icon: 'error',
          title: 'Oops...',
          text: 'please enter number!'
        })
        return
      }
      var numbers = []
      console.log(this.tags)
      for (var i = 0; i < this.tags.length; i++) {
        numbers.push(this.tags[i].text)
      }
      // return
      if (!this.$v.sms.message.$error || this.uploadedImages.length > 0) {
        this.commonSendMessage(numbers, this.sms.message)
      } else {
        this.$swal({
          icon: 'error',
          title: 'Oops...',
          text: 'Message or file required!'
        })
        this.isLoading = false
      }
    },
    updateVw () {
      this.vw = this.getVw()
      this.vh = this.getVh()
      var chatHeight = this.vh - 120
      document.getElementById('wrapbody').style.height = `${this.vh}px`
      document.getElementById('chat_body').style.height = `${chatHeight}px`
    },
    getVw () {
      return Math.round(Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0))
    },
    getVh () {
      return Math.round(Math.max(document.documentElement.innerHeight || 0, window.innerHeight || 0))
    }
  }
}
</script>
<style scoped>
  .activeImageArea{
    display: block !important;
  }
  .icons{
  font-size: 30px;
  }
  .chat_loader{
  width: 100%;
  max-width: 100%;
  }

  #drop-area {
  border: 2px dashed #ccc;
  border-radius: 20px;
  height: 75vh;
  font-family: sans-serif;
  padding: 20px;
  position: absolute;
  top: 100px;
  background: black;
  display: none;
}
#drop-area.highlight {
  border-color: purple;
}
p {
  margin-top: 0;
}
.my-form {
  margin-bottom: 10px;
}
#gallery {
  margin-top: 10px;
}

.button {
  display: inline-block;
  padding: 10px;
  background: #ccc;
  cursor: pointer;
  border-radius: 5px;
  border: 1px solid #ccc;
}
.button:hover {
  background: #ddd;
}
#fileElem {
  display: none;
}
.paperClip{
  border-radius: 0% !important;
  border-top-left-radius: 5px !important;
  border-bottom-left-radius: 5px !important;
  padding: 0.5rem 0.75rem !important;
  border-right: 1px solid black;
}
#hidden {
    z-index:9999;
    display:none;
    /*background-color:#fff;*/
    position:fixed;
    height:100%;
    width:100%;
    left: 0px;
    top: 0px;
    text-align: center;
}
/* .wrap-container{
  width: 100%;
  position: relative;
}
.wrap-container2{
  position: relative;
} */
.sp {
  width: 32px;
  height: 32px;
  clear: both;
  margin: 20px auto;
}

/* Spinner Circle Rotation */
.sp-circle {
  border: 4px rgba(0, 0, 0, 0.25) solid;
  border-top: 4px black solid;
  border-radius: 50%;
  -webkit-animation: spCircRot 0.6s infinite linear;
  animation: spCircRot 0.6s infinite linear;
}

@-webkit-keyframes spCircRot {
  from {
    -webkit-transform: rotate(0deg);
  }
  to {
    -webkit-transform: rotate(359deg);
  }
}
@keyframes spCircRot {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(359deg);
  }
}
#loader{
  position: absolute;
  background: white;
  height: 100%;
  width: 100%;
  z-index: 2050;
  top: 0;
  left: 0;
  opacity: .3;
}
.loader{
  height: 100%;
  width:100%;
}
</style>
