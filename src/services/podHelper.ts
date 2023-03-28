import {
  getThing,
  setThing,
  buildThing,
  createThing,
  getSolidDataset,
  createSolidDataset,
  saveSolidDatasetAt,
  getPodUrlAll,
  getThingAll,
  getStringNoLocale,
} from '@inrupt/solid-client'
import { getDefaultSession, fetch } from '@inrupt/solid-client-authn-browser'
import { RDF, FOAF, SCHEMA_INRUPT } from '@inrupt/vocab-common-rdf'
import { FormatContract } from '../types/models'
import pkg from '../../package.json'

const { name } = pkg

export const OIDC_ISSUER = 'https://login.inrupt.com'
export const CLIENT_NAME = 'Contracts'

async function getResourceRootUrl() {
  const podsUrl = await getPodUrlAll(getDefaultSession().info.webId, {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    fetch,
  })
  const selectedPod = 0
  if (podsUrl.length > 1) {
    // todo здесь пользователь должен бы самостоятельно выбирать какой Pod будет использовать
    // ...
    // selectedPod = 1 || 2 || ...
  }
  return podsUrl[selectedPod]
}

async function getResourceBaseUrl() {
  const url = (await getResourceRootUrl()) + name + '/'
  return url
}

export async function getProfileName() {
  const resourceProfileUrl = (await getResourceRootUrl()) + 'profile'
  const profileDataset = await getSolidDataset(resourceProfileUrl, {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    fetch,
  })
  const profile = getThing(profileDataset, getDefaultSession().info.webId)

  return getStringNoLocale(profile, FOAF.name)
}

export async function initPod() {
  const resourceBaseUrl = await getResourceBaseUrl()
  const myBaseDataset = await getSolidDataset(resourceBaseUrl, {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    fetch,
  })
  const hasAnyContracts = getThingAll(myBaseDataset).some(({ url }) =>
    url.includes(name),
  )
  if (!hasAnyContracts) {
    return saveSolidDatasetAt(resourceBaseUrl, myBaseDataset, {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      fetch,
    })
  }
}

export async function updateIntoPod(item: FormatContract) {
  const dogovorName = item.startTime.toJSON()
  const resourceBaseUrl = await getResourceBaseUrl()
  const resourceUrl = resourceBaseUrl + dogovorName
  let dataset = await getSolidDataset(resourceUrl, {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    fetch,
  })
  const instrument = getThing(dataset, resourceUrl + '#instrument')

  // const example = getStringNoLocale(instrument, SCHEMA_INRUPT.description)
  // console.log('description variable: ', example)

  const modify = buildThing(instrument).addStringNoLocale(
    SCHEMA_INRUPT.description,
    item.instrument.description,
  )
  dataset = setThing(dataset, modify.build())

  return saveSolidDatasetAt(resourceUrl, dataset, {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    fetch,
  })
}

export async function saveToPod(item: FormatContract) {
  const dogovorName = item.startTime.toJSON()
  const resourceBaseUrl = await getResourceBaseUrl()
  const resourceUrl = resourceBaseUrl + dogovorName
  const agent = buildThing(createThing({ url: resourceUrl + '#agent' }))
    .addStringNoLocale(SCHEMA_INRUPT.name, item.agent.name)
    .addUrl(RDF.type, 'https://schema.org/Person')
  const endTime = buildThing(createThing({ url: resourceUrl + '#endTime' }))
  if (item.endTime) {
    endTime
      .addDate(SCHEMA_INRUPT.endTime, item.endTime)
      .addUrl(RDF.type, 'https://schema.org/endTime')
  }
  const identifier = buildThing(
    createThing({ url: resourceUrl + '#identifier' }),
  )
    .addStringNoLocale(SCHEMA_INRUPT.identifier, item.identifier.value)
    .addUrl(RDF.type, 'https://schema.org/PropertyValue')
  const instrument = buildThing(
    createThing({ url: resourceUrl + '#instrument' }),
  )
    .addStringNoLocale(SCHEMA_INRUPT.description, item.instrument.description)
    .addStringNoLocale(SCHEMA_INRUPT.name, item.instrument.name)
    .addUrl(RDF.type, 'https://schema.org/Thing')
  const objectThing = buildThing(createThing({ url: resourceUrl + '#object' }))
  item.object.forEach((object) => {
    objectThing.addUrl(SCHEMA_INRUPT.image, object.contentUrl)
  })
  objectThing.addUrl(RDF.type, 'https://schema.org/ImageObject')
  const participant = buildThing(
    createThing({ url: resourceUrl + '#participant' }),
  )
    .addStringNoLocale(SCHEMA_INRUPT.name, item.participant.name)
    .addUrl(RDF.type, 'https://schema.org/Person')
  const startTime = buildThing(createThing({ url: resourceUrl + '#startTime' }))
    .addDate(SCHEMA_INRUPT.startTime, item.startTime)
    .addUrl(RDF.type, 'https://schema.org/startTime')

  let dataset = createSolidDataset()
  dataset = setThing(dataset, agent.build())
  dataset = setThing(dataset, endTime.build())
  dataset = setThing(dataset, identifier.build())
  dataset = setThing(dataset, instrument.build())
  dataset = setThing(dataset, participant.build())
  dataset = setThing(dataset, startTime.build())
  dataset = setThing(dataset, objectThing.build())

  return saveSolidDatasetAt(resourceUrl, dataset, {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    fetch,
  })
}
