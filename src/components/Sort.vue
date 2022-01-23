<template>
  <el-dropdown placement="bottom-end" :hide-on-click="false">
    <span class="sorter">
      {{ sortType === SortType.FileSize ? t('fileSize') : t('fileName') }}

      <el-icon v-if="isUp"><top /></el-icon>
      <el-icon v-else><bottom /></el-icon>
    </span>

    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          @click="isUp = true"
        >
          <el-icon :class="{transparent: !isUp}"><Check /></el-icon>
          {{ t('asc' )}}
        </el-dropdown-item>
        <el-dropdown-item
          @click="isUp = false"
        >
          <el-icon :class="{transparent: isUp}"><Check /></el-icon>
          {{ t('desc' )}}
        </el-dropdown-item>

        <el-dropdown-item
          divided
          @click="sortType = SortType.FileSize"
        >
          <el-icon :class="{transparent: sortType !== SortType.FileSize}"><Check /></el-icon>
          {{ t('fileSize' )}}
        </el-dropdown-item>
        <el-dropdown-item
          @click="sortType = SortType.FileName"
        >
          <el-icon :class="{transparent: sortType !== SortType.FileName}"><Check /></el-icon>
          {{ t('fileName' )}}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script lang="ts" setup>
import type { IFile } from '@/store'
import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getCharCode } from '@/utils'
import { Check, Top, Bottom } from '@element-plus/icons-vue'
import { SortType } from '@/types'


const { t } = useI18n()
const store = useStore()
const route = useRoute()
const isUp = ref(true)
const dir = computed<IFile[]>(() => store.getters.getDir(route))

const sortType = ref(SortType.FileSize)

watch([sortType, isUp], () => {
  let sortDir: IFile[] = []

  switch (sortType.value) {
    case SortType.FileSize:
      sortDir = dir.value.sort((a: IFile, b: IFile) => (a.size ?? 0) - (b.size ?? 0))
      break

    case SortType.FileName:
      sortDir = dir.value.sort((a: IFile, b: IFile) => {
        const aCode = getCharCode(a.name)
        const bCode = getCharCode(b.name)
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
</style>
