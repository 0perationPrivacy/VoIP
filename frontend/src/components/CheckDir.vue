<template>
    <div></div>
</template>

<script>
import { post } from '../core/module/common.module'
export default {
  mounted () {
    this.checkDirectoryName()
  },
  methods: {
    checkDirectoryName () {
      setTimeout(() => {
        var request = {
          url: 'auth/check-directoryname',
          data: {dirname: this.$route.params.appdirectory}
        }
        this.$store
          .dispatch(post, request)
          .then((response) => {
            console.log(response)
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
      }, 500)
    }
  }
}
</script>
