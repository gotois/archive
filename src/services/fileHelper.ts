export function readFilesPromise(files: Array<File>) {
  const promises = []
  for (const file of files) {
    const promise = new Promise(((resolve, reject) => {
      const reader = new FileReader()
      reader.onerror = function (error) {
        reject(error)
      }
      reader.onloadend = function () {
        resolve(reader.result)
      }
      reader.readAsDataURL(file)
    }))
    promises.push(promise)
  }
  return Promise.all(promises)
}
