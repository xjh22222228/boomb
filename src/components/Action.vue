<template>
  <div class="wrapper">
    <el-dropdown placement="top" popper-class="nowrap-popper">
      <div class="img" :style="{'background-image': `url(${baseUrl}favicon.png)`}"></div>

      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item
            @click="handleInfo"
            v-if="isLogin"
          >
            {{ t('info') }}
          </el-dropdown-item>

          <el-dropdown-item>
            <a href="https://issue-helper.vercel.app/?repo=xjh22222228/boomb" target="_blank" class="ch">{{ t('report') }}</a>
          </el-dropdown-item>
          <el-dropdown-item @click="handleAbout">{{ t('about') }}</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { getLocalId, getLocalBranch, getLocalRepo } from '@/utils/storage'

const { t } = useI18n()
const baseUrl = import.meta.env.BASE_URL
const store = useStore()
const isLogin = computed(() => store.state.isLogin)

const handleAbout = function() {
  ElMessageBox.confirm('', {
    title: t('what'),
    dangerouslyUseHTMLString: true,
    message: t('description'),
    cancelButtonText: t('cancel'),
    confirmButtonText: t('ok'),
  }).catch(() => {})
}

const handleInfo = function() {
  ElMessageBox.confirm('', {
    cancelButtonText: t('cancel'),
    confirmButtonText: t('ok'),
    title: t('info'),
    dangerouslyUseHTMLString: true,
    message: `
      <p class="mb10">ID: <a href="https://github.com/${getLocalId()}/tree/${getLocalBranch()}" target="_blank">${getLocalId()}</a></p>
      <p class="mb10">Repository: ${getLocalRepo()}</p>
      <p class="mb10">Branch: ${getLocalBranch()}</p>
    `,
  }).catch(() => {})
}
</script>

<style lang="scss" scoped>
.wrapper {
  z-index: 99;
  position: fixed;
  bottom: 150px;
  right: 30px;
  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  background: #fff;
  cursor: pointer;
  box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12),
              0 6px 16px 0 rgba(0, 0, 0, 0.08),
              0 9px 28px 8px rgba(0, 0, 0, 0.05);
}
.img {
  width: 30px;
  height: 30px;
  background-size: 100%;
}
</style>
