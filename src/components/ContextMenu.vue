<template>
  <div class="context" id="context-menu">
    <div class="item" @click="handleRefresh">刷新</div>
    <div class="item" @click="handleUploadFile">上传文件</div>
    <div class="item" @click="handleMkdir">新建文件夹</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'

export default defineComponent({
  name: 'ContextMenu',

  setup() {
    const store = useStore()
    const route = useRoute()
    let menuEl: HTMLElement
    
    const handleContext = function(e: MouseEvent) {
      e.stopPropagation()
      e.preventDefault()

      const x = e.clientX
      const y = e.clientY
      menuEl.style.display = 'block'
      menuEl.style.top = `${y}px`
      menuEl.style.left = `${x}px`
    }

    const handleDocClick = function() {
      menuEl.style.display = 'none'
    }

    onMounted(() => {
      const el = document.getElementById('home')
      menuEl = document.getElementById('context-menu') as HTMLElement
      if (el) {
        el.addEventListener('contextmenu', handleContext)
        document.addEventListener('click', handleDocClick)
      }
    })

    onUnmounted(() =>{ 
      const el = document.getElementById('home')
      if (el) {
        el.removeEventListener('contextmenu', handleContext)
        document.removeEventListener('click', handleDocClick)
      }
    })

    const handleRefresh = function() {
      store.dispatch('getDir', route.query.path)
    }

    const handleUploadFile = function() {
      document.getElementById('input-file')?.click()
    }

    const handleMkdir = function() {
      document.getElementById('mkdir-btn')?.click()
    }

    return {
      handleRefresh,
      handleUploadFile,
      handleMkdir
    }
  }
})
</script>

<style lang="scss" scoped>
.context {
  z-index: 999;
  position: fixed;
  top: 100px;
  left: 200px;
  width: 200px;
  background: #fff;
  border: 1px solid #c8ccd3;
  box-shadow: 0 1px 4px 0 rgba(15, 32, 65, 0.2);
  display: none;

  .item {
    padding: 10px 20px;
    cursor: pointer;
    transition: .1s linear;

    &:hover {
      background: #f4f4f4;
    }
  }
}
</style>
