<template>
  <header class="header">
    <Loading />

    <div class="left">
      <el-button
        icon="el-icon-upload2"
        class="mr10"
        type="primary"
      >
        上传文件
        <input multiple type="file" class="file" @change="handleUploadFile($event)" />
      </el-button>

      <el-button
        icon="el-icon-plus"
        @click="toggleModal"
      >
        新建文件夹
      </el-button>
    </div>

    <div class="right">
      <span class="user-info">{{ user.name || user.login }}</span>
      <a :href="user.html_url" target="_blank">
        <el-avatar :src="user.avatar_url"></el-avatar>
      </a>

      <el-tooltip content="Logout" placement="bottom-start">
        <img
          src="@/assets/logout.svg"
          alt=""
          class="logout"
          draggable="false"
          @click="logout"
        >
      </el-tooltip>
    </div>

    <el-dialog
      title="新建文件夹"
      v-model="showModal"
      width="500px"
      :before-close="toggleModal"
    >
      <div>
        <el-input
          v-model="dirName"
          placeholder="请输入要新建的目录名"
        />
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showModal = false">取 消</el-button>
          <el-button type="primary" @click="createDirectory" :loading="loading">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </header>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { IFile } from '@/store'
import { ElMessage } from 'element-plus'
import { logout } from '@/utils'

export default defineComponent({
  name: 'Header',

  setup() {
    const store = useStore()
    const route = useRoute()
    const showModal = ref(false)
    const loading = ref(false)
    const dirName = ref('')
    const dirList = computed(() => store.state.dir)

    function toggleModal() {
      showModal.value = !showModal.value
    }

    // 新建文件夹
    function createDirectory() {
      const v = dirName.value.trim()
      if (!v) return
      const dirs: IFile[] = dirList.value
      const exists = dirs.some(item => item.name === v)
      if (exists) {
        ElMessage({
          type: 'error',
          message: `已存在 ${v} 文件夹`
        })
        return
      }

      loading.value = true
      store.dispatch('mkdir', `${route.query.path || ''}/${v}`).then(() => {
        toggleModal()
        store.dispatch('getDir', route.query.path)
        ElMessage({
          type: 'success',
          message: `创建文件夹 ${v} 成功`
        })
      }).finally(() => loading.value = false)
    }

    // 上传文件
    async function handleUploadFile(e: any) {
      const files = e.target?.files

      for (let file of files) {
        store.dispatch('createFile', {
          file,
          route
        })
      }
    }

    return {
      showModal,
      loading,
      dirName,
      user: computed(() => store.state.user),

      toggleModal,
      createDirectory,
      handleUploadFile,
      logout
    }
  }
})
</script>

<style lang="scss" scoped>
.header {
  padding: 15px 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #dbdbdb;

  .right {
    display: flex;
    align-items: center;

    .user-info {
      margin: 7px 10px 0 0;
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

  .logout {
    width: 30px;
    height: 30px;
    margin-left: 15px;
    cursor: pointer;
  }
}

.dropdown-item {
  display: flex;
  align-items: center;

  .icon {
    width: 25px;
    height: 25px;
    margin-right: 10px;
  }
}
</style>
