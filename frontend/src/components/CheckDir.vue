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
      // console.log('check params')
      // console.log(this.$route.name)
      // console.log(this.$route.params)
      // setTimeout(() => {
      var request = {
        url: 'auth/check-directoryname',
        data: {dirname: this.$route.params.appdirectory}
      }
      this.$store
        .dispatch(post, request)
        .then((response) => {
          console.log('get dir')
          console.log(response)
          if (response.data.status === 'nodir' || response.data.status === 'no-name') {
            // this.$router.push(`/${this.$route.params.appdirectory}/dashboard`)
            this.$router.push(`/voip/dashboard`)
            // if (this.$route.params.appdirectory === undefined) {
            //   this.$router.push(`/voip/`)
            // }
            // else {
            //   if (this.$route.params.appdirectory !== 'voip') {
            //     this.$router.push(`/404`)
            //   }
            // }
          } else if (response.data.status === 'false') {
            // console.log('404 route')
            // console.log(response.data.status)
            this.$router.push(`/404`)
          }
        })
        .catch((e) => {
          this.old_version = false
          console.log(e)
          // resolve(false)
        })
      // }, 500)
    }
  }
}
</script>
