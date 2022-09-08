import {ImageFormat, jsPDF} from 'jspdf'
import {generate} from '@pdfme/generator'
import html2canvas from 'html2canvas'
import {convert} from 'html-to-text'
import {FormatContract} from '../types/models'
import {resizeImageA4} from './imgHelper'
import pkg from '../../package.json'
import {readFilesPromise} from '../services/fileHelper'
import privacyNotice from '../ui/templates/privacy-notice'

export async function createContract(html: string, useImage = false) {
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
  return await readFilesPromise([blob])
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
    creator: pkg.productName,
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
    const {width, height} = await resizeImageA4(dataUrl)

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
