<template>
  <div class="context">
    <el-dropdown>
      <img src="@/assets/locale.svg" class="locale" alt="locale" />

      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item
            @click="setLocale('zh-CN')"
            :class="{'locale-active': locale === 'zh-CN'}"
          >
            🇨🇳 简体中文
          </el-dropdown-item>
          <el-dropdown-item
            @click="setLocale('en')"
            :class="{'locale-active': locale === 'en'}"
          >
            🇬🇧 English
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script lang="ts" setup>
import i18n from '../i18n'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
const setLocale = function(locale: string) {
  i18n.global.locale = locale
  window.localStorage.setItem('locale', locale)
}
</script>

<style lang="scss" scoped>
.context {
  z-index: 999;
  position: absolute;
  top: 15px;
  right: 20px;
  
  .locale {
    cursor: pointer;
    width: 20px;
  }
}
</style>

<style lang="scss">
.locale-active {
  background-color: #e6f7ff !important;
  color: #1890ff;
}
</style>
