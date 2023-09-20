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
  getStringNoLocaleAll,
  getThing,
  getProfileAll,
  getPodUrlAllFrom,
  getDate,
  getThingAll,
  saveSolidDatasetAt,
  setThing,
  createThing,
} from '@inrupt/solid-client'
import { RDF, FOAF, SCHEMA_INRUPT } from '@inrupt/vocab-common-rdf'
import useAuthStore from 'stores/auth'
import useProfileStore from 'stores/profile'
import {
  ProofCredential,
  CredentialSubject,
  CredentialTypes,
  FormatContract,
} from '../types/models'
import pkg from '../../package.json'

const { name } = pkg

interface State {
  resourceRootUrl: string
  oidcIssuer: string
}

export default defineStore('pod', {
  state: (): State => ({
    resourceRootUrl: '',
    oidcIssuer: LocalStorage.getItem('oidcIssuer') ?? '',
  }),
  actions: {
    removeOIDCIssuer() {
      this.oidcIssuer = ''
      LocalStorage.remove('oidcIssuer')
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
    formatterDatasetContract(signedVC: ProofCredential) {
      const getResourceBaseUrl = this.getResourceBaseUrl
      if (typeof getResourceBaseUrl !== 'string') {
        return
      }
      const id = this.getContractId(signedVC.credentialSubject)
      const resourceUrl = getResourceBaseUrl + id + '.ttl'
      const types = signedVC['@context'][1] as unknown as CredentialTypes
      const item = signedVC.credentialSubject
      // type
      const type = buildThing(createThing({ url: resourceUrl + '#type' }))
      signedVC.type.forEach((t) => {
        type.addStringNoLocale(SCHEMA_INRUPT.name, t)
      })
      // type.addUrl(RDF.type, ...) // todo add type

      // issuer
      const issuer = buildThing(
        createThing({ url: resourceUrl + '#issuer' }),
      ).addStringNoLocale(SCHEMA_INRUPT.name, signedVC.issuer)
      // .addUrl(RDF.type, ...) // todo add type

      // issuanceDate
      const issuanceDate = buildThing(
        createThing({ url: resourceUrl + '#issuanceDate' }),
      ).addDate(SCHEMA_INRUPT.dateModified, new Date(signedVC.issuanceDate))
      // .addUrl(RDF.type, ...) // todo add type

      // proof
      const proof = buildThing(createThing({ url: resourceUrl + '#proof' }))
        .addStringNoLocale(
          'https://purl.org/dc/terms/type',
          signedVC.proof.type,
        )
        .addStringNoLocale(
          'https://purl.org/dc/terms/created',
          signedVC.proof.created,
        )
        .addStringNoLocale(
          'https://w3id.org/security/suites/ed25519-2020/v1',
          signedVC.proof.verificationMethod,
        )
        .addStringNoLocale(
          'https://w3c.github.io/vc-data-integrity/vocab/security/vocabulary.html#proofPurpose',
          signedVC.proof.proofPurpose,
        )
        .addStringNoLocale(
          'https://w3c.github.io/vc-data-integrity/vocab/security/vocabulary.html#proofValue',
          signedVC.proof.proofValue,
        )
      // .addUrl(RDF.type, ...) // todo add type

      // Agent: agent_name, agent_email,
      const agent = buildThing(createThing({ url: resourceUrl + '#agent' }))
        .addStringNoLocale(SCHEMA_INRUPT.name, item.agent.name)
        .addUrl(RDF.type, types.agent)
      // EndTime
      const endTime = buildThing(createThing({ url: resourceUrl + '#endTime' }))
      if (item.endTime) {
        endTime
          .addDate(SCHEMA_INRUPT.endTime, new Date(item.endTime))
          .addUrl(RDF.type, types.endTime)
      }
      // Identifier
      const identifier = buildThing(
        createThing({ url: resourceUrl + '#identifier' }),
      )
      // todo - упростить доступ к идентификатору по ключам
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      item.identifier.forEach((ident) => {
        identifier.addStringNoLocale(SCHEMA_INRUPT.name, ident.name)
        identifier.addStringNoLocale(SCHEMA_INRUPT.text, ident.propertyID)
        identifier.addStringNoLocale(SCHEMA_INRUPT.value, ident.value)
      })
      identifier.addUrl(RDF.type, types.identifier)

      // Instrument: instrument_name, instrument_description
      const instrument = buildThing(
        createThing({ url: resourceUrl + '#instrument' }),
      )
        .addStringNoLocale(
          SCHEMA_INRUPT.description,
          item.instrument.description,
        )
        .addStringNoLocale(SCHEMA_INRUPT.name, item.instrument.name)
        .addUrl(RDF.type, types.instrument)
      // Object
      const objectThing = buildThing(
        createThing({ url: resourceUrl + '#object' }),
      )
      item.object.forEach((object) => {
        objectThing.addStringNoLocale(
          SCHEMA_INRUPT.identifier,
          object.encodingFormat,
        )
        objectThing.addUrl(SCHEMA_INRUPT.image, object.contentUrl)
      })
      objectThing.addUrl(RDF.type, types.object)
      // Participant: participant_name, participant_email
      const participant = buildThing(
        createThing({ url: resourceUrl + '#participant' }),
      )
        .addStringNoLocale(SCHEMA_INRUPT.name, item.participant.name)
        .addUrl(RDF.type, types.participant)
      // StartTime
      const startTime = buildThing(
        createThing({ url: resourceUrl + '#startTime' }),
      )
        .addDate(SCHEMA_INRUPT.startTime, new Date(item.startTime))
        .addUrl(RDF.type, types.startTime)

      let dataset = createSolidDataset()
      dataset = setThing(dataset, agent.build())
      dataset = setThing(dataset, type.build())
      dataset = setThing(dataset, proof.build())
      dataset = setThing(dataset, issuer.build())
      dataset = setThing(dataset, issuanceDate.build())
      dataset = setThing(dataset, endTime.build())
      dataset = setThing(dataset, identifier.build())
      dataset = setThing(dataset, instrument.build())
      dataset = setThing(dataset, participant.build())
      dataset = setThing(dataset, startTime.build())
      dataset = setThing(dataset, objectThing.build())

      return dataset
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
      const getResourceBaseUrl = this.getResourceBaseUrl
      if (typeof getResourceBaseUrl !== 'string') {
        return
      }
      // 'profile/card' for inrupt.net
      // todo 'profile' for inrupt.com
      const resourceProfileUrl = getResourceBaseUrl + 'profile/card'
      const profileDataset = await this.getDataset(resourceProfileUrl)
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
      if (!this.resourceRootUrl) {
        throw new Error('Empty Resource Root Url')
      }
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
      if (profileStore.consumer) {
        profile.addStringNoLocale(FOAF.name, profileStore.consumer)
      }
      if (profileStore.email) {
        profile.addStringNoLocale(FOAF.mbox, profileStore.email)
      }
      if (profileStore.avatar) {
        profile.addUrl(FOAF.img, profileStore.avatar)
      }
      const updProfileDataset = setThing(profileDataset, profile.build())

      return this.saveDataset(resourceProfileUrl, updProfileDataset)
    },
    async updateIntoPod(item: FormatContract) {
      const resourceUrl = item.sameAs
      let dataset = await this.getDataset(resourceUrl)
      const instrument = getThing(dataset, resourceUrl + '#instrument')

      const modify = buildThing(instrument).addStringNoLocale(
        SCHEMA_INRUPT.description,
        item.instrument.description,
      )
      dataset = setThing(dataset, modify.build())

      return this.saveDataset(resourceUrl, dataset)
    },
    getContractId(credentialSubject: CredentialSubject) {
      return credentialSubject.identifier.find((v) => v.name === 'Contract')
        .value as string
    },
    async uploadContract(signedVC: ProofCredential) {
      const getResourceBaseUrl = this.getResourceBaseUrl
      if (typeof getResourceBaseUrl !== 'string') {
        return
      }
      const id = this.getContractId(signedVC.credentialSubject)
      const url = getResourceBaseUrl + id + '.ttl'
      const solidDatasetContract = this.formatterDatasetContract(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        signedVC,
      )
      await this.saveDataset(url, solidDatasetContract)
      return url
    },
    async getContractsLink() {
      const getResourceBaseUrl = this.getResourceBaseUrl
      if (typeof getResourceBaseUrl !== 'string') {
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
    // конвертация всех things в формат читаемых контрактов
    async getContract(url: string) {
      const ds = await this.getDataset(url)

      const type = getThing(ds, ds.internal_resourceInfo.sourceIri + '#type')
      const issuer = getThing(
        ds,
        ds.internal_resourceInfo.sourceIri + '#issuer',
      )
      const issuanceDate = getThing(
        ds,
        ds.internal_resourceInfo.sourceIri + '#issuanceDate',
      )
      const proof = getThing(ds, ds.internal_resourceInfo.sourceIri + '#proof')

      const credentialSubject = new Map()
      const agent = getThing(ds, ds.internal_resourceInfo.sourceIri + '#agent')
      credentialSubject.set('agent', {
        name: getStringNoLocale(agent, SCHEMA_INRUPT.name),
        email: getStringNoLocale(agent, SCHEMA_INRUPT.email),
      })
      const instrument = getThing(
        ds,
        ds.internal_resourceInfo.sourceIri + '#instrument',
      )
      credentialSubject.set('instrument', {
        name: getStringNoLocale(instrument, SCHEMA_INRUPT.name),
        description: getStringNoLocale(instrument, SCHEMA_INRUPT.description),
      })
      const startTime = getThing(
        ds,
        ds.internal_resourceInfo.sourceIri + '#startTime',
      )
      credentialSubject.set(
        'startTime',
        getDate(startTime, SCHEMA_INRUPT.startTime),
      )
      const participant = getThing(
        ds,
        ds.internal_resourceInfo.sourceIri + '#participant',
      )
      credentialSubject.set('participant', {
        name: getStringNoLocale(participant, SCHEMA_INRUPT.name),
        email: getStringNoLocale(participant, SCHEMA_INRUPT.email),
        url: getStringNoLocale(participant, SCHEMA_INRUPT.url),
        tel: getStringNoLocale(participant, 'https://schema.org/telephone'),
      })
      const endTime = getThing(
        ds,
        ds.internal_resourceInfo.sourceIri + '#endTime',
      )
      credentialSubject.set('endTime', getDate(endTime, SCHEMA_INRUPT.endDate))

      const identifier = getThing(
        ds,
        ds.internal_resourceInfo.sourceIri + '#identifier',
      )
      // todo refactoring
      credentialSubject.set('identifier', [
        {
          value: getStringNoLocaleAll(identifier, SCHEMA_INRUPT.value)[0],
          name: getStringNoLocaleAll(identifier, SCHEMA_INRUPT.name)[0],
          propertyID: getStringNoLocaleAll(identifier, SCHEMA_INRUPT.text)[0],
        },
        {
          value: getStringNoLocaleAll(identifier, SCHEMA_INRUPT.value)[1],
          name: getStringNoLocaleAll(identifier, SCHEMA_INRUPT.name)[1],
          propertyID: getStringNoLocaleAll(identifier, SCHEMA_INRUPT.text)[1],
        },
      ])

      // todo images
      const object = getThing(
        ds,
        ds.internal_resourceInfo.sourceIri + '#object',
      )
      getStringNoLocaleAll(object, SCHEMA_INRUPT.ImageObject)
      credentialSubject.set('images', [])
      // object.addStringNoLocale(
      //     SCHEMA_INRUPT.identifier,
      //     object.encodingFormat,
      //   )
      //   objectThing.addUrl(SCHEMA_INRUPT.image, object.contentUrl)

      return {
        '@context': [
          'https://www.w3.org/2018/credentials/v1',
          'https://schema.org',
        ],
        'type': getStringNoLocaleAll(type, SCHEMA_INRUPT.name),
        'proof': {
          type: getStringNoLocale(proof, 'https://purl.org/dc/terms/type'),
          created: getStringNoLocale(
            proof,
            'https://purl.org/dc/terms/created',
          ),
          verificationMethod: getStringNoLocale(
            proof,
            'https://w3id.org/security/suites/ed25519-2020/v1',
          ),
          proofPurpose: getStringNoLocale(
            proof,
            'https://w3c.github.io/vc-data-integrity/vocab/security/vocabulary.html#proofPurpose',
          ),
          proofValue: getStringNoLocale(
            proof,
            'https://w3c.github.io/vc-data-integrity/vocab/security/vocabulary.html#proofValue',
          ),
        },
        'issuer': getStringNoLocale(issuer, SCHEMA_INRUPT.name),
        'issuanceDate': getDate(
          issuanceDate,
          SCHEMA_INRUPT.dateModified,
        ).toISOString(),
        'credentialSubject': Object.fromEntries(
          credentialSubject,
        ) as CredentialSubject,
      } as Credential
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
