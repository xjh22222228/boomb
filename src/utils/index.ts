import Clipboard from 'clipboard'
import { FileEncode } from '@/types'

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
