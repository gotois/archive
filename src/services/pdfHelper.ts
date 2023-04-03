import { ImageFormat, jsPDF } from 'jspdf'
import { generate } from '@pdfme/generator'
import html2canvas from 'html2canvas'
import { convert } from 'html-to-text'
import { FormatContract } from '../types/models'
import pkg from '../../package.json'
import { readFilesPromise } from '../services/fileHelper'
import privacyNotice from '../ui/templates/privacy-notice'

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

export async function createContractPDF(html: string, useImage = false) {
  const htmlObject = document.createElement('div')
  htmlObject.id = 'capture'
  htmlObject.style.width = String(1752 / 2) + 'px'
  htmlObject.innerHTML = html
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  htmlObject.style.webkitHyphens = 'auto'
  htmlObject.style.hyphens = 'auto'

  let inputs
  // генерируем изображение вместо текста
  if (useImage) {
    document.body.appendChild(htmlObject)
    const canvas = await html2canvas(htmlObject, {
      x: 0,
      y: 0,
      scale: 1,
    })
    inputs = [{ image: canvas.toDataURL('image/png') }]
    document.body.removeChild(htmlObject)
  } else {
    const text = convert(html, {
      wordwrap: 130,
    })
    inputs = [{ text: text }]
  }

  const pdf = await generate({
    template: privacyNotice,
    inputs,
  })
  const blob = new Blob([pdf.buffer], { type: 'application/pdf' })

  return readFilesPromise([blob])
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

  for (const image of object.object) {
    const dataUrl = image.contentUrl
    const [mimeType] = dataUrl.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/)

    if (mimeType === 'application/pdf') {
      const [extension] = dataUrl.match(/[^:/]\w+(?=;|,)/)
      const res = await fetch(image.contentUrl)
      const blob: Blob = await res.blob()
      const fileName = object.instrument.name + '.' + extension
      const file = new File([blob], fileName, { type: mimeType })
      files.push(file)
      continue
    }

    const format = mimeType.replace('image/', '').toUpperCase() as ImageFormat
    const { width, height } = await resizeImageA4(dataUrl)

    if (docLength != 0) {
      doc.addPage(format, 'portrait')
    }
    doc.addImage({
      imageData: dataUrl,
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
    const file = new File([blob], object.instrument.name + '.pdf')
    files.push(file)
  }

  return {
    title: object.instrument.name,
    files,
  }
}
