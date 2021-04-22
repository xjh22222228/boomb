import Clipboard from 'clipboard'
import { FileEncode } from '@/types'
import { IFile } from '@/store'
import { getCdn, CDN } from '@/services'
import i18n from '@/i18n'
import config from '@/config'

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
    e.trigger.classList.add('el-icon-check')

    setTimeout(() => {
      e.trigger.classList.remove('el-icon-check')
    }, 1000)
  });
}

export function logout() {
  const removeKeys = ['token', 'isLogin']

  for (let i = 0; i < removeKeys.length; i++) {
    const key = removeKeys[i]
    window.localStorage.removeItem(key)
  }

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

const fileCodeImg = require('@/assets/file-code.svg')
const fileFolderImg = require('@/assets/file-folder.svg')
const filePdfImg = require('@/assets/file-pdf.svg')
const fileZipImg = require('@/assets/file-zip.svg')
const fileTxtImg = require('@/assets/file-txt.svg')
const fileDocImg = require('@/assets/file-doc.svg')
const fileOtherImg = require('@/assets/file-other.svg')

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

export function generateBreadcrumb(path: string = ''): string[] {
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
  const { id, branch } = config
  return `https://github.com/${id}/edit/${branch}/${path}`
}
