import MiniSearch from 'minisearch'
import { db } from './databaseService'

export const miniSearch: MiniSearch = new MiniSearch({
  fields: ['instrument_name', 'instrument_description'],
  storeFields: ['instrument_name', 'instrument_description'],
})

export async function indexAllDocuments() {
  if (miniSearch.documentCount === 0) {
    const documents = await db.getFulltextDocument()
    await miniSearch.addAllAsync(documents)
  }
}
