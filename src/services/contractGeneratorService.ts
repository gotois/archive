import { parse } from '../helpers/markdownHelper'
import { createContractPDF, createPDF } from '../helpers/pdfHelper'
import { OwnerContract } from '../types/models'

export async function mintContract(contract: OwnerContract) {
  const response = await fetch(contract.url)
  const contentType = response.headers.get('content-type')

  const output = {
    agentLegal: Number(true),
    agentName: contract.agent.name,
    agentEmail: contract.agent.email,
    participantName: contract.participant.name,
    participantEmail: contract.participant.email,
    participantUrl: contract.participant.url,
    instrumentName: contract.instrument.name,
    instrumentDescription: contract.instrument.description,
    images: [],
    startTime: new Date().toJSON(),
    // todo: add endTime
  }

  if (contentType.startsWith('text/markdown')) {
    const md = await response.text()
    const html = parse(md)
    const pdfFile = await createContractPDF(html)
    const url = URL.createObjectURL(pdfFile)
    output.images.push(url)
    return output
  } else if (contentType.startsWith('image')) {
    /* eslint-disable */
    const [pdfFile] = await createPDF({
      startTime: new Date(),
      agent: contract.agent,
      instrument: contract.instrument,
      object: [
        {
          contentUrl: contract.url,
          encodingFormat: contentType,
        },
      ],
    })
    /* eslint-enable */
    const url = URL.createObjectURL(pdfFile)
    output.images.push(url)
    return output
  }
  throw new Error('Cannot mint unknown format: ' + contentType)
}
