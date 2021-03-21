

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

export function getSuffix(file: File): string {
  return '.' + file.name.split('.').pop() as string
}