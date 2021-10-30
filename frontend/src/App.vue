<template>
  <div id="app" v-bind:class="{ 'old_version': old_version }">
    <!--<theme-button style="display:none" />-->
    <!--<refresh></refresh>-->
    <router-view/>
  </div>
</template>

<script>
import { get } from './core/module/common.module'
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

<style>
/* Define styles for the default root window element */
.old_version::after {
    z-index: 99;
    content: "update available";
    position: fixed;
    width: auto;
    height: 12px;
    padding-right: 10px;
    padding-left: 10px;
    background: #a74729;
    top: 0px;
    right: 160px;
    text-align: center;
    font-size: 8px;
    text-transform: uppercase;
    font-weight: 600;
    color: wheat;
    line-height: 11px;
    -webkit-transform: rotate(45deg);
    transform: rotate(0deg);
}
</style>
