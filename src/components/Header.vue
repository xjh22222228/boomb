<template>
  <header class="header">
    <Loading />

    <slot></slot>

    <div class="left">
      <el-button
        icon="el-icon-upload2"
        class="mr10"
        type="primary"
        size="small"
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
        icon="el-icon-plus"
        @click="toggleCreateDirModal"
        id="mkdir-btn"
        size="small"
      >
        {{ t('createDir' )}}
      </el-button>
    </div>

    <div class="right">
      <el-dropdown>
        <el-avatar class="middle cp" :src="user.avatar_url"></el-avatar>
        <i class="middle el-icon-caret-bottom"></i>

        <template #dropdown>
          <el-dropdown-menu trigger="click">
            <el-dropdown-item class="dropdown-username">
              <div>Signed in as</div>
              <a class="ch" :href="user.html_url" target="_blank">
                <b>{{ user.login || user.name }}</b>
              </a>
            </el-dropdown-item>

            <el-dropdown-item divided @click="toggleFileRuleModal">
              {{ t('uploadFileEncode') }}
            </el-dropdown-item>

            <el-dropdown-item divided @click="logout">
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

<script lang="ts">
import { defineComponent, computed, ref } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { logout } from '@/utils'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  name: 'Header',

  setup() {
    const { t } = useI18n()
    const store = useStore()
    const route = useRoute()
    const showCreateDirModal = ref(false)
    const showFileRuleModal = ref(false)

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

    return {
      t,
      showCreateDirModal,
      showFileRuleModal,
      user: computed(() => store.state.user),

      toggleCreateDirModal,
      toggleFileRuleModal,
      handleUploadFile,
      logout
    }
  }
})
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
