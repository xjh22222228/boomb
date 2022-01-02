<template>
  <div id="container">
    <div class="router-view">
      <router-view />
    </div>

    <Footer />
  </div>
</template>

<script lang="ts" setup>
import { useStore } from 'vuex'

const store = useStore()
store.dispatch('getUser')
</script>

<style lang="scss" scoped>
#container {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  .router-view {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
}
</style>
