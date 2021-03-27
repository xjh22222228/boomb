<template>
  <el-dialog
    title="文件上传方案"
    width="500px"
    :model-value="visible"
    :before-close="beforeClose"
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
          <el-radio :label="FileEncode.Timestamp">时间戳 (秒) => 1613333896.jpg</el-radio>
        </div>
      </el-radio-group>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="beforeClose">取 消</el-button>
        <el-button type="primary" @click="handleOk">确 定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { FileEncode } from "@/types"
import { getFileEncode } from '@/utils'

export default defineComponent({
  name: 'FileEncodeRuleDialog',

  props: {
    visible: Boolean,
    beforeClose: {
      type: Function,
      required: true
    }
  },

  setup(props) {
    const value = ref(getFileEncode())

    const handleOk = function() {
      props.beforeClose()

      window.localStorage.setItem('fileEncode', String(value.value))
    }

    return {
      value,
      FileEncode,
      handleOk,
    }
  }
})
</script>

