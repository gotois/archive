import {jsPDF} from 'jspdf'
import {FormatContract} from 'components/models'
import {resizeImageA4} from './imgHelper'
import {productName} from '../../package.json'

export async function createContract(html: string) {
  const htmlObject = document.createElement('html');
  htmlObject.innerHTML = `
  <html lang="ru">
	<body>${html}</body>
  </html>
  `

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'px',
    format: 'a4',
    hotfixes: ['px_scaling', 'scale_text'],
  })
  doc.setFont('Helvetica');
  doc.setFontSize(10);
  await doc.html(htmlObject, {
    filename: 'contract.pdf',
    autoPaging: false,
    html2canvas: {
      width: 800,
      height: 800,
    },
    width: 800,
    windowWidth: 800,
    x: 10,
    y: 10,
  });

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

    const format = mimeType.replace('image/', '').toUpperCase()
    const [width, height] = await resizeImageA4(dataUrl)

    if (docLength != 0) {
      doc.addPage()
    }
    doc.addImage(dataUrl, format, 0, 0, width, height)
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
