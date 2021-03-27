<template>
  <div>
    <el-popover
      placement="bottom"
      trigger="hover"
      :width="400"
    >
      <div>
        <p v-if="isFile">
          <el-button
            icon="el-icon-upload2"
          >
            {{ t('changeFile') }}
            <input
              type="file"
              class="file-input"
              @change="handleUpdateFile($event)"
            />
          </el-button>
        </p>
        <p>
          {{ isFile ? t('fileName') : t('dirName') }}:
          <a :href="cdn1" target="_blank">{{ data.name }}</a>
        </p>
        <p>{{ t('fileSize') }}: {{ data.sizeLabel }}</p>
        <el-input v-model="cdn1" class="mb10">
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

        <el-input v-model="cdn2">
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
      </div>
    
      <template #reference>
        <div>
          <slot></slot>

          <div class="file">
            <div
              class="file-icon"
              :class="{'no-load': !imgLoad, error: hasError}"
            >
              <img
                v-show="!hasError"
                :src="fileUrl"
                :class="{'zoom-in': isImage, 'image': isImage}"
                draggable="false"
                @click="goDir"
                @load="imgLoad = false"
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
import { defineComponent, computed, PropType, ref } from 'vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import { getCdn, CDN, updateFileContent } from '@/services'
import { IFile } from '@/store'
import { getBase64 } from '@/utils'
import { ElMessage } from 'element-plus'
import { isSuccess } from '@/utils/http'
import { useI18n } from 'vue-i18n'

const fileCodeImg = require('@/assets/file-code.svg')
const fileFolderImg = require('@/assets/file-folder.svg')
const filePdfImg = require('@/assets/file-pdf.svg')
const fileZipImg = require('@/assets/file-zip.svg')
const fileTxtImg = require('@/assets/file-txt.svg')
const fileDocImg = require('@/assets/file-doc.svg')

export default defineComponent({
  name: 'File',

  props: {
    data: {
      type: Object as PropType<IFile>,
      default: {}
    }
  },

  setup(props) {
    const { t } = useI18n()
    const route = useRoute()
    const router = useRouter()
    const store = useStore()
    const isImage = ref(false)
    const hasError = ref(false)
    const imgLoad = ref(true)
    const fileName = props.data.name.toLowerCase()
    const fileType = props.data.type
    const filePath = props.data.path

    // 文件地址
    const fileUrl = computed(() => {
      if (fileType === 'file') {
        // 图片
        const imageSuffix = ['.png', '.jpg', '.jpeg', '.gif', 'bmp', '.svg']
        for (let v of imageSuffix) {
          if (fileName.endsWith(v)) {
            isImage.value = true
            return getCdn(CDN.Jsdelivr, filePath)
          }
        }

        switch (filePath.split('.').pop()) {
          case 'pdf':
            return filePdfImg

          case 'txt':
            return fileTxtImg

          case 'doc':
          case 'docx':
            return fileDocImg

          case 'zip':
          case 'rar':
          case 'gzip':
          case 'gz':
            return fileZipImg

          default:
            return fileCodeImg
        }
      } else {
        return fileFolderImg
      }
    })

    const handleUpdateFile = async function(e: any) {
      const files = e.target?.files
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
      fileType,
      isImage,
      isFile: fileType !== 'dir',
      hasError,
      imgLoad,
      cdn1: getCdn(CDN.Jsdelivr, filePath, false),
      cdn2: getCdn(CDN.Github, filePath, false),

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
