import { uid } from 'quasar'
import { event as createEvent, default as icalendar } from 'ical-browser'
import { createPDF } from '../helpers/pdfHelper'
import { readFilesPromise } from '../helpers/fileHelper'
import { FormatContract } from '../types/models'
import pkg from '../../package.json'

const { author, productName } = pkg

export default async (object: FormatContract) => {
  const files = await createPDF(object)
  const attach = []
  for (const base64 of await readFilesPromise(files)) {
    attach.push(base64)
  }
  if (!object.sameAs) {
    console.warn('object sameAs is empty')
  }
  const event = createEvent({
    uid: uid(), // todo нужен идентификатор транзакции на блокчейн
    url: object.sameAs ? new URL(object.sameAs) : null,
    summary: object.instrument.name,
    description: object.instrument.description,
    stamp: new Date(),
    start: object.startTime,
    end: object.endTime,
    attach: attach,
    organizer: [
      {
        name: object.agent.name,
        email: object.agent.email,
      },
    ],
    attendee: [
      {
        name: object.participant.name,
        email: object.participant.email,
      },
    ],
  })
  return icalendar(
    '-//' + author.name + '//NONSGML ' + productName + '//EN',
    object.instrument.name,
    event,
  )
}
