<template>
  <Header />
  <Action />
  <context-menu />
  <Language />
  <file-encode-rule-dialog />
  <upload-queue />

  <div
    class="home"
    id="home"
    @dragover="handleFileDrag"
    @dragleave="handleFileDrag"
    @drop="handleDrop"
    :class="{active: dragState === 'dragover'}"
  >
    <el-breadcrumb separator-class="el-icon-arrow-right" class="breadcrumb">
      <el-breadcrumb-item
        v-for="item of paths"
        :key="item.name"
        :to="{ query: { path: item.path } }"
      >
        {{ item.name }}
      </el-breadcrumb-item>
    </el-breadcrumb>

    <div class="toolbar">
      <el-popconfirm
        :title="t('confirmDel', {len: checkList.length})"
        :confirmButtonText="t('ok')"
        :cancelButtonText="t('cancel')"
        confirmButtonType="danger"
        iconColor="red"
        @confirm="handleDel"
      >
        <template #reference>
          <el-button
            type="danger"
            class="del-btn"
            :disabled="checkList.length === 0"
            size="small"
          >
            {{ t('bulkDel') }}
          </el-button>
          </template>
      </el-popconfirm>

      <el-checkbox v-model="isCheckAll" class="check-all">
        {{ checkList.length > 0 ? `已选择 ${checkList.length} 项` : t('allCheck') }}
      </el-checkbox>

      <Sort />
    </div>

    <el-checkbox-group v-model="checkList" v-if="dirList.length > 0">
      <div class="mod-wrapper" id="file-wrapper">
        <file-card
          v-for="(item, idx) of dirList"
          :key="item.path"
          :data="item"
        >
          <el-checkbox :label="idx"></el-checkbox>
        </file-card>
      </div>
    </el-checkbox-group>
    <el-empty v-else :description="t('noData')"></el-empty>
    
    <div class="total-num">{{ t('total', {len: dirList.length}) }}</div>
  </div>
</template>

<script lang="ts" setup>
import type { Events } from 'vue'
import type { IFile } from '@/store'
import UploadQueue from '@/components/UploadQueue.vue'
import Viewer from 'viewerjs';
import { ref, computed, nextTick, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { initClipboard, generateBreadcrumb } from '@/utils';
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const route = useRoute()
const store = useStore()
const checkList = ref<number[]>([])
const isCheckAll = ref(false)
const dragState = ref('')
const dirList = computed<IFile[]>(() => store.getters.getDir(route))

let viewer: Viewer|null

// 销毁图片预览
function destroyViewer() {
  if (viewer) {
    (viewer.destroy && viewer.destroy())
    viewer = null
  }
}

// 初始化图片预览
function initViewer() {
  destroyViewer()
  const el = document.getElementById('file-wrapper')
  if (el) {
    viewer = new Viewer(el, {
      filter(image: Element) {
        return image.classList.contains('image')
      }
    })
  }
}

// 复制粘贴上传图片
async function copyUpload(event: Events['onCopy']) {
  const items = event.clipboardData?.items
  if (!items) return
  const files: File[] = []

  if (items.length) {
    for (let i = 0; i < items.length; i++) {
      const file = items[i].getAsFile()
      if (file instanceof File) {
        files.push(file)
      }
    }
  }
  const allFile = files.map(file => ({ file, route }))
  store.dispatch('createFile', allFile)
}

function handleDrop(e: Events['onDrop']) {
  e.stopPropagation()
  e.preventDefault()
  dragState.value = e.type

  const files = e.dataTransfer!.files as any
  if (files) {
    const allFile: any[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      // 目录 type 为空
      if (file.type) {
        allFile.push({ file, route })
      }
    }
    if (allFile.length > 0) {
      store.dispatch('createFile', allFile)
    }
  }
}

function handleFileDrag(e: Events['onDragover']) {
  e.stopPropagation()
  e.preventDefault()
  dragState.value = e.type
}

async function handleDel() {
  // 只能一个一个删，并行会删除失败
  for (let idx of checkList.value) {
    const item = dirList.value[idx]
    if (item.type === 'file') {
      await store.dispatch('deleteFile', item)
    }

    if (item.type === 'dir') {
      await store.dispatch('deleteDir', item.path)
    }
  }

  getDir()
}

function getDir() {
  store.dispatch('getDir', route.query.path)
  checkList.value = []
  isCheckAll.value = false
}

// 监听路由变化获取目录列表
watch([() => route.query.path], () => {
  if (route.name === 'Home') {
    getDir()
  }
})

// 目录变化初始化图片预览
watch(dirList, () => {
  nextTick(() => {
    initViewer()
    initClipboard()
  })
})

// 全选
watch(isCheckAll, () => {
  if (isCheckAll.value) {
    checkList.value = dirList.value.map((_, idx) => idx)
  } else {
    checkList.value = []
  }
})

onMounted(() => {
  getDir()
  document.addEventListener('paste', copyUpload)
})

onUnmounted(() => {
  document.removeEventListener('paste', copyUpload)
})

// 生成面包屑路径
const paths = computed(() => 
  generateBreadcrumb(route.query.path as string)
)
</script>

<style lang="scss" scoped>
.home {
  flex: 1;
  &.active {
    border: 3px dashed #1890ff;
  }
  .mod-wrapper {
    display: flex;
    flex-wrap: wrap;
    margin-top: 30px;
    ::v-deep(.el-checkbox) {
      margin-left: 15px;
    }
    ::v-deep(.el-checkbox__label) {
      display: none !important;
    }
  }

  .toolbar {
    position: relative;
    display: flex;
    align-items: center;
    margin-top: 20px;
    .check-all {
      margin-left: 30px;
    }
    .del-btn {
      margin-left: 50px;
    }
    ::v-deep(.el-checkbox__label) {
      color: #666 !important;
    }
  }

  .breadcrumb {
    padding: 30px 0 0 50px;
    font-size: 18px;
  }

  .total-num {
    margin: 30px 0;
    width: 100%;
    text-align: center;
    color: #777;
  }
}
</style>
