<template>
  <el-dialog
    :title="t('uploadFileEncode')"
    width="500px"
    :model-value="visible"
    :before-close="beforeClose"
    custom-class="encode-dialog"
  >
    <div>
      <el-radio-group v-model="value">
        <div class="mb20">
          <el-radio :label="FileEncode.RawName">原文件名 => boomb.jpg</el-radio>
        </div>
        <div class="mb20">
          <el-radio :label="FileEncode.NumRawName">随机数前缀+原文件名（如果重复） => 12345-boomb.jpg</el-radio>
        </div>
        <div class="mb20">
          <el-radio :label="FileEncode.UUID">UUID => 9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d.jpg</el-radio>
        </div>
        <div class="mb20">
          <el-radio :label="FileEncode.Timestamp">时间戳 (批量上传不会重复) => 1613333896.jpg</el-radio>
        </div>
      </el-radio-group>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="beforeClose">{{ t('cancel') }}</el-button>
        <el-button type="primary" @click="handleOk">{{ t('ok') }}</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { FileEncode } from '@/types'
import { getFileEncode } from '@/utils'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const store = useStore()
const visible = computed(() => store.state.showFileEncode)

const value = ref(getFileEncode())

const beforeClose = () => {
  store.commit('saveFileEncode', false)
}

const handleOk = function() {
  beforeClose()
  localStorage.setItem('fileEncode', String(value.value))
}
</script>

<style lang="scss">
.encode-dialog {
  max-width: calc(100% - 24px);
  .el-dialog__body {
    overflow: hidden;
    overflow-x: auto;
  }
}
</style>
