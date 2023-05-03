import { LocalStorage } from 'quasar'
import { defineStore } from 'pinia'
import { fetch } from '@inrupt/solid-client-authn-browser/src/defaultSession'
import {
  buildThing,
  createSolidDataset,
  deleteSolidDataset,
  getSolidDataset,
  getStringNoLocale,
  getThing,
  getPodUrlAll,
  getThingAll,
  saveSolidDatasetAt,
  setThing,
} from '@inrupt/solid-client'
import { FOAF, SCHEMA_INRUPT } from '@inrupt/vocab-common-rdf'
import useAuthStore from 'stores/auth'
import { sign } from '../services/cryptoHelper'
import {
  formatterContract,
  formatterLDContract,
  formatterDatasetContract,
} from '../services/schemaHelper'
import { db } from '../services/databaseHelper'
import { ContractTable, FormatContract } from '../types/models'
import pkg from '../../package.json'

const { name } = pkg

interface State {
  resourceRootUrl: string
}

export default defineStore('pod', {
  state: (): State => ({
    resourceRootUrl: '',
  }),
  actions: {
    async initPod() {
      const resourceBaseUrl = this.getResourceBaseUrl
      if (!resourceBaseUrl) {
        throw new Error('initPod cannot use empty resourceRootUrl')
      }
      // hack - у inrupt.net и других провайдеров, при первичной инициализации падает getSolidDataset
      if (!resourceBaseUrl.includes('inrupt.com')) {
        const dataset = createSolidDataset()
        return saveSolidDatasetAt(resourceBaseUrl, dataset, {
          fetch,
        })
      }
      const myBaseDataset = await getSolidDataset(resourceBaseUrl, {
        fetch,
      })
      const hasAnyContracts = getThingAll(myBaseDataset).some(({ url }) =>
        url.includes(name),
      )
      if (!hasAnyContracts) {
        return saveSolidDatasetAt(resourceBaseUrl, myBaseDataset, {
          fetch,
        })
      }
    },
    removeFromPod(url: string) {
      const separator = '.'
      const oidcIssuer: string = this.getOidcIssuer
      // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars
      const [_x, ...hostIssuerHost] = new URL(oidcIssuer).host.split(separator)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars
      const [_y, ...hostUrlHost] = new URL(url).host.split(separator)

      if (hostIssuerHost.join() !== hostUrlHost.join()) {
        throw new Error('oidcIssuer not equals to current url')
      }

      return deleteSolidDataset(url, {
        fetch,
      })
    },
    async removeContractsDataset() {
      const resourceBaseUrl = this.getResourceBaseUrl
      const myDataset = await getSolidDataset(resourceBaseUrl, {
        fetch,
      })

      const allThing = getThingAll(myDataset)
        .filter((thing) => {
          return thing.url !== myDataset.internal_resourceInfo.sourceIri
        })
        .map((thing) => {
          return this.removeFromPod(thing.url)
        })

      return Promise.all(allThing)
    },
    async setResourceRootUrl() {
      const authStore = useAuthStore()
      if (!authStore.webId) {
        throw new Error('WebId is empty')
      }
      const podsUrl = await getPodUrlAll(authStore.webId, {
        fetch,
      })
      if (podsUrl.length === 0) {
        throw new Error('Pods is empty')
      }
      const selectedPod = 0
      // todo здесь пользователь должен бы самостоятельно выбирать какой Pod будет использовать
      // if (podsUrl.length > 1) {
      // ...
      // selectedPod = 1 || 2 || ...
      // }
      this.resourceRootUrl = podsUrl[selectedPod]
    },
    async getProfileName() {
      if (!this.resourceRootUrl) {
        throw new Error('Empty resourceRootUrl')
      }
      const resourceProfileUrl = this.resourceRootUrl + 'profile'
      const profileDataset = await getSolidDataset(resourceProfileUrl, {
        fetch,
      })
      const authStore = useAuthStore()
      const profile = getThing(profileDataset, authStore.webId)
      if (profile) {
        return getStringNoLocale(profile, FOAF.name)
      }
      return ''
    },
    async updateIntoPod(item: FormatContract) {
      const resourceUrl = item.sameAs
      let dataset = await getSolidDataset(resourceUrl, {
        fetch,
      })
      const instrument = getThing(dataset, resourceUrl + '#instrument')

      const modify = buildThing(instrument).addStringNoLocale(
        SCHEMA_INRUPT.description,
        item.instrument.description,
      )
      dataset = setThing(dataset, modify.build())

      return saveSolidDatasetAt(resourceUrl, dataset, {
        fetch,
      })
    },
    async uploadContract(contractData: ContractTable) {
      const authStore = useAuthStore()
      // Step 1: JS
      const resourceName =
        this.getResourceBaseUrl + contractData.startTime.toJSON() + '.ttl'
      contractData.resource_url = resourceName
      if (contractData.id) {
        await db.contracts.where('id').equals(contractData.id).modify({
          resource_url: contractData.resource_url,
        })
      }

      // Step 2: JSON-LD
      const jsldContract = formatterContract(contractData)

      // Step 3: Signed LD
      const credential = formatterLDContract(authStore.webId, jsldContract)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const signedVC = await sign({
        credential: credential,
      })
      const solidDatasetContract = formatterDatasetContract(
        resourceName,
        signedVC,
      )

      return saveSolidDatasetAt(resourceName, solidDatasetContract, {
        fetch,
      })
    },
  },
  getters: {
    getResourceBaseUrl(state): string {
      if (!state.resourceRootUrl) {
        throw new Error('resourceRootUrl is empty')
      }
      return state.resourceRootUrl + name + '/'
    },
    getOidcIssuer(): string {
      return LocalStorage.getItem('oidcIssuer')
    },
  },
})
