<template>
  <section class="new-file">
    <header class="header">
      <el-input
        v-model="fileName"
        :placeholder="t('publichFileName')"
        class="input"
        maxlength="50"
      >
      </el-input>

      <el-checkbox v-model="isTemp" class="check">{{ t('temp') }}</el-checkbox>
    </header>

    <el-input
      class="textarea"
      type="textarea"
      placeholder="Hello World..."
      v-model="content"
    >
    </el-input>

    <div class="toolbar">
      <el-button
        @click="handleCancel"
      >
        {{ t('cancel' )}}
      </el-button>

      <el-button
        type="primary"
        @click="handlePublish"
        :loading="loading"
        :disabled="!content"
      >
        {{ t('publish' )}}
      </el-button>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import { isSuccess } from '@/utils/http'

const fileName = ref('')
const content = ref('')
const isTemp = ref(false)
const loading = ref(false)
const { t } = useI18n()
const store = useStore()
const route = useRoute()
const router = useRouter()

const handlePublish = async function() {
  loading.value = true
  const path = route.query.path
  const res = await store.dispatch('newFile', {
    fileName: fileName.value,
    content: content.value,
    isTemp: isTemp.value,
    path
  })

  loading.value = false

  if (isSuccess(res?.status)) {
    router.replace({
      name: 'Home',
      query: {
        path: isTemp.value ? '/.temp' : route.query.path
      }
    })
  }
}

const handleCancel = function() {
  router.replace({
    path: '/',
    query: {
      path: route.query.path
    }
  })
}
</script>

<style lang="scss">
.new-file {
  z-index: 999;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  display: flex;
  flex-direction: column;

  .header {
    border-bottom: 1px solid #eee;
    display: flex;
    padding: 5px 10px;
    .input {
      margin-right: 10px;
    }
  }

  .textarea {
    flex: 1;
    textarea {
      height: 100% !important;
      font-size: 18px;
    }
  }

  .toolbar {
    height: 40px;
    padding: 7px 15px;
    text-align: right;
    border-top: 1px solid #eee;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
}
</style>
