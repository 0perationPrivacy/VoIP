<template>
  <div>
    <div id="loader1" v-if="isLoading">
      <div class="d-flex loader justify-content-center align-items-center">
        <div class="sp sp-circle"></div>
      </div>
  </div>
    <div v-for="profile in profiles" :key="profile._id" >
      <b-dropdown-item-button @click="changeProfile(profile)">
        <div class="d-flex flex-row">
          <div>
            <div class="d-flex flex-column">
              <div>
                <!-- {{ getValidString(profile.profile)}} -->
                {{ profile.profile }}
              </div>
              <div>
                <span v-if="profile.number && profile.number !== ''" class="profileNum">({{profile.number}})</span>
              </div>
            </div>
          </div>
          <div>
            <span v-if="profile.messageCount > 0" class="start-100 translate-middle badge border border-light rounded-circle bg-danger p-2"><span class="visually-hidden">unread messages</span></span>
          </div>
        </div>
      </b-dropdown-item-button>
      <b-dropdown-divider></b-dropdown-divider>
    </div>
    <b-dropdown-item-button v-b-modal.add-profile>
      <b-icon icon="person-plus-fill" aria-hidden="true"></b-icon>
        Add New Profile
    </b-dropdown-item-button>
    <b-dropdown-divider></b-dropdown-divider>
    <!--</router-link>-->
    <!-- modal -->
    <b-modal ref="add-profile" id="add-profile" size="lg" title="Add Profile" hide-footer>
      <span class="small text-secondary">Profile</span>
      <form @submit.prevent="handleSubmit" class="ml-2 mr-2">
        <div class="form-group mt-2">
          <input class="form-control chat-input" v-model="form.profile" name="profile" placeholder="Enter Profile" :class="{ 'is-invalid': submitted3 && $v.form.profile.$error }" />
          <div v-if="submitted3 && $v.form.profile.$error" class="invalid-feedback">
            <span v-if="!$v.form.profile.required">Profile are required</span>
          </div>
        </div>
        <div class="d-grid d-md-flex mt-3">
          <button class="btn btn-primary" type="submit">Save</button>
        </div>
      </form>
    </b-modal>
    <!-- / modal -->
  </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import { post } from '../../core/module/common.module'
import { EventBus } from '@/event-bus'
export default {
  data () {
    return {
      access_token: null,
      headers: null,
      baseurl: '',
      profiles: [],
      activeProfile: null,
      submitted3: false,
      isLoading: false,
      form: {
        profile: ''
      }
    }
  },
  validations: {
    form: {
      profile: {required}
    }
  },
  mounted () {
    this.userdata = JSON.parse(this.$cookie.get('userdata'))
    this.access_token = this.$cookie.get('access_token')
    this.headers = {
      headers: {
        token: this.access_token
      }
    }
    var baseUrl = window.location.origin
    if (baseUrl === 'http://localhost:8080') {
      this.baseurl = 'http://localhost:3000'
    }
    this.getallProfile()
  },
  methods: {
    onClickButton (profile) {
      this.$emit('clicked', profile)
    },
    changeProfile (profile) {
      this.activeProfile = profile
      localStorage.setItem('activeProfile', JSON.stringify(profile))
      this.$emit('clicked', profile)
      EventBus.$emit('clicked', true)
      EventBus.$emit('changeProfile', true)
    },
    activeFirstProfile () {
      if (this.profiles.length > 0) {
        this.changeProfile(this.profiles[0])
      } else {
        this.activeProfile = null
        this.$emit('clicked', null)
      }
    },
    getallProfile () {
      var request = {
        data: {},
        url: 'profile/getdata'
      }
      this.$store
        .dispatch(post, request)
        .then((response) => {
          this.profiles = response.data
          if (!this.activeProfile) {
            var profileLocal = localStorage.getItem('activeProfile')
            if (profileLocal) {
              var acPr = JSON.parse(profileLocal)
              for (var i = 0; i < this.profiles.length; i++) {
                if (this.profiles[i]._id === acPr._id) {
                  this.activeProfile = this.profiles[i]
                }
              }
            } else {
              this.activeProfile = this.profiles[0]
            }
            this.$emit('clicked', this.activeProfile)
          }
        })
        .catch((e) => {
          console.log(e)
        })
    },
    handleSubmit (e) {
      this.submitted3 = true
      EventBus.$emit('toggleLoader', true)
      this.$v.$touch()
      if (this.$v.$invalid) {
        return
      }
      var request = {
        data: this.form,
        url: 'profile/create'
      }
      this.$store
        .dispatch(post, request)
        .then((response) => {
          this.$swal({
            icon: 'success',
            title: 'Success',
            text: 'Profile added successfully!'
          })
          this.$refs['add-profile'].hide()
          this.getallProfile()
          this.isLoading = false
          EventBus.$emit('toggleLoader', true)
        })
        .catch((e) => {
          console.log(e)
          this.isLoading = false
          EventBus.$emit('toggleLoader', true)
        })
    }
  }
}
</script>
<style scoped>
#loader1{
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
