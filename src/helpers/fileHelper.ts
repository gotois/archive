export function readFilePromise(file: File | Blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = (error) => {
      reject(error)
    }
    reader.onloadend = () => {
      resolve(reader.result)
    }
    reader.readAsDataURL(file)
  })
}
export function readFilesPromise(files: File[] | Blob[]) {
  const promises = []
  for (const file of files) {
    const promise = readFilePromise(file)
    promises.push(promise)
  }
  return Promise.all(promises) as Promise<string[]>
}

export async function fileShare(file: File, title?: string) {
  try {
    return await navigator.share({
      title: title ?? file.name,
      files: [file],
    })
  } catch (error) {
    if (error.name !== 'AbortError') {
      throw error
    }
  }
}
