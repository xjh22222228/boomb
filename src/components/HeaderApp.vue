<template>
  <div class="headerapp">
    <el-icon class="icon" @click="goBack"><arrow-left-bold /></el-icon>

    <el-icon class="icon" @click="showDrawer = true"><more-filled /></el-icon>

    <el-drawer
      v-model="showDrawer"
      direction="btt"
      :before-close="handleClose"
      destroy-on-close
      :show-close="false"
      :with-header="false"
      size="auto"
      custom-class="drawer-app"
    >
      <div @click="handleClose">
        <div class="info">
          <el-avatar class="middle cp" :src="user.avatar_url" :size="50"></el-avatar>
          <div>Signed in as&nbsp; <b>{{ user.login || user.name }}</b></div>
        </div>

        <div class="item" @click="clickFileEncode">
          {{ t('uploadFileEncode') }}
        </div>
        <div class="item" @click="logout">
          {{ t('logout') }}
        </div>
      </div>
    </el-drawer>

    <file-encode-rule-dialog />
  </div>
</template>

<script lang="ts" setup>
import { ArrowLeftBold, MoreFilled } from '@element-plus/icons-vue'
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { logout } from '@/utils'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const { t } = useI18n()
const store = useStore()
const showDrawer = ref(false)
const user = computed(() => store.state.user)
const router = useRouter()

function handleClose() {
  showDrawer.value = false
}

function clickFileEncode() {
  store.commit('saveFileEncode', true)
}

function goBack() {
  router.back()
}
</script>

<style lang="scss" scoped>
.headerapp {
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  .icon {
    font-size: 24px;
    color: #666;
  }
  .drawer-app {
    .item {
      text-align: center;
      font-size: 18px;
      color: #409eff;
      padding: 20px 0;
      user-select: none;
      &:not(:nth-last-child(1)) {
        border-bottom: 1px solid #f2f2f2;
      }
      &:active {
        background-color: #f2f2f2;
      }
    }
    .info {
      padding: 20px 0;
      text-align: center;
      font-size: 16px;
      color: #666;
      user-select: none;
      border-bottom: 1px solid #f2f2f2;
    }
  }
}
</style>

<style lang="scss">
.drawer-app {
  border-radius: 5px 5px 0 0;
  .el-drawer__body {
    padding: 0;
    border-radius: 3px 3px 0 0;
    overflow: hidden;
  }
}
</style>
