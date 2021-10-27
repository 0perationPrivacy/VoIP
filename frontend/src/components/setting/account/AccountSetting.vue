<template>
    <div class="p-2">
      <div v-if="activeMenu == 'setting'">
        <ul class="list-group">
          <li class="list-group-item" @click="enableMenu('username')" style="cursor: pointer">
            <b-icon icon="person" font-scale="1" aria-hidden="true" class="mx-2"></b-icon>Change Username
          </li>
          <li class="list-group-item" @click="enableMenu('password')" style="cursor: pointer">
            <b-icon icon="key" font-scale="1" aria-hidden="true" class="mx-2"></b-icon>Change Password
          </li>
          <li class="list-group-item" @click="deleteAccount()" style="cursor: pointer">
            <b-icon icon="trash" font-scale="1" aria-hidden="true" class="mx-2"></b-icon>Delete Account
          </li>
        </ul>
      </div>
      <div v-if="activeMenu == 'username'">
        <div class="d-flex justify-content-between">
          <div>
            <h6>Change Username</h6>
          </div>
          <div class="p-2 bd-highlight">
            <b-icon icon="arrow-left" style="cursor: pointer" font-scale="1" aria-hidden="true" @click="enableMenu('setting')"></b-icon>
          </div>
        </div>
        <change-username></change-username>
      </div>
      <div v-if="activeMenu == 'password'">
        <div class="d-flex justify-content-between">
          <div class="p-2 bd-highlight">
            <h6>Change Password</h6>
          </div>
          <div class="p-2 bd-highlight">
            <b-icon icon="arrow-left" style="cursor: pointer" font-scale="1" aria-hidden="true" @click="enableMenu('setting')"></b-icon>
          </div>
        </div>
        <change-password></change-password>
      </div>
    </div>
</template>
<script>
import ChangeUsername from './ChangeUsername.vue'
import ChangePassword from './ChangePassword.vue'
import { post } from '../../../core/module/common.module'
export default {
  components: { ChangeUsername, ChangePassword },
  data () {
    return {
      activeMenu: 'setting'
    }
  },
  mounted: function () {},
  methods: {
    enableMenu (menu) {
      this.activeMenu = menu
    },
    deleteAccount () {
      this.$swal.fire({
        icon: 'warning',
        text: 'Please enter your account password to delete account. This process is irreversible',
        title: 'Delete Account',
        input: 'password',
        inputAttributes: {
          autocapitalize: 'off'
        },
        showCancelButton: true,
        confirmButtonText: 'Submit',
        showLoaderOnConfirm: true,
        preConfirm: (login) => {
          var request = {
            data: {password: login},
            url: 'auth/password/check'
          }
          return this.$store
            .dispatch(post, request)
            .then((response) => {
              return response
            })
            .catch((e) => {
              return false
            })

          /* return fetch(`//api.github.com/users/${login}`)
            .then(response => {
              if (!response.ok) {
                throw new Error(response.statusText)
              }
              return response.json()
            })
            .catch(error => {
              this.$swal.showValidationMessage(
                `Request failed: ${error}`
              )
            }) */
        },
        allowOutsideClick: () => !this.$swal.isLoading()
      }).then((result) => {
        console.log(result)
        if (result.isConfirmed) {
          this.$swal.fire({
            icon: 'success',
            title: 'Account Delete',
            text: `Your account deleted successfully`,
            showDenyButton: false,
            showCancelButton: false,
            confirmButtonText: 'Ok'
          }).then((result) => {
            this.$cookie.delete('access_token')
            this.$cookie.delete('userdata')
            this.$router.push('/')
          })
        }
      })
    }
  }
}
</script>
<style>

</style>
