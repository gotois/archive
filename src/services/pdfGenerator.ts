import { generate } from '@pdfme/generator'
import { text, image } from '@pdfme/schemas'
import { convert } from 'html-to-text'
import privacyNotice from '../ui/templates/privacy-notice'
import { PDF_MIME_TYPE } from '../helpers/mimeTypes'

const FILE_EXT = '.pdf'

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
