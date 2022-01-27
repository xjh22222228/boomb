<template>
  <el-icon
    class="arrow-left"
    @click="showDrawer = true"
    v-if="uploadQueue.length > 0"
  >
    <d-arrow-left />
  </el-icon>

  <el-drawer
    v-model="showDrawer"
    :title="t('uploadQueue')"
    size="400px"
  >
    <div>
      <div
        class="item"
        :class="{
          error: item.status === 'error',
          success: item.status === 'success',
          uploading: item.status === 'uploading'
        }"
        v-for="(item, idx) of uploadQueue" :key="item.url"
      >
        <a :href="item.url" class="url" target="_blank">
          <Spin />
          <img class="img" :src="item.url" />
        </a>
        <div class="middle">
          <span class="progress">{{ item.status === 'error' ? 0 : item.progress }}%</span>
          <span class="name">{{ item.name }}</span>
        </div>
        <el-icon class="icon-del" @click="onDelete(idx)"><delete /></el-icon>
      </div>
    </div>
  </el-drawer>
</template>

<script lang="ts" setup>
import { DArrowLeft, Delete } from '@element-plus/icons-vue'
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import Spin from '@/components/Spin.vue'

const { t } = useI18n()
const showDrawer = ref(false)
const store = useStore()
const uploadQueue = computed(() => store.state.uploadQueue)

function onDelete(idx: number) {
  store.commit('removeUploadQueueByIdx', idx)
}

watch(store.state.uploadQueue, val => {
  if (val.length === 0) {
    showDrawer.value = false
  }
})
</script>

<style lang="scss" scoped>
.arrow-left {
  z-index: 18;
  position: fixed;
  right: 0;
  top: 50%;
  margin-top: -80px;
  font-size: 24px;
  cursor: pointer;
}
.item {
  padding: 8px;
  border: 1px solid #d9d9d9;
  border-radius: 2px;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  &.error {
    border-color: #ff4d4f;
    color: #ff4d4f;
    .name,
    .progress,
    .icon-del {
      color: inherit;
    }
  }
  &.success {
    border-color: #41b883;
    .progress {
      color: inherit;
      color: #41b883;
    }
    .g-loading {
      display: none;
    }
  }
  &.uploading {
    .url {
      pointer-events: none;
      .img {
        display: none;
      }
    }
  }
  .url {
    position: relative;
    display: inline-block;
    width: 48px;
    height: 48px;
    border: .5px solid #f2f2f2;
  }
  .img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: .8;
  }
  .middle {
    font-size: 13px;
    flex: 1;
    padding: 0 10px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    .progress {
      margin-right: 5px;
    }
  }
  .name {
    color: #1890ff;
  }
  .icon-del {
    cursor: pointer;
  }
}
</style>
