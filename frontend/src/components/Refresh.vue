<template>
    <div></div>
</template>
<script>
import PullToRefresh from 'pulltorefreshjs'

export default {
  mounted: function () {
    PullToRefresh.init({
      mainElement: 'body',
      onRefresh () {
        window.location.reload()
      },
      distThreshold: 120,
      distMax: 140
    })
  }
}
</script>
<style>

</style>
