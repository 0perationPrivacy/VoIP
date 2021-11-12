<template>
  <div id="app">
    <span v-if="old_version" class="update_ribbon"><a href="https://github.com/0perationPrivacy/VoIP/blob/main/CHANGELOG.md" target="_blank" rel="noopener noreferrer">update</a></span>
    <!--<theme-button style="display:none" />-->
    <!--<refresh></refresh>-->
    <router-view/>
  </div>
</template>

<script>
import { get, post } from './core/module/common.module'
import ThemeButton from '@/components/ThemeButton.vue'
export default {
  name: 'App',
  components: { ThemeButton },
  data () {
    return {
      old_version: false
    }
  },
  mounted () {
    this.getVersion()
    this.checkDirectoryName()
  },
  methods: {
    getVersion () {
      var request = {
        url: 'auth/get-update-version'
      }
      this.$store
        .dispatch(get, request)
        .then((response) => {
          console.log(response.update)
          if (response.update === 'true') {
            this.old_version = true
          } else {
            this.old_version = false
          }
        })
        .catch((e) => {
          this.old_version = false
          console.log(e)
          // resolve(false)
        })
    },
    checkDirectoryName () {
      var request = {
        url: 'auth/check-directoryname',
        data: {dirname: this.$route.params.appdirectory}
      }
      this.$store
        .dispatch(post, request)
        .then((response) => {
          if (response.data.status === 'nodir') {
            this.$router.push(`/voip/`)
            // if (this.$route.params.appdirectory === undefined) {
            //   this.$router.push(`/voip/`)
            // }
            // else {
            //   if (this.$route.params.appdirectory !== 'voip') {
            //     this.$router.push(`/404`)
            //   }
            // }
          } else if (response.data.status !== 'true') {
            this.$router.push(`/404`)
          }
        })
        .catch((e) => {
          this.old_version = false
          console.log(e)
          // resolve(false)
        })
    }
  }
}
</script>
