import { is, date, LocalStorage, SessionStorage } from 'quasar'
import { defineStore } from 'pinia'
// import usePodStore from 'stores/pod'
import { db } from '../services/databaseService'
import type {
  ContractData,
  ContractTable,
  FormatContract,
  VerifiableCredential,
  CalendarEventExternal,
} from '../types/models'

interface Store {
  contractNames: Map<string, ContractData>
  contracts: ContractTable[]
  contractsCount: number
  events: CalendarEventExternal[]
}

let contractNames: Map<string, ContractData> = null
if (LocalStorage.has('contractNames')) {
  contractNames = new Map<string, ContractData>(
    LocalStorage.getItem('contractNames'),
  )
} else {
  contractNames = await db.getContractNames()
  LocalStorage.set(
    'contractNames',
    Array.from(contractNames).filter((key) => !!key),
  )
}

export default defineStore('contracts', {
  state: (): Store => ({
    contracts: [],
    contractNames: contractNames,
    contractsCount: SessionStorage.getItem('contractsCount') ?? 0,
    events: [],
  }),
  actions: {
    setContractsCount(count: number) {
      this.contractsCount = count
      SessionStorage.set('contractsCount', count)
    },
    addContractName(name: string) {
      if (!name) {
        throw new Error('Empty name')
      }
      const count = this.contractNames.get(name)?.count ?? 0
      this.contractNames.set(name, { count: count + 1, recommendation: false })
      LocalStorage.set('contractNames', this.getArchiveNames)
    },
    removeContractName(name: string) {
      this.contractNames.delete(name)
      LocalStorage.set('contractNames', this.getArchiveNames)
    },
    // This contract already in IndexedDB
    async existContract(contract: unknown) {
      alert('WIP existContract')
      const dbContract = await db.contracts.get({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        id: contract?.id,
      })
      return is.deepEqual(contract, dbContract)
    },
    // Save to IndexedDb
    async insertContract(contract: ContractTable) {
      const index = await db.add(contract)
      if (index === 0) {
        return Promise.reject('Cannot add this item')
      }
      this.addContractName(contract.name)
      // после первичной записи обновляем идентификатор Dexie
      // contract.identifier.push({
      //   name: 'Dexie',
      //   propertyID: db.verno, // используемая версия движка
      //   value: index,
      // })
      // обновляем запись в БД
      // await db.contracts.where('id').equals(index).modify({
      //   identifier: contract.identifier,
      // })
      return { contract, index }
    },
    async addContract(verifiedCredential: VerifiableCredential) {
      const context = verifiedCredential['@context'].map((c) => {
        if (typeof c === 'string') {
          return c
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return JSON.parse(JSON.stringify(c))
      })
      // todo verifiedCredential.credentialSubject.object может быть массивом
      const participant = []
      if (verifiedCredential.credentialSubject.target) {
        participant.push({
          type: verifiedCredential.credentialSubject.target.type,
          name: verifiedCredential.credentialSubject.target.name,
          email: verifiedCredential.credentialSubject.target.email,
          telephone: verifiedCredential.credentialSubject.target.telephone,
          url: verifiedCredential.credentialSubject.target.url,
        })
      }
      const startTime = verifiedCredential.credentialSubject.startTime
        ? new Date(verifiedCredential.credentialSubject.startTime)
        : null
      const endTime = verifiedCredential.credentialSubject.endTime
        ? new Date(verifiedCredential.credentialSubject.endTime)
        : null
      const { contract } = await this.insertContract({
        context: context,
        resolver: verifiedCredential.id,
        organizer: {
          type: verifiedCredential.credentialSubject.actor.type,
          email: verifiedCredential.credentialSubject.actor.email,
          name: verifiedCredential.credentialSubject.actor.name,
          url: verifiedCredential.credentialSubject.actor.url,
        },
        // todo поддержать GEO Location
        // location: verifiedCredential.credentialSubject.location.map(
        //   (place) => ({
        //     name: place.name,
        //     geo: {
        //       latitude: place.geo.latitude,
        //       longitude: place.geo.longitude,
        //   }),
        // ),
        name: verifiedCredential.credentialSubject.object.name,
        description: verifiedCredential.credentialSubject.object.summary,
        issuanceDate: new Date(verifiedCredential.issuanceDate),
        issuer: verifiedCredential.issuer,
        participant: participant,
        startTime: startTime,
        endTime: endTime,
        type: Array.from(verifiedCredential.type),
        proof: {
          ...verifiedCredential.proof,
        },
        tag: Array.from(verifiedCredential.credentialSubject.object?.tag ?? []),
        attachment:
          verifiedCredential.credentialSubject.object.attachment?.map(
            (attach) => {
              if (typeof attach === 'object') {
                return {
                  type: attach.type,
                  name: attach.name,
                  mediaType: attach.mediaType,
                  url: attach.url,
                }
              } else if (typeof attach === 'string') {
                return {
                  url: attach,
                }
              }
            },
          ) ?? [],
      })
      const count = await db.contracts.count()
      this.setContractsCount(count)
      this.contracts.push(contract)
    },
    /*async*/ editContract(contract: FormatContract) {
      console.log('WIP editContract', contract)
      /* fixme поддержать работу по редактированию контракта
      const id = contract.identifier.find(({ name }) => name === 'Dexie')
        .value as number
      const count = await db.contracts.where('id').equals(id).modify({
        instrument_description: contract.instrument.description,
      })
      if (count === 0) {
        return Promise.reject('Cannot edit this item')
      }
      const i = this.contracts.map((item) => item.id).indexOf(id)
      this.contracts[i].instrument_description = contract.instrument.description
       */
      return Promise.reject('Not implemented')
    },
    async removeContract(id: number, usePod = false) {
      // Step 1: JS
      if (!id) {
        throw new Error('Unknown Dexie ID')
      }
      const i = this.contracts.map((item) => item.id).indexOf(id)
      this.contracts.splice(i, 1)
      // this.removeContractName(contract.instrument.name) // todo поддержать удаление по имени из БД полнотекстового поиска

      // Step 2: IndexedDB
      const removedCount = await db.remove(id)
      if (removedCount === 0) {
        return Promise.reject('Cannot remove this item')
      }
      const count = await db.contracts.count()
      this.setContractsCount(count)
      if (!usePod) {
        return
      }
      // Step 3: Solid Pod
      // todo поддержать удаление из Solid Pod
      // if (!contract.sameAs) {
      //   return Promise.reject('Not exist sameAs')
      // }
      // return usePodStore().removeFromPod(contract.sameAs)
      return Promise.reject('Not implemented')
    },
    async filterFromContracts(query: string) {
      if (!query) {
        return
      }
      this.contracts = await db.contracts
        .where('name')
        .equals(query)
        .reverse()
        .sortBy('startTime')
    },
    async filteredByIds(ids: number[]) {
      return await db.contracts.bulkGet(ids)
    },
    async loadCalendar(startDate: Date, endDate?: Date) {
      /* todo - восстановить RPC
      const result = await rpc('get-calendar', {
        '@context': 'https://www.w3.org/ns/activitystreams',
        'type': 'Offer',
        'object': {
          type: 'Activity',
          startTime: startDate,
          endTime: endDate,
        },
      })
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
      const calendar = result.data as string[]
      // this.events = calendar.map((icalEvent) => convertIcalToEvent(icalEvent))
      */
      this.events = await this.getCalendarContracts({
        from: startDate,
        to: endDate,
      })
    },
    async getCalendarContracts({ from, to }: { from: Date; to: Date }) {
      const contracts = await db.contracts
        .filter((c) => {
          if (date.isBetweenDates(c.startTime, from, to)) {
            return true
          }
          if (date.isBetweenDates(c.endTime, from, to)) {
            return true
          }
          if (c.startTime <= from) {
            return c.endTime > to
          }
          return false
        })
        .toArray()
      return contracts.map((contract) => {
        return {
          id: contract.id,
          start: date.formatDate(contract.startTime, 'YYYY-MM-DD HH:mm'),
          end: date.formatDate(contract.endTime, 'YYYY-MM-DD HH:mm'),
          title: contract.name,
          calendarId: 'secretary',
          description: contract.description,
          attaches: contract.attachment,
          tag: contract.tag,
          organizer: contract.organizer,
          participant: contract.participant,
          location: contract.location,
          link: contract.link,
        }
      }) as CalendarEventExternal[]
    },
    async loadAllContracts({
      offset = 0,
      limit = 10,
    }: {
      offset: number
      limit: number
    }) {
      const count = await db.contracts.count()
      this.setContractsCount(count)
      if (!count) {
        this.contracts = []
        return
      }
      this.contracts = await db.contracts
        .orderBy('startTime')
        .reverse()
        .offset(offset)
        .limit(limit)
        .toArray()
    },
  },
  getters: {
    /* fixme поддержать
    formatContracts(state): FormatContract[] {
      function getEmailProperty(email: string) {
        return email.startsWith('mailto:') ? email : 'mailto:' + email
      }
      return state.contracts.map((contract: ContractTable) => {
        // const agent: FormatContractAgent = {
        //   '@type': 'Person',
        //   'name': contract.agent_name,
        // }
        // if (contract.agent_email) {
        //   agent.email = getEmailProperty(contract.agent_email)
        // }
        // const participant: FormatContractParticipant = {
        //   // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
        //   '@type': contract.context ? contract?.context[1]?.participant : 'Person',
        //   'sameAs': contract.participant_name,
        //   'url': contract.participant_url,
        //   'telephone': contract.participant_tel,
        // }
        // if (contract.participant_email) {
        //   participant.email = getEmailProperty(contract.participant_email)
        // }
        // const instrument = {
        //   '@type': 'Thing',
        //   'name': contract.instrument_name,
        //   'description': contract.instrument_description,
        // }
        // const identifier = contract.identifier
        // const object = contract?.images?.map(({ encodingFormat, contentUrl }) => ({
        //   '@type': 'ImageObject',
        //   'encodingFormat': encodingFormat,
        //   'contentUrl': contentUrl,
        // }))
        return {
          '@context': 'https://www.w3.org/ns/activitystreams',
          // '@type': contract.type ? contract.type[1] : 'OrganizeAction',
          // 'sameAs': contract.resource_url,
          // 'agent': agent,
          // 'participant': participant,
          // 'instrument': instrument,
          // 'location': contract.location
          //   ? (JSON.parse(contract.location) as FormatPlace)
          //   : null,
          // 'startTime': new Date(contract.startTime),
          // 'endTime': contract.endTime ? new Date(contract.endTime) : null,
          // 'object': object ?? [],
          // 'proof': contract.proof ? contract.proof : null,
          'url': 'https://google.com/contract', // todo поддержать url
        } // as FormatContract
      })
    },
     */
    getArchiveKeys(state) {
      return Array.from(state.contractNames.keys()).sort((a, b) => {
        if (a.toLowerCase() < b.toLowerCase()) {
          return -1
        } else if (a.toLowerCase() === b.toLowerCase()) {
          return 0
        } else {
          return 1
        }
      })
    },
    getArchiveNames(state) {
      return Array.from(state.contractNames)
    },
    getContractsCount(state) {
      return state.contractsCount
    },
  },
})
