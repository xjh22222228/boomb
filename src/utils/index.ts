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
  const keys = []
  const len = window.localStorage.length

  for (let i = 0; i < len; i++) {
    const key = window.localStorage.key(i)

    if (key) {
      if (removeKeys.includes(key)) {
        keys.push(key)
      }
    }
  }

  for (let k of keys) {
    window.localStorage.removeItem(k)
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
