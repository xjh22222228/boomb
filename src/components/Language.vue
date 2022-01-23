<template>
  <div class="context">
    <el-dropdown @command="onCommand" popper-class="nowrap-popper">
      <img src="@/assets/locale.svg" class="locale" alt="locale" />

      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item
            command="zh-CN"
          >
            🇨🇳 简体中文
          </el-dropdown-item>
          <el-dropdown-item
            command="en"
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

const setLocale = function(locale: string) {
  i18n.global.locale = locale
  localStorage.setItem('locale', locale)
}

function onCommand(command: string) {
  if (command === 'zh-CN') {
    setLocale('zh-CN')
  } else if (command === 'en') {
    setLocale('en')
  }
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
