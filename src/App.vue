<template>
  <div id="container">
    <div class="router-view">
      <router-view />
    </div>

    <Footer />
  </div>

  <Action />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useStore } from 'vuex'
import Action from './components/Action.vue'

export default defineComponent({
  components: { Action },
  name: 'App',

  setup() {
    const store = useStore()

    store.dispatch('getUser')
  }
})
</script>

<style lang="scss">
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
