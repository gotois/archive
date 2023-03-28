import JSZip from 'jszip'

const FILE_NAME = 'contract-export.json'

export async function getContent(value: File): Promise<Blob> {
  switch (value.type) {
    case 'application/zip': {
      const zip = new JSZip()
      const all = await zip.loadAsync(value, {})
      const file = all.file(FILE_NAME)
      if (!file) {
        throw new Error('File not found')
      }
      return file.async('blob')
    }
    default: {
      return value
    }
  }
}

export async function generate(
  blob: Blob,
  // eslint-disable-next-line no-unused-vars
  onUpdate: (metadata: JSZip.JSZipMetadata) => void,
) {
  const zip = new JSZip()
  zip.file(FILE_NAME, blob)
  return zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 1,
      },
      platform: 'UNIX',
    },
    onUpdate,
  )
}
