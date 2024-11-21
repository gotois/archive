import { uid } from 'quasar'
import { getFileExt } from './dataHelper'
import { PNG_MIME_TYPE } from './mimeTypes'

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

export const canShare = typeof navigator.share === 'function'

export async function fileShare(file: File, title?: string) {
  const shareData = {
    title: title ?? file.name,
    files: [file],
  }
  if (!navigator.canShare(shareData)) {
    throw new Error('Specified data cannot be shared.')
  }
  try {
    return await navigator.share(shareData)
  } catch (error) {
    if (error.name !== 'AbortError') {
      throw error
    }
  }
}

export async function getFileFromUrl(image: { contentUrl: string }) {
  const base64Response = await fetch(image.contentUrl)
  const blob = await base64Response.blob()
  const ext = getFileExt(blob.type)

  return new File([blob], `file_${uid()}.${ext}`, {
    type: blob.type,
  })
}

export async function convertBlobToPng(blob: Blob) {
  const imageBitmap = await createImageBitmap(blob)
  const canvas = document.createElement('canvas')
  canvas.width = imageBitmap.width
  canvas.height = imageBitmap.height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(imageBitmap, 0, 0)
  return new Promise<Blob>((resolve) => canvas.toBlob(resolve, PNG_MIME_TYPE))
}
