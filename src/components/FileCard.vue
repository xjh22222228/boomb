<template>
  <div>
    <el-popover
      placement="bottom"
      trigger="hover"
      :width="420"
      :disabled="!isFile"
    >
      <div>
        <div class="file-wrapper">
          <div>
            <el-button
              v-if="isFile"
              :icon="Upload"
              class="mr10"
            >
              {{ t('changeFile') }}
              <label :for="`f${data.name}`" class="file-label"></label>
              <input
                type="file"
                :id="`f${data.name}`"
                class="none"
                @change="handleUpdateFile"
              />
            </el-button>
          </div>
          <div>
            <div>
              {{ data.sizeLabel }}
              ·
              <a
                :href="editUrl"
                class="inline-block ml10 mt10"
                target="_blank"
                v-if="isFile && !isImg"
              >
                {{ t('editFile') }}
              </a>
            </div>
            <div>
              <a :href="defCDN" target="_blank">{{ data.name }}</a>
            </div>
          </div>
        </div>

        <template v-if="isGitee">
          <el-input v-model="giteeCDN" readonly class="mb10 mt10">
            <template #prepend>
              <a :href="giteeCDN" target="_blank">Gitee</a>
            </template>
            <template #append>
              <span class="copy" :data-clipboard-text="giteeCDN">
                <el-icon><document-copy /></el-icon>
              </span>
            </template>
          </el-input>
        </template>

        <template v-else>
          <el-input v-model="jsdelivrCDN" readonly class="mb10 mt10">
            <template #prepend>
              <a :href="jsdelivrCDN" target="_blank">Jsdelivr</a>
            </template>
            <template #append>
              <span class="copy" :data-clipboard-text="jsdelivrCDN">
                <el-icon><document-copy /></el-icon>
              </span>
            </template>
          </el-input>

          <el-input v-model="githubCDN" readonly class="mb10">
            <template #prepend>
              <a :href="githubCDN" target="_blank">Github</a>
            </template>
            <template #append>
              <span class="copy" :data-clipboard-text="githubCDN">
                <el-icon><document-copy /></el-icon>
              </span>
            </template>
          </el-input>
        </template>

        <el-input v-model="html" readonly class="mb10">
          <template #prepend>
            <a :href="html" target="_blank">HTML</a>
          </template>
          <template #append>
            <span class="copy" :data-clipboard-text="html">
              <el-icon><document-copy /></el-icon>
            </span>
          </template>
        </el-input>

        <el-input v-model="markdown" readonly>
          <template #prepend>
            <a :href="jsdelivrCDN" target="_blank">Markdown</a>
          </template>
          <template #append>
            <span class="copy" :data-clipboard-text="markdown">
              <el-icon><document-copy /></el-icon>
            </span>
          </template>
        </el-input>
      </div>
    
      <template #reference>
        <div>
          <slot></slot>

          <div class="file" :id="'file-' + data.name">
            <div
              class="file-icon"
              :class="{'no-load': imgLoaded, error: hasError}"
            >
              <img
                v-show="!hasError"
                :src="fileUrl"
                :class="{'zoom-in': isImg, image: isImg}"
                draggable="false"
                @click="goDir"
                @load="imgLoaded = true"
                @error="hasError = true"
                alt=""
              />
            </div>
            <div class="filename">{{ data.name }}</div>
          </div>
        </div>
      </template>
    </el-popover>
  </div>
</template>

<script lang="ts" setup>
import type { PropType } from 'vue'
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import { getCdn, updateFileContent } from '@/services'
import type { IFile } from '@/store'
import { getBase64, getFileUrl, isImage, getEditFileUrl } from '@/utils'
import { ElMessage } from 'element-plus'
import { isSuccess } from '@/utils/http'
import { useI18n } from 'vue-i18n'
import { Upload, DocumentCopy } from '@element-plus/icons-vue'
import { NetworkCDN } from '@/types'
import { isGiteeProvider } from '@/utils/storage'


const props = defineProps({
  data: {
    type: Object as PropType<IFile>,
    default: () => ({}),
  }
})

const isGitee = isGiteeProvider()
const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useStore()
const hasError = ref(false)
const imgLoaded = ref(false)
const fileName = props.data.name.toLowerCase()
const fileType = props.data.type
const filePath = props.data.path
const jsdelivrCDN = getCdn(NetworkCDN.Jsdelivr, filePath)
const githubCDN = getCdn(NetworkCDN.Github, filePath)
const giteeCDN = getCdn(NetworkCDN.Gitee, filePath)
const isImg = isImage(fileName)
const fileUrl = getFileUrl(props.data)
const defCDN = isGitee ? giteeCDN : jsdelivrCDN
const markdown = `![](${defCDN})`
const html = `<a href="${defCDN}" target="_blank"><img src="${defCDN}" /></a>`
const editUrl = getEditFileUrl(filePath)
const isFile = fileType !== 'dir'

const handleUpdateFile = async function(e: any) {
  const files = e.target.files
  if (files.length <= 0) return

  const file = files[0] as File
  const { url: base64 } = await getBase64(file)

  updateFileContent(props.data, {
    content: base64,
    isEncode: false
  }).then(res => {
    if (isSuccess(res.status)) {
      store.dispatch('getDir', route.query.path)
      ElMessage({
        type: 'success',
        message: '更新成功, 可能由于缓存未能及时更新'
      })
    }
  })

  e.target.value = ''
}

function goDir() {
  if (fileType === 'dir') {
    router.replace({
      path: '/',
      query: {
        path: `/${filePath}`
      }
    })
  }
}
</script>

<style lang="scss" scoped>
.file {
  padding: 10px 20px;
  width: 100px;
  text-align: center;
  transition: .1s;
  border-radius: 5px;
  margin: 0 10px 15px 10px;
  cursor: pointer;
  &.actived .filename::after {
    background-color: #f56c6c;
    opacity: 1;
  }
  &:hover {
    background: rgba($color: #000000, $alpha: .01);
    .filename::after {
      opacity: 1 !important;
      top: 0 !important;
    }
  }

  .file-icon {
    position: relative;
    width: 100px;
    height: 80px;
    border: 1px solid #eee;
    cursor: pointer;
    &.no-load:after {
      display: none;
    }
    &.error:after {
      background: #fff url("@/assets/error-img.svg") no-repeat;
      background-size: 50px;
      background-position: center;
    }
    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    &:after {
      content: "";
      z-index: 9;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: #fff url("@/assets/loading.svg") no-repeat;
      background-size: 80px;
      background-position: center;
    }
  }
  .filename {
    position: relative;
    line-height: 1.5;
    color: #000;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 14px;
    margin-top: 8px;
    &::after {
      content: '';
      position: absolute;
      z-index: -1;
      top: 60%;
      left: -0.1em;
      right: -0.1em;
      bottom: 0;
      transition: top 200ms cubic-bezier(0, 0.8, 0.13, 1);
      background-color: rgba(79, 192, 141, 0.5);
      opacity: 0;
    }
  }
}

.copy {
  cursor: pointer;
}
.file-label {
  z-index: 2;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}
</style>

<style lang="scss">
.file-wrapper {
  display: flex;
  align-items: center;
  .mr10 {
    position: relative;
  }
}
</style>
