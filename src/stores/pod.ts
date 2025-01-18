import { LocalStorage } from 'quasar'
import { defineStore } from 'pinia'
import { fetch } from '@inrupt/solid-client-authn-browser'
import {
  SolidDataset,
  buildThing,
  createSolidDataset,
  deleteSolidDataset,
  getSolidDataset,
  getStringNoLocale,
  getThing,
  getProfileAll,
  getPodUrlAllFrom,
  getThingAll,
  saveSolidDatasetAt,
  setThing,
  createThing,
} from '@inrupt/solid-client'
import { RDF, FOAF, SCHEMA_INRUPT } from '@inrupt/vocab-common-rdf'
import useAuthStore from 'stores/auth'
import useProfileStore from 'stores/profile'
import pkg from '../../package.json'

const { name } = pkg

interface State {
  resourceRootUrl: string
  oidcIssuer: string
  dataset: SolidDataset
}

export default defineStore('pod', {
  state: (): State => ({
    resourceRootUrl: '',
    oidcIssuer: LocalStorage.getItem('oidcIssuer') ?? '',
    dataset: createSolidDataset(),
  }),
  actions: {
    removeOIDCIssuer() {
      this.oidcIssuer = ''
      LocalStorage.removeItem('oidcIssuer')
    },
    setOIDCIssuer(oidcIssuer: string) {
      this.oidcIssuer = oidcIssuer
      LocalStorage.set('oidcIssuer', oidcIssuer)
    },
    async initPod() {
      const getResourceBaseUrl = this.getResourceBaseUrl
      if (typeof getResourceBaseUrl !== 'string') {
        return
      }
      try {
        const dataset = createSolidDataset()
        await this.saveDataset(getResourceBaseUrl, dataset)
      } catch (e) {
        console.warn('already init', e)
      }
      const myBaseDataset = await this.getDataset(getResourceBaseUrl)
      const hasAnyContracts = getThingAll(myBaseDataset).some(({ url }) =>
        url.includes(name),
      )
      if (!hasAnyContracts) {
        return this.saveDataset(getResourceBaseUrl, myBaseDataset)
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
      const getResourceBaseUrl = this.getResourceBaseUrl
      if (typeof getResourceBaseUrl !== 'string') {
        return
      }
      const myDataset = await this.getDataset(getResourceBaseUrl)

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
        throw new Error('WebID is empty')
      }
      const profile = await getProfileAll(authStore.webId, {
        fetch,
      })
      const podsUrl = getPodUrlAllFrom(profile, authStore.webId)
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
    async getProfileFOAF() {
      if (typeof this.resourceRootUrl !== 'string') {
        return
      }
      const getResourceBaseUrl = this.resourceRootUrl
      let profileDataset = null
      // 'profile/card' for inrupt.net
      if (!profileDataset) {
        try {
          const resourceProfileUrl = getResourceBaseUrl + 'profile/card'
          profileDataset = await this.getDataset(resourceProfileUrl)
        } catch {
          /* empty */
        }
      }
      // 'profile' for inrupt.com
      if (!profileDataset) {
        try {
          const resourceProfileUrl = getResourceBaseUrl + 'profile'
          profileDataset = await this.getDataset(resourceProfileUrl)
        } catch {
          /* empty */
        }
      }
      const authStore = useAuthStore()
      const profile = getThing(profileDataset, authStore.webId)
      if (profile) {
        return {
          name: getStringNoLocale(profile, FOAF.name),
          email: getStringNoLocale(profile, FOAF.mbox),
          avatar: getStringNoLocale(profile, FOAF.img),
        }
      }
      return {
        name: null,
        email: null,
        avatar: null,
      }
    },
    getDataset(resource: string) {
      if (!resource) {
        throw new Error('Empty Resource Folder')
      }
      return getSolidDataset(resource, {
        fetch,
      })
    },
    saveDataset(resource: string, dataset: SolidDataset) {
      return saveSolidDatasetAt(resource, dataset, {
        fetch,
      })
    },
    async setProfileFOAF() {
      const resourceProfileUrl = this.resourceRootUrl + 'profile'
      const profileDataset = await this.getDataset(resourceProfileUrl)
      const authStore = useAuthStore()
      const profileStore = useProfileStore()

      const profile = buildThing(createThing({ url: authStore.webId }))
      profile.addStringNoLocale(FOAF.name, profileStore.getPersonLD.name)
      if (profileStore.email) {
        profile.addStringNoLocale(FOAF.mbox, profileStore.email)
      }
      if (profileStore.avatar) {
        profile.addUrl(FOAF.img, profileStore.avatar)
      }
      const updProfileDataset = setThing(profileDataset, profile.build())

      return this.saveDataset(resourceProfileUrl, updProfileDataset)
    },
    async uploadIcal(resourceUrl: string, ical: string) {
      let ds: SolidDataset = null
      try {
        ds = await getSolidDataset(resourceUrl, {
          fetch,
        })
      } catch (error) {
        ds = this.dataset
        console.error(error)
      }

      const icalThing = buildThing(
        createThing({
          url: resourceUrl + '#ical',
        }),
      ).addStringNoLocale(RDF.type, ical)
      ds = setThing(ds, icalThing.build())

      console.log('ds', ds)
      return this.saveDataset(resourceUrl, ds)
    },
    async updateIntoPod(resourceUrl: string) {
      alert('WIP')
      let ds = await this.getDataset(resourceUrl)
      const instrument = getThing(ds, resourceUrl + '#instrument')

      const modify = buildThing(instrument).addStringNoLocale(
        SCHEMA_INRUPT.description,
        'my description',
      )
      ds = setThing(ds, modify.build())

      return this.saveDataset(resourceUrl, ds)
    },
    /* fixme поддержать
    getContractId(credentialSubject: CredentialSubject) {
      return credentialSubject.identifier.find((v) => v.name === 'Contract')
        .value as string
    },
     */
    /* fixme поддержать
    upload(resourceUrl: string, solidDatasetContract: SolidDataset) {
      return this.saveDataset(resourceUrl, solidDatasetContract)
    },
     */
    async getContractsLink() {
      const getResourceBaseUrl = this.getResourceBaseUrl
      if (typeof getResourceBaseUrl !== 'string') {
        // throw new Error('ResourceBaseUrl is empty')
        return
      }
      const myBaseDataset = await this.getDataset(getResourceBaseUrl)
      return getThingAll(myBaseDataset)
        .map(({ url }) => {
          return url
        })
        .filter((url: string) => {
          return url.endsWith('.ttl')
        })
    },
  },
  getters: {
    getResourceBaseUrl(state): string | Error {
      if (!state.resourceRootUrl) {
        throw new Error('resourceRootUrl is empty')
      }
      return state.resourceRootUrl + name + '/'
    },
    getOidcIssuer(state): string {
      return state.oidcIssuer
    },
  },
})
