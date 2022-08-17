import {ImageFormat, jsPDF} from 'jspdf'
import html2canvas from 'html2canvas'
import {FormatContract} from 'components/models'
import {resizeImageA4} from './imgHelper'
import {productName} from '../../package.json'

// todo пока не возможно использовать кириллицу для генерации через `doc.html` поэтому конвертирую в изображение
export async function createContract(html: string) {
  const width = 1754
  const htmlObject = document.createElement('div')
  htmlObject.id = 'capture'
  htmlObject.style.width = String(width / 2) + 'px'
  htmlObject.innerHTML = html
  htmlObject.style.hyphens = 'auto'

  document.body.appendChild(htmlObject)

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'px',
    format: 'a4',
    hotfixes: ['px_scaling'],
  })
  doc.setLanguage('ru')
  doc.setFont('Times', 'Roman')
  doc.setFontSize(10)

  // todo hack options
  const canvas = await html2canvas(document.querySelector('#capture'), {
    width: width,
    x: -10,
    y: 0,
    scale: 0.9,
  })
  document.body.removeChild(htmlObject)

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  doc.addImage({
    imageData: canvas.toDataURL('image/png'),
    x: 0,
    y: 0,
    format: 'PNG',
    compression: 'SLOW',
  })

  const pdfURI = doc.output('datauristring')
  doc.close()

  return pdfURI
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
    const [width, height] = await resizeImageA4(dataUrl)

    if (docLength != 0) {
      doc.addPage()
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
