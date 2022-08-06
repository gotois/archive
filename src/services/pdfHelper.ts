import {jsPDF} from 'jspdf'
import {FormatContract} from 'components/models'
import {resizeImageA4} from './imgHelper'

export async function createPDF(object: FormatContract) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'px',
    format: 'a4',
    hotfixes: ['px_scaling']
  })
  doc.setProperties({
    title: object.instrument.name,
    subject: object.instrument.description,
    author: object.agent.name,
    creator: object.participant.name,
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
    files
  }
}
