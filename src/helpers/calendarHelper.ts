import { event as createEvent, default as icalendar } from 'ical-browser'
import { createPDF } from './pdfHelper'
import { readFilesPromise } from './fileHelper'
import { FormatContract } from '../types/models'

export default async (id: string, object: FormatContract) => {
  const files = await createPDF(object)
  const attach: string[] = []
  for (const base64 of await readFilesPromise(files)) {
    attach.push(base64)
  }
  if (!object.sameAs) {
    console.warn('object sameAs is empty')
  }
  const uid = object.identifier.find((i) => i.name === 'Contract').value
  const organizer = []
  if (object.agent.name && object.agent.email) {
    organizer.push({
      name: object.agent.name,
      email: object.agent.email,
    })
  }
  const attendee = []
  if (object.participant.name && object.participant.email) {
    attendee.push({
      name: object.participant.name,
      email: object.participant.email,
    })
  }
  const event = createEvent({
    uid: uid as string,
    url: object.sameAs ? new URL(object.sameAs) : null,
    summary: object.instrument.name,
    description: object.instrument.description,
    stamp: new Date(),
    start: object.startTime,
    end: object.endTime,
    attach: attach,
    organizer: organizer,
    attendee: attendee,
  })

  return icalendar(id, object.instrument.name, event)
}
