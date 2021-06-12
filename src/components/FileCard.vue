<template>
  <div>
    <el-popover
      placement="bottom"
      trigger="hover"
      :width="400"
      :disabled="!isFile"
    >
      <div>
        <div class="file-wrapper">
          <div>
            <el-button
              icon="el-icon-upload2"
              v-if="isFile"
              class="mr10"
            >
              {{ t('changeFile') }}
              <input
                type="file"
                class="file-input"
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
              <a :href="cdn1" target="_blank">{{ data.name }}</a>
            </div>
          </div>
        </div>

        <el-input v-model="cdn1" class="mb10 mt10">
          <template #prepend>
            <a :href="cdn1" target="_blank">CDN1</a>
          </template>
          <template #append>
            <i
              class="el-icon-document-copy copy"
              :data-clipboard-text="cdn1"
            >
            </i>
          </template>
        </el-input>

        <el-input v-model="cdn2" class="mb10">
          <template #prepend>
            <a :href="cdn2" target="_blank">CDN2</a>
          </template>
          <template #append>
            <i
              class="el-icon-document-copy copy"
              :data-clipboard-text="cdn2"
            >
            </i>
          </template>
        </el-input>

        <el-input v-model="html" class="mb10">
          <template #prepend>
            <a :href="html" target="_blank">HTML</a>
          </template>
          <template #append>
            <i
              class="el-icon-document-copy copy"
              :data-clipboard-text="html"
            >
            </i>
          </template>
        </el-input>

        <el-input v-model="markdown">
          <template #prepend>
            <a :href="cdn1" target="_blank">Markdown</a>
          </template>
          <template #append>
            <i
              class="el-icon-document-copy copy"
              :data-clipboard-text="markdown"
            >
            </i>
          </template>
        </el-input>
      </div>
    
      <template #reference>
        <div>
          <slot></slot>

          <div class="file">
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

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import { getCdn, CDN, updateFileContent } from '@/services'
import { IFile } from '@/store'
import { getBase64, getFileUrl, isImage, getEditFileUrl } from '@/utils'
import { ElMessage } from 'element-plus'
import { isSuccess } from '@/utils/http'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  name: 'FileCard',

  props: {
    data: {
      type: Object as PropType<IFile>,
      default: () => ({}),
    }
  },

  setup(props) {
    const { t } = useI18n()
    const route = useRoute()
    const router = useRouter()
    const store = useStore()
    const hasError = ref(false)
    const imgLoaded = ref(false)
    const fileName = props.data.name.toLowerCase()
    const fileType = props.data.type
    const filePath = props.data.path
    const CDN1 = getCdn(CDN.Jsdelivr, filePath, false)
    const isImg = isImage(fileName)
    const fileUrl = getFileUrl(props.data)

    const handleUpdateFile = async function(e: any) {
      const files = e.target.files
      if (files.length <= 0) return

      const file = files[0] as File
      const base64 = await getBase64(file)

      updateFileContent(props.data, {
        content: base64,
        isEncode: false
      }).then(res => {
        if (isSuccess(res.status)) {
          store.dispatch('getDir', route.query.path)
          ElMessage({
            type: 'success',
            message: '更新成功, 由于缓存策略需要次日更新'
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

    return {
      t,
      fileUrl,
      isImg,
      isFile: fileType !== 'dir',
      hasError,
      imgLoaded,
      cdn1: CDN1,
      cdn2: getCdn(CDN.Github, filePath, false),
      markdown: `![](${CDN1})`,
      html: `<a href="${CDN1}" target="_blank"><img src="${CDN1}" alt="" /></a>`,
      editUrl: getEditFileUrl(filePath),

      handleUpdateFile,
      goDir,
    }
  }
})
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

  &:hover {
    background: #f4f4f4;
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
      background: #fff url("~@/assets/error.svg") no-repeat 100% 100%;
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
      background: #fff url("~@/assets/loading.svg") no-repeat;
      background-size: 80px;
      background-position: center;
    }
  }

  .filename {
    line-height: 1.5;
    color: #000;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 14px;
    margin-top: 8px;
  }
}

.copy {
  cursor: pointer;
}

.file-input {
  position: absolute;
  top: 22px;
  left: 52px;
  width: 108px;
  height: 42px;
  opacity: 0;
}
</style>

<style lang="scss">
.file-wrapper {
  display: flex;
  align-items: center;
}
</style>
