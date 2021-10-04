<template>
  <div id="app">
    <!--<theme-button style="display:none" />-->
    <refresh></refresh>
    <router-view/>
  </div>
</template>

<script>
import ThemeButton from '@/components/ThemeButton.vue'
import Refresh from './components/Refresh.vue'
export default {
  name: 'App',
  components: { ThemeButton, Refresh }
}
</script>

<style>
/* Define styles for the default root window element */

</style>
