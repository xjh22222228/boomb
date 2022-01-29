<template>
  <div class="wrapper" @click="showDrawer = true">
    <img class="icon" src="@/assets/inc.svg" alt="">
  </div>

  <el-drawer
    v-model="showDrawer"
    direction="btt"
    :before-close="handleClose"
    destroy-on-close
    :show-close="false"
    :with-header="false"
    :size="130"
  >
    <div class="row">
      <div class="item">
        <img src="@/assets/file-other.svg" alt="">
        <div>{{ t('uploadFile' )}}</div>

        <input
          multiple
          type="file"
          class="file"
          @change="handleUploadFile"
        />
      </div>

      <div class="item" @click="handleCreateDir">
        <img src="@/assets/file-folder.svg" alt="">
        <div>{{ t('createDir' )}}</div>
      </div>

      <div class="item" @click="handleNewFile">
        <img src="@/assets/file-code.svg" alt="">
        <div>{{ t('newFile' )}}</div>
      </div>
    </div>
  </el-drawer>

  <create-dir-dialog
    :visible="showCreateDirModal"
    :before-close="toggleCreateDirModal"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const showDrawer = ref(false)
const showCreateDirModal = ref(false)
const route = useRoute()
const router = useRouter()
const store = useStore()

function toggleCreateDirModal() {
  showCreateDirModal.value = !showCreateDirModal.value
}

function handleClose() {
  showDrawer.value = false
}

function handleCreateDir() {
  toggleCreateDirModal()
  showDrawer.value = false
}

function handleUploadFile(e: any) {
  const files = e.target.files as File[]
  const allFile = []
  for (const file of files) {
    allFile.push({ file, route })
  }
  store.dispatch('createFile', allFile)
  e.target.value = ''
}

const handleNewFile = function() {
  router.push({
    path: '/file/new',
    query: {
      path: route.query.path || '/'
    }
  })
}
</script>

<style lang="scss" scoped>
.wrapper {
  z-index: 99;
  position: fixed;
  bottom: 150px;
  right: 15px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #8EC5FC;
  background-image: linear-gradient(62deg, #8EC5FC 0%, #E0C3FC 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  transition: .05s linear;
  &:active {
    transform: scale(0.9);
  }
  .icon {
    width: 50%;
    height: 50%;
  }
}

.row {
  display: flex;
  text-align: center;
  justify-content: space-evenly;
  .item {
    position: relative;
  }
  .file {
    position: absolute;
    top: 0;
    left: 0;
    width: 108px;
    height: 75px;
    opacity: 0;
  }
  img {
    width: 50px;
    height: 50px;
  }
}
</style>
