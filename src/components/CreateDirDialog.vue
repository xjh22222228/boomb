<template>
  <el-dialog
    title="新建文件夹"
    width="300px"
    :model-value="visible"
    :before-close="beforeClose"
  >
    <div>
      <el-input
        v-model="dirName"
        placeholder="请输入要新建的目录名"
      />
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="beforeClose">取 消</el-button>
        <el-button
          type="primary"
          @click="handleOk"
          :loading="loading"
          :disabled="dirName === ''"
        >
          确 定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { IFile } from '@/store'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'

const props = defineProps({
  visible: Boolean,
  beforeClose: {
    type: Function,
    required: true
  }
})

const loading = ref(false)
const dirName = ref('')
const store = useStore()
const route = useRoute()
const dirList = computed(() => store.getters.getDir(route))

const handleOk = function() {
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
  store.dispatch('mkdir', `${route.query.path || ''}/${v}`)
    .then(() => {
      dirName.value = ''
      props.beforeClose()
      store.dispatch('getDir', route.query.path)
      ElMessage({
        type: 'success',
        message: `创建文件夹 ${v} 成功`
      })
    })
    .finally(() => loading.value = false)
}
</script>

<style lang="scss" scoped>
</style>
