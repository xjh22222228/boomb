<template>
  <header class="header">
    <Loading />

    <slot></slot>

    <div class="left">
      <el-button
        :icon="Upload"
        class="mr10"
        type="primary"
      >
        {{ t('uploadFile' )}}
        <input
          multiple
          type="file"
          class="file"
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
        <el-avatar class="middle cp" :src="user.avatar_url"></el-avatar>
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

    <file-encode-rule-dialog
      :visible="showFileRuleModal"
      :before-close="toggleFileRuleModal"
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
const showFileRuleModal = ref(false)
const user = computed(() => store.state.user)

function toggleCreateDirModal() {
  showCreateDirModal.value = !showCreateDirModal.value
}

function toggleFileRuleModal() {
  showFileRuleModal.value = !showFileRuleModal.value
}

// 上传文件
async function handleUploadFile(e: any) {
  const files = e.target.files

  for (let file of files) {
    store.dispatch('createFile', {
      file,
      route
    })
  }

  e.target.value = ''
}

function onCommand(command: string) {
  if (command === 'upload') {
    toggleFileRuleModal()
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
  .right {
    margin-right: 20px;
    display: flex;
    align-items: center;
    .el-avatar {
      border: 1px solid #f2f2f2;
    }
  }

  .file {
    position: absolute;
    top: 22px;
    left: 52px;
    width: 108px;
    height: 42px;
    opacity: 0;
    cursor: pointer;
  }
}

.dropdown-username {
  line-height: 1.8 !important;
  color: inherit !important;
  background-color: transparent !important;
}
</style>
