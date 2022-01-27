// Copyright 2021-2022 the xiejiahe. All rights reserved. MIT license.
import Clipboard from 'clipboard'
import i18n from '@/i18n'
import { FileEncode, NetworkCDN } from '@/types'
import type { IFile } from '@/store'
import { getCdn } from '@/services'
import { ElMessage } from 'element-plus'
import {
  getLocalId,
  getLocalBranch,
  getLocalRepo,
  isGiteeProvider
} from '@/utils/storage'

// images
import fileCodeImg from '@/assets/file-code.svg'
import filePdfImg from '@/assets/file-pdf.svg'
import fileFolderImg from '@/assets/file-folder.svg'
import fileZipImg from '@/assets/file-zip.svg'
import fileTxtImg from '@/assets/file-txt.svg'
import fileDocImg from '@/assets/file-doc.svg'
import fileOtherImg from '@/assets/file-other.svg'

const isGitee = isGiteeProvider()
let clipboard: Clipboard|null

export async function getBase64(file: File): Promise<{
  url: string,
  rawUrl: string
}> {
  const fr = new FileReader()
  fr.readAsDataURL(file)

  return new Promise(resolve => {
    fr.onload = function() {
      const result = fr.result as string
      const url = result.split(',')[1]
      resolve({
        url,
        rawUrl: result
      })
    }
  })
}

export function getExtname(file: File): string {
  const s = file.name.split('.').pop() as string

  return s ? `.${s}` : s
}

export function initClipboard() {
  if (clipboard) {
    clipboard.destroy()
    clipboard = null
  }

  clipboard = new Clipboard(document.querySelectorAll('.copy'))

  clipboard.on('success', function(e) {
    ElMessage({
      type: 'success',
      message: i18n.global.t('copyed') + '!'
    })
  });
}

export function logout() {
  localStorage.clear()
  sessionStorage.clear()
  location.reload()
}

export function getFileEncode(): FileEncode {
  const l = localStorage.getItem('fileEncode')

  if (l) {
    return Number(l) as FileEncode
  }

  return FileEncode.RawName
}

export function getCharCode(str: string): number {
  let n = 0
  if (!str) {
    return n
  }

  // 1.jpg => 1
  if (!str.startsWith('.')) {
    str = str.split('.')[0] || ''
  }

  for (let i = 0; i < str.length; i++) {
    n += str.charCodeAt(i)
  }

  return n
}

export function isMobile() {
  return 'ontouchstart' in window
}

export function isImage(fileName: string): boolean {
  const imageSuffix = ['.png', '.jpg', '.jpeg', '.gif', 'bmp', '.svg']

  for (let v of imageSuffix) {
    if (fileName.endsWith(v)) {
      return true
    }
  }

  return false
}

export function getFileUrl(file: IFile): string {
  const { type, name, path, size } = file

  // Jsdelivr: File size exceeded the configured limit of 20 MB.
  const MAX_FILE_SIZE = 20 * 1024 * 1024

  if (type === 'file') {
    if (isImage(name)) {
      if (isGitee) {
        return getCdn(NetworkCDN.Gitee, path)
      }

      if (typeof size === 'number' && size >= MAX_FILE_SIZE) {
        return getCdn(NetworkCDN.Github, path)
      }
      return getCdn(NetworkCDN.Jsdelivr, path)
    }

    if (!path.includes('.')) {
      return fileOtherImg
    }

    switch (path.split('.').pop()) {
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
}

export function generateBreadcrumb(path: string = ''): {
  name: string
  path: string
}[] {
  path = path === '/' ? '' : path
  let pathsList = path.split('/') as any[]

  let fullPath = '';
  for (let i = 0; i < pathsList.length; i++) {
    const path = pathsList[i]
    fullPath += '/' + path

    pathsList[i] = {
      name: !path ? i18n.global.t('all') : path,
      path: fullPath.startsWith('//')
        ? fullPath.slice(1)
        : fullPath === '/'
          ? ''
          : fullPath
    };
  }

  return pathsList
}

export function getEditFileUrl(path: string): string {
  path = path[0] === '/' ? path.slice(1) : path
  const base = isGitee ? 'https://gitee.com/' : 'https://github.com/'
  return `${base}${getLocalId()}/${getLocalRepo()}/edit/${getLocalBranch()}/${path}`
}
