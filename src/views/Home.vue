<template>
  <Header />

  <div
    class="home"
    @dragenter.prevent="handleDragEnter"
    @dragover.prevent="funcPass"
    @drop="handleDrop"
  >
    <el-breadcrumb separator=">" class="breadcrumb">
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
        :title="`您确定要删除${checkList.length}个文件吗？`"
        confirmButtonText="确定"
        cancelButtonText="取消"
        confirmButtonType="danger"
        iconColor="red"
        @confirm="handleDel"
      >
        <template #reference>
          <el-button
            type="danger"
            class="del-btn"
            :disabled="checkList.length === 0"
            size="mini"
          >
            批量删除
          </el-button>
          </template>
      </el-popconfirm>

      <el-checkbox v-model="isCheckAll" class="check-all" v-if="dirList.length > 0">全选</el-checkbox>

      <Loading />
    </div>

    <el-checkbox-group v-model="checkList" v-if="dirList.length > 0">
      <div class="mod-wrapper" id="file-wrapper">
        <File
          v-for="(item, idx) of dirList"
          :key="item.path"
          :data="item"
        >
          <el-checkbox :label="idx"></el-checkbox>
        </File>
      </div>
    </el-checkbox-group>
    <el-empty v-else description="怎么什么都没，赶紧将文件拖到这里吧~"></el-empty>
    
    <div class="total-num">共 {{ dirList.length }} 项</div>
  </div>
</template>

<script lang="ts">
import Loading from '@/components/Loading.vue';
import FileComponent from '../components/File.vue'
import Viewer from 'viewerjs';
import debounce from 'lodash.debounce'
import { ref, computed, defineComponent, nextTick, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { IFile } from '@/store'
import { initClipboard } from '@/utils';

export default defineComponent({
  components: { File: FileComponent, Loading },
  name: 'HomePage',

  setup() {
    const route = useRoute()
    const store = useStore()
    const checkList = ref<number[]>([])
    const isCheckAll = ref(false)
    const dirList = computed<IFile[]>(() => store.state.dir)
    let homeEl: HTMLElement

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
          filter(image: HTMLElement) {
            const isImg = image.classList.contains('image')
            return isImg
          }
        })
      }
    }

    // 复制粘贴上传图片
    async function copyUpload(event: any) {
      const items = event.clipboardData?.items
      let files: File[] = []

      if (items.length) {
        for (let i = 0; i < items.length; i++) {
          const file = items[i].getAsFile()
          if (file instanceof File) {
            files.push(file)
          }
        }
      }

      for (let file of files) {
        store.dispatch('createFile', {
          file,
          route
        })
      }
    }

    function handleDrop(e: DragEvent) {
      e.stopPropagation()
      e.preventDefault()

      const files = e!.dataTransfer!.files
      if (files) {
        for (let file of files) {
          // 目录 type 为空
          if (file.type) {
            store.dispatch('createFile', {
              file,
              route
            })
          }
        }
      }
    }

    const removeHomeActive = debounce(() => {
      homeEl.classList.remove('active')
    }, 3000)

    function handleDragEnter() {
      homeEl.classList.add('active')
      removeHomeActive()
    }

    async function handleDel() {
      const promises: Promise<any>[] = [];
      checkList.value.forEach(idx => {
        const item = dirList.value[idx]
        if (item.type === 'file') {
          promises.push(store.dispatch('deleteFile', item))
        }
      })
      await Promise.allSettled(promises)
      getDir()
    }

    function getDir() {
      store.dispatch('getDir', route.query.path)
      checkList.value = []
      isCheckAll.value = false
    }

    // 监听路由变化获取目录列表
    watch([() => route.query.path], () => {
      getDir()
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
      homeEl = document.querySelector('.home') as HTMLElement
    })

    onUnmounted(() => {
      document.removeEventListener('paste', copyUpload)
    })

    // 生成面包屑路径
    const paths = computed(() => {
      let pathsList = (route.query.path as string || '').split('/') as any

      let fullPath = '';
      for (let i = 0; i < pathsList.length; i++) {
        const path = pathsList[i]
        fullPath += '/' + path

        pathsList[i] = {
          name: path === '' ? '全部' : path,
          path: fullPath.startsWith('//')
            ? fullPath.slice(1)
            : fullPath === '/'
              ? ''
              : fullPath
        };
      }

      return pathsList
    })

    return {
      checkList,
      isCheckAll,
      dirList,
      paths,

      handleDel,
      handleDrop,
      handleDragEnter,
      funcPass: () => {},
    }
  }
})
</script>

<style lang="scss">
@keyframes going {
  from {
    transform: translate(-100px, 0);
  }

  to {
    transform: translate(200px, 0);
  }
}

.home {
  flex: 1;

  &.active {
    border: 3px dashed #1890ff;
  }
}

.mod-wrapper {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 50px;

  .el-checkbox__label {
    display: none;
  }
}

.toolbar {
  position: relative;

  .check-all {
    margin-left: 30px;
  }

  .del-btn {
    margin: 20px 0 0 50px;
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
</style>
