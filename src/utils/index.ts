import Clipboard from 'clipboard'

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
