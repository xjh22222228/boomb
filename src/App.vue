<template>
  <div id="container">
    <div class="router-view">
      <router-view />
    </div>

    <Footer />
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'

const route = useRoute()
const store = useStore()

if (route.name !== 'Login') {
  store.dispatch('getUser')
}

onMounted(() => {
  if (window.location.hostname === 'boomb.cn') {
    window.location.href = 'https://boomb2.netlify.app'
  }
})
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
