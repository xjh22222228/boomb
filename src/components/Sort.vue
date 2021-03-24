<template>
  <el-dropdown placement="bottom-end" :hide-on-click="false">
    <span class="sorter">
      {{ sortType === 1 ? t('fileSize') : t('fileName') }}
      <i :class="isUp ? 'el-icon-top' : 'el-icon-bottom'"></i>
    </span>

    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          icon="el-icon-check"
          class="item"
          :class="{active: isUp}"
          @click="isUp = true"
        >
          {{ t('asc' )}}
        </el-dropdown-item>
        <el-dropdown-item
          icon="el-icon-check"
          class="item"
          :class="{active: !isUp}"
          @click="isUp = false"
        >
          {{ t('desc' )}}
        </el-dropdown-item>

        <el-dropdown-item
          divided
          icon="el-icon-check"
          class="item"
          @click="sortType = 1"
          :class="{active: sortType === 1}"
        >
          {{ t('fileSize' )}}
        </el-dropdown-item>
        <el-dropdown-item
          icon="el-icon-check"
          class="item"
          @click="sortType = 2"
          :class="{active: sortType === 2}"
        >
          {{ t('fileName' )}}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { IFile } from '@/store'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  name: 'Sort',

  setup() {
    const { t } = useI18n()
    const store = useStore()
    const route = useRoute()
    const isUp = ref(true)
    const dir = computed<IFile[]>(() => store.state.dir)

    // 1=文件大小
    // 2=文件名
    const sortType = ref(1)

    watch([sortType, isUp], () => {
      let sortDir: IFile[] = []

      switch (sortType.value) {
        case 1:
          sortDir = dir.value.sort((a: IFile, b: IFile) => a.size - b.size)
          break
        case 2:
          sortDir = dir.value.sort((a: IFile, b: IFile) => {
            const aCode = a.name.charCodeAt(0)
            const bCode = b.name.charCodeAt(0)
            return aCode - bCode
          })
          break
      }

      // Down sort
      if (!isUp.value) {
        sortDir = sortDir.reverse()
      }

      store.commit('saveDir', {
        data: sortDir,
        path: route.query.path
      })
    })

    return {
      t,
      isUp,
      sortType
    }
  }
})
</script>

<style lang="scss" scoped>
.sorter {
  padding: 7px 12px;
  margin-left: 30px;;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all .1s linear;
  color: #000;
  font-weight: bold;

  &:hover {
    background: #f2f2f2;
  }
}

.item {

  ::deep(.el-icon-check) {
    opacity: 0 !important;
  }
}

.active {
  color: #2980ff;
  font-weight: bold;

  ::deep(i.el-icon-check) {
    opacity: 1 !important;
  }
}
</style>
