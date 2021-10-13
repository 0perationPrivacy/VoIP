<template>
  <div id="app">
    <!--<theme-button style="display:none" />-->
    <!--<refresh></refresh>-->
    <router-view/>
  </div>
</template>

<script>
import ThemeButton from '@/components/ThemeButton.vue'
export default {
  name: 'App',
  components: { ThemeButton }
}
</script>

<style>
/* Define styles for the default root window element */

</style>
