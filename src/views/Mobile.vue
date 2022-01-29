<template>
  <div class="mobile-page">
    <Header />
    <action-app />

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
    </div>

    <sort />

    <el-checkbox-group v-model="checkList" v-if="dirList.length > 0">
      <div class="mod-wrapper" id="file-wrapper">
        <file-list
          v-for="(item, idx) of dirList"
          :key="item.path"
          :data="item"
        >
          <template v-slot:right>
            <el-checkbox :label="idx"></el-checkbox>
          </template>
        </file-list>
      </div>
    </el-checkbox-group>
    <el-empty v-else :description="t('noData')"></el-empty>
    
    <div class="total-num">{{ t('total', {len: dirList.length}) }}</div>
  </div>
</template>

<script lang="ts" setup>
import type { IFile } from '@/store'
import Viewer from 'viewerjs'
import Header from '@/components/HeaderApp.vue'
import { ref, computed, nextTick, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { initClipboard, generateBreadcrumb } from '@/utils'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const route = useRoute()
const store = useStore()
const checkList = ref<number[]>([])
const isCheckAll = ref(false)
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
        return image.classList.contains('picture')
      }
    })
  }
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
  if (route.name === 'Mobile') {
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
})

// 生成面包屑路径
const paths = computed(() => 
  generateBreadcrumb(route.query.path as string)
)
</script>

<style lang="scss" scoped>
.mobile-page {
  flex: 1;
  .mod-wrapper {
    margin-top: 10px;
    ::v-deep(.el-checkbox__label) {
      display: none !important;
    }
  }

  .toolbar {
    position: relative;
    margin-top: 10px;
    .check-all {
      margin-left: 30px;
    }
    .del-btn {
      margin: 0 0 0 15px;
    }
    ::v-deep(.el-checkbox__label) {
      color: #666 !important;
    }
  }

  .breadcrumb {
    padding: 20px 0 0 15px;
    font-size: 18px;
  }

  .total-num {
    margin: 30px 0;
    width: 100%;
    text-align: center;
    color: #777;
  }

  ::v-deep(.sorter) {
    margin-left: 5px;
    margin-top: 15px;
  }
}
</style>
