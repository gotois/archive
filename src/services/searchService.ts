import { date } from 'quasar'
import MiniSearch from 'minisearch'
import useNotification from 'stores/notification'
import { db } from './databaseService'

export const miniSearch: MiniSearch = new MiniSearch({
  fields: ['name', 'description'],
  storeFields: ['name', 'instrument_description'],
})

export async function indexAllDocuments() {
  if (miniSearch.documentCount === 0) {
    const documents = await db.getFulltextDocument()
    const notificationStore = useNotification()
    const now = new Date()
    documents.forEach((doc) => {
      const diff = date.getDateDiff(doc.endTime, now, 'days')
      if (diff === 1) {
        notificationStore.add({
          title: 'Tomorrow end: ' + doc.name,
        })
      }
    })
    await miniSearch.addAllAsync(documents)
  }
}
