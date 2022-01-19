import Clipboard from 'clipboard'
import i18n from '@/i18n'
import { FileEncode } from '@/types'
import type { IFile } from '@/store'
import { getCdn, CDN } from '@/services'
import { ElMessage } from 'element-plus'
import { getLocalId, getLocalBranch } from '@/utils/storage'

let clipboard: Clipboard|null

export async function getBase64(file: File): Promise<string> {
  const fr = new FileReader()
  fr.readAsDataURL(file)

  return new Promise(resolve => {
    fr.onload = function() {
      const url = (fr.result as string).split(',')[1]
      resolve(url)
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
  window.localStorage.clear()
  window.sessionStorage.clear()
  window.location.reload()
}

export function getFileEncode(): FileEncode {
  const l = window.localStorage.getItem('fileEncode')

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

import fileCodeImg from '@/assets/file-code.svg'
import filePdfImg from '@/assets/file-pdf.svg'
import fileFolderImg from '@/assets/file-folder.svg'
import fileZipImg from '@/assets/file-zip.svg'
import fileTxtImg from '@/assets/file-txt.svg'
import fileDocImg from '@/assets/file-doc.svg'
import fileOtherImg from '@/assets/file-other.svg'

export function getFileUrl(file: IFile): string {
  const { type, name, path } = file

  if (type === 'file') {
    if (isImage(name)) {
      return getCdn(CDN.Jsdelivr, path)
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
  return `https://github.com/${getLocalId()}/edit/${getLocalBranch()}/${path}`
}
