export function readFilesPromise(files: File[]|Blob[]) {
  const promises = []
  for (const file of files) {
    const promise = new Promise(((resolve, reject) => {
      const reader = new FileReader()
      reader.onerror = (error) => {
        reject(error)
      }
      reader.onloadend = () => {
        resolve(reader.result)
      }
      reader.readAsDataURL(file)
    }))
    promises.push(promise)
  }
  return Promise.all(promises) as Promise<string[]>
}
