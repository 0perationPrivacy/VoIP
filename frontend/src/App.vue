<template>
  <div id="app">
    <span v-if="old_version" class="update_ribbon"><a href="https://github.com/0perationPrivacy/VoIP/blob/main/CHANGELOG.md" target="_blank" rel="noopener noreferrer">update</a></span>
    <!--<theme-button style="display:none" />-->
    <!--<refresh></refresh>-->
    <router-view/>
    <check-dir />
  </div>
</template>

<script>
import { get } from './core/module/common.module'
import ThemeButton from '@/components/ThemeButton.vue'
import CheckDir from '@/components/CheckDir.vue'
export default {
  name: 'App',
  components: { ThemeButton, CheckDir },
  data () {
    return {
      old_version: false,
      dir: ''
    }
  },
  mounted () {
    this.getVersion()
    // this.checkDirectoryName()
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
    }
  }
}
</script>
