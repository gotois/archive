import { ImageFormat, jsPDF } from 'jspdf'
import { generate } from '@pdfme/generator'
import { convert } from 'html-to-text'
import { FormatContract } from '../types/models'
import privacyNotice from '../ui/templates/privacy-notice'
import pkg from '../../package.json'

const { productName } = pkg

async function resizeImageA4(dataUrl: string) {
  const MAX_WIDTH = 794
  const MAX_HEIGHT = 1123

  const img = new Image()
  img.src = dataUrl
  await img.decode()
  let { width, height } = img

  // resizing logic portrait
  if (width > height) {
    if (width > MAX_WIDTH) {
      height *= MAX_WIDTH / width
      width = MAX_WIDTH
    }
  } else if (height > MAX_HEIGHT) {
    width *= MAX_HEIGHT / height
    height = MAX_HEIGHT
  }

  return {
    width: Number(Math.floor(width)),
    height: Number(Math.floor(height)),
  }
}

export async function createContractPDF(
  html: string,
  fileName = 'contract.pdf',
) {
  const text = convert(html, {
    wordwrap: 80,
  })
  const inputs = [{ text: text }]
  const pdf = await generate({
    template: privacyNotice,
    inputs,
  })
  return new File([pdf.buffer], fileName, {
    type: 'application/pdf',
  })
}

export async function createPDF(object: FormatContract) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'px',
    format: 'a4',
    hotfixes: ['px_scaling'],
  })
  doc.setProperties({
    title: object.instrument.name,
    subject: object.instrument.description,
    author: object.agent.name,
    creator: productName,
  })
  const files = []
  let docLength = 0

  for (const { contentUrl } of object.object) {
    const [mimeType] = contentUrl.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/)

    if (mimeType === 'application/pdf') {
      const [extension] = contentUrl.match(/[^:/]\w+(?=;|,)/)
      const res = await fetch(contentUrl)
      const blob: Blob = await res.blob()
      const fileName = object.instrument.name + '.' + extension
      const file = new File([blob], fileName, { type: mimeType })
      files.push(file)
      continue
    }

    const format = mimeType.replace('image/', '').toUpperCase() as ImageFormat
    const { width, height } = await resizeImageA4(contentUrl)

    if (docLength != 0) {
      doc.addPage(format, 'portrait')
    }
    doc.addImage({
      imageData: contentUrl,
      x: 0,
      y: 0,
      format,
      width,
      height,
    })
    docLength++
  }

  if (docLength > 0) {
    const blob = doc.output('blob')
    doc.close()
    const file = new File([blob], object.instrument.name + '.pdf', {
      type: 'application/pdf',
    })
    files.push(file)
  }

  return files
}
