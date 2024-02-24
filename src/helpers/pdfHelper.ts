import { ImageFormat, jsPDF } from 'jspdf'
import { generate } from '@pdfme/generator'
import { text, image } from '@pdfme/schemas'
import { convert } from 'html-to-text'
import { FormatContract } from '../types/models'
import privacyNotice from '../ui/templates/privacy-notice'
import { PDF_MIME_TYPE } from './mimeTypes'
import pkg from '../../package.json'

const { productName } = pkg
const FILE_EXT = '.pdf'

async function decodeImg(dataUrl: string) {
  const img = new Image()
  img.src = dataUrl
  try {
    await img.decode()
  } catch (error) {
    console.error('Cannot decode the image')
    throw error
  }
  return img
}

function resizeImageA4(img: HTMLImageElement) {
  const MAX_WIDTH = 794
  const MAX_HEIGHT = 1123

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
  fileName = 'contract' + FILE_EXT,
) {
  const htmlText = convert(html, {
    wordwrap: 80,
  })
  const inputs = [{ text: htmlText }]
  const pdf = await generate({
    template: privacyNotice,
    inputs,
    plugins: { text, image },
  })
  return new File([pdf.buffer], fileName, {
    type: PDF_MIME_TYPE,
  })
}

export async function createPDF(object: FormatContract) {
  const title = object.instrument.name
  const description = object.instrument.description
  const author = object.agent.name
  const formatImages = object.object
  const orientation = 'portrait'

  const doc = new jsPDF({
    orientation: orientation,
    unit: 'px',
    format: 'a4',
    hotfixes: ['px_scaling'],
  })
  doc.setProperties({
    title: title,
    subject: description,
    author: author,
    creator: productName,
  })
  const files: File[] = []
  let docLength = 0

  for (const { contentUrl, encodingFormat } of formatImages) {
    if (encodingFormat === PDF_MIME_TYPE) {
      const res = await fetch(contentUrl)
      const blob: Blob = await res.blob()
      const fileName = title + FILE_EXT
      const file = new File([blob], fileName, { type: encodingFormat })
      files.push(file)
      continue
    }

    const format = encodingFormat
      .replace('image/', '')
      .toUpperCase() as ImageFormat
    const img = await decodeImg(contentUrl)
    const { width, height } = resizeImageA4(img)

    if (docLength != 0) {
      doc.addPage(format, orientation)
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
    const file = new File([blob], title + FILE_EXT, {
      type: PDF_MIME_TYPE,
    })
    files.push(file)
  }

  return files
}
