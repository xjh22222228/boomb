<template>
  <header class="header">
    <Loading />

    <slot></slot>

    <div class="left">
      <el-button
        :icon="Upload"
        class="mr10 relative"
        type="primary"
      >
        {{ t('uploadFile' )}}
        <label for="input-file"></label>
        <input
          multiple
          type="file"
          class="none"
          id="input-file"
          @change="handleUploadFile"
        />
      </el-button>

      <el-button
        :icon="Plus"
        @click="toggleCreateDirModal"
        id="mkdir-btn"
      >
        {{ t('createDir' )}}
      </el-button>
    </div>

    <div class="right">
      <el-dropdown @command="onCommand" popper-class="nowrap-popper">
        <el-avatar class="middle cp" :src="user.avatar_url" :size="50"></el-avatar>
        <i class="middle el-icon-caret-bottom"></i>

        <template #dropdown>
          <el-dropdown-menu trigger="click">
            <el-dropdown-item class="dropdown-username">
              <div>Signed in as&nbsp;</div>
              <a class="ch" :href="user.html_url" target="_blank">
                <b>{{ user.login || user.name }}</b>
              </a>
            </el-dropdown-item>

            <el-dropdown-item command="upload" divided>
              {{ t('uploadFileEncode') }}
            </el-dropdown-item>

            <el-dropdown-item command="logout" divided>
              {{ t('logout') }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <create-dir-dialog
      :visible="showCreateDirModal"
      :before-close="toggleCreateDirModal"
    />
  </header>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { logout } from '@/utils'
import { useI18n } from 'vue-i18n'
import { Upload, Plus } from '@element-plus/icons-vue'

const { t } = useI18n()
const store = useStore()
const route = useRoute()
const showCreateDirModal = ref(false)
const user = computed(() => store.state.user)

function toggleCreateDirModal() {
  showCreateDirModal.value = !showCreateDirModal.value
}

// 上传文件
async function handleUploadFile(e: any) {
  const files = e.target.files as File[]
  const allFile = []
  for (const file of files) {
    allFile.push({ file, route })
  }
  store.dispatch('createFile', allFile)
  e.target.value = ''
}

function onCommand(command: string) {
  if (command === 'upload') {
    store.commit('saveFileEncode', true)
  } else if (command === 'logout') {
    logout()
  }
}
</script>

<style lang="scss" scoped>
.header {
  padding: 15px 30px 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #dbdbdb;
  .left {
    label {
      z-index: 3;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      cursor: pointer;
    }
  }
  .right {
    margin-right: 20px;
    display: flex;
    align-items: center;
    .el-avatar {
      border: 1px solid #f2f2f2;
    }
  }
}

.dropdown-username {
  line-height: 1.8 !important;
  color: inherit !important;
  background-color: transparent !important;
}
</style>
