import pkg from '../../package.json'
import { parse } from '../helpers/markdownHelper'
import { createContractPDF } from '../helpers/pdfHelper'
import { readFilesPromise } from '../helpers/fileHelper'
import { MyContract } from '../types/models'

// eslint-disable-next-line
export async function privacyContract($t: any) {
  const response = await fetch('docs/privacy.md')
  const md = await response.text()
  const html = parse(md)
  const pdfFile = await createContractPDF(html)
  const contractPDF = await readFilesPromise([pdfFile])
  const newContract = {
    agent_legal: true,
    participant_name: pkg.author.name,
    participant_email: pkg.author.email,
    participant_url: pkg.author.url,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment
    instrument_name: $t('pages.privacy.title'),
    instrument_description: `${pkg.productName}: ${pkg.description} v${pkg.version}`,
    startTime: new Date(),
    images: contractPDF,
  }
  return newContract as MyContract
}
