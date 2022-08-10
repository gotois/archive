export function readFilesPromise(files: File[]) {
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
  return Promise.all(promises)
}
