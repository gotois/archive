import { LocalStorage } from 'quasar'
import {
  getThing,
  setThing,
  buildThing,
  getSolidDataset,
  createSolidDataset,
  saveSolidDatasetAt,
  getPodUrlAll,
  getThingAll,
  getStringNoLocale,
  deleteSolidDataset,
  SolidDataset,
} from '@inrupt/solid-client'
import {
  getDefaultSession,
  fetch,
  login,
  handleIncomingRedirect,
  onSessionRestore,
  onLogin,
} from '@inrupt/solid-client-authn-browser'
import { FOAF, SCHEMA_INRUPT } from '@inrupt/vocab-common-rdf'
import { FormatContract } from '../types/models'
import pkg from '../../package.json'

const { name } = pkg

export const CLIENT_NAME = 'Contracts'

export const getWebId = (): string => {
  return getDefaultSession().info.webId
}

async function getResourceRootUrl() {
  const { webId } = getDefaultSession().info
  if (!webId) {
    throw new Error('WebId is empty')
  }
  const podsUrl = await getPodUrlAll(webId, {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    fetch,
  })
  if (podsUrl.length === 0) {
    throw new Error('Pods is empty')
  }
  const selectedPod = 0
  if (podsUrl.length > 1) {
    // todo здесь пользователь должен бы самостоятельно выбирать какой Pod будет использовать
    // ...
    // selectedPod = 1 || 2 || ...
  }
  return podsUrl[selectedPod]
}

export async function getResourceBaseUrl() {
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
  const profile = getThing(profileDataset, getWebId())
  if (profile) {
    return getStringNoLocale(profile, FOAF.name)
  }
  return ''
}

export async function initPod() {
  const resourceBaseUrl = await getResourceBaseUrl()
  // hack - у inrupt.net и других провайдеров, при первичной инициализации падает getSolidDataset
  if (!resourceBaseUrl.includes('inrupt.com')) {
    const dataset = createSolidDataset()
    return saveSolidDatasetAt(resourceBaseUrl, dataset, {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      fetch,
    })
  }
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

export function removeFromPod(url: string) {
  const separator = '.'
  const oidcIssuer: string = LocalStorage.getItem('oidcIssuer')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars
  const [_x, ...hostIssuerHost] = new URL(oidcIssuer).host.split(separator)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars
  const [_y, ...hostUrlHost] = new URL(url).host.split(separator)

  if (hostIssuerHost.join() !== hostUrlHost.join()) {
    throw new Error('oidcIssuer not equals to current url')
  }

  return deleteSolidDataset(url, {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    fetch: fetch,
  })
}

export async function removeContractsDataset() {
  const resourceBaseUrl = await getResourceBaseUrl()
  const myDataset = await getSolidDataset(resourceBaseUrl, {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    fetch: fetch,
  })

  const allThing = getThingAll(myDataset)
    .filter((thing) => {
      return thing.url !== myDataset.internal_resourceInfo.sourceIri
    })
    .map((thing) => {
      return removeFromPod(thing.url)
    })

  return Promise.all(allThing)
}

export async function updateIntoPod(item: FormatContract) {
  const resourceUrl = item.sameAs
  let dataset = await getSolidDataset(resourceUrl, {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    fetch,
  })
  const instrument = getThing(dataset, resourceUrl + '#instrument')

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

export function saveToPod(resourceUrl: string, dataset: SolidDataset) {
  return saveSolidDatasetAt(resourceUrl, dataset, {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    fetch,
  })
}

export async function solidAuth({
  redirectUrl = window.location.href,
  sessionRestoreCallback,
  loginCallback,
  oidcIssuer = LocalStorage.getItem('oidcIssuer'),
  restorePreviousSession = false,
}: {
  redirectUrl?: string
  // eslint-disable-next-line no-unused-vars
  sessionRestoreCallback?: (currentUrl: string) => unknown
  // eslint-disable-next-line no-unused-vars
  loginCallback?: () => unknown
  oidcIssuer?: string
  restorePreviousSession?: boolean
}) {
  if (!navigator.onLine) {
    return
  }
  onSessionRestore((url) => {
    sessionRestoreCallback(url)
  })
  onLogin(() => {
    loginCallback()
  })
  const defaultSession = getDefaultSession().info
  const sessionInfo = await handleIncomingRedirect({
    restorePreviousSession,
  })
  if (!oidcIssuer) {
    return
  }
  LocalStorage.set('oidcIssuer', oidcIssuer)
  if (!sessionInfo) {
    return login({
      oidcIssuer,
      redirectUrl,
      clientName: CLIENT_NAME,
    })
  }

  const expiresDate = sessionInfo.expirationDate
  const nowDate = new Date()
  const isExpirationAlive =
    (sessionInfo.expirationDate && expiresDate.valueOf() < nowDate.valueOf()) ??
    false

  if (
    sessionInfo.isLoggedIn ||
    isExpirationAlive ||
    defaultSession.sessionId === sessionInfo.sessionId
  ) {
    return
  }
  return login({
    oidcIssuer,
    redirectUrl,
    clientName: CLIENT_NAME,
  })
}
